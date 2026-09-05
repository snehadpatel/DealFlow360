"""Business rule engine: discount limits and rule-conflict detection.

Several independent rules can constrain the discount on a line:

    * PRODUCT  - the product's own ``discount_ceiling`` (most specific)
    * CATEGORY - a per-category maximum
    * TIER     - a per-customer-tier maximum
    * GLOBAL   - a company-wide hard cap

These frequently *disagree* (e.g. a GOLD customer is allowed 15% but the Server
category caps at 10%). This engine resolves the effective limit and, crucially,
reports the conflict and which rule wins so the outcome is explainable.

Resolution policy: the **most restrictive** applicable limit binds (safest for
discounting). When several rules tie at that limit, the highest-priority (most
specific) rule is named as the winner. All functions are pure and testable.
"""
from typing import Iterable, Mapping, Optional

from app.models.customer import Tier


CATEGORY_MAX_DISCOUNT: dict[str, float] = {
    "Hardware": 10.0,
    "Services": 25.0,
    "Subscription": 20.0,
}

TIER_MAX_DISCOUNT: dict[str, float] = {
    Tier.GOLD.value: 15.0,
    Tier.SILVER.value: 12.0,
    Tier.BRONZE.value: 8.0,
}

GLOBAL_MAX_DISCOUNT = 30.0

# Most specific first. Used only to break ties when two rules share the min limit.
RULE_PRIORITY = ["PRODUCT", "CATEGORY", "TIER", "GLOBAL"]


def resolve_discount_limit(
    category: str,
    tier: str,
    product_ceiling: Optional[float] = None,
) -> dict:
    """Resolve the effective discount limit for a (category, tier, product) combo.

    Returns the applicable rules, the effective (binding) limit, the winning
    rule, and any conflict description.
    """
    applicable: dict[str, float] = {}
    if product_ceiling is not None:
        applicable["PRODUCT"] = float(product_ceiling)
    if category in CATEGORY_MAX_DISCOUNT:
        applicable["CATEGORY"] = CATEGORY_MAX_DISCOUNT[category]
    tier_key = str(tier).upper()
    if tier_key in TIER_MAX_DISCOUNT:
        applicable["TIER"] = TIER_MAX_DISCOUNT[tier_key]
    applicable["GLOBAL"] = GLOBAL_MAX_DISCOUNT

    effective_limit = min(applicable.values())

    # Winner = the highest-priority rule among those at the most-restrictive limit.
    binding_rule = min(
        (r for r, v in applicable.items() if v == effective_limit),
        key=lambda r: RULE_PRIORITY.index(r) if r in RULE_PRIORITY else len(RULE_PRIORITY),
    )

    distinct_limits = set(applicable.values())
    has_conflict = len(distinct_limits) > 1
    conflicts: list[str] = []
    if has_conflict:
        detail = ", ".join(f"{r}={v:g}%" for r, v in applicable.items())
        conflicts.append(
            f"Discount limits disagree ({detail}); "
            f"{binding_rule} rule binds at {effective_limit:g}%."
        )

    return {
        "applicable": applicable,
        "effective_limit": effective_limit,
        "binding_rule": binding_rule,
        "has_conflict": has_conflict,
        "conflicts": conflicts,
    }


def evaluate_line(
    category: str,
    tier: str,
    requested_discount: float,
    product_ceiling: Optional[float] = None,
) -> dict:
    """Evaluate a single line's requested discount against the effective limit."""
    resolution = resolve_discount_limit(category, tier, product_ceiling)
    effective_limit = resolution["effective_limit"]
    exceeds = requested_discount > effective_limit + 1e-9
    return {
        **resolution,
        "requested_discount": requested_discount,
        "exceeds_limit": exceeds,
        "overage": round(max(0.0, requested_discount - effective_limit), 4),
    }


def evaluate_quote(lines: Iterable[Mapping], tier: str) -> dict:
    """Evaluate every line of a quote.

    ``lines`` items are mappings with ``category``, ``requested_discount`` and
    optionally ``product_ceiling`` and ``product_id``/``product_name``.
    Returns aggregated conflicts and any lines that exceed their limit.
    """
    conflicts: list[str] = []
    violations: list[dict] = []
    evaluated: list[dict] = []

    for line in lines:
        result = evaluate_line(
            category=line.get("category", ""),
            tier=tier,
            requested_discount=line.get("requested_discount", 0.0),
            product_ceiling=line.get("product_ceiling"),
        )
        label = line.get("product_name") or str(line.get("product_id", "line"))
        for c in result["conflicts"]:
            conflicts.append(f"{label}: {c}")
        if result["exceeds_limit"]:
            violations.append(
                {
                    "product": label,
                    "requested_discount": result["requested_discount"],
                    "effective_limit": result["effective_limit"],
                    "binding_rule": result["binding_rule"],
                    "overage": result["overage"],
                }
            )
        evaluated.append({"product": label, **result})

    return {
        "conflicts": conflicts,
        "violations": violations,
        "has_conflict": bool(conflicts),
        "has_violation": bool(violations),
        "lines": evaluated,
    }
