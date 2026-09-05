"""Blended quotation risk engine.

Produces a single 0-100 ``blended_risk`` score from four independent components,
each also scaled to 0-100 and combined with configurable weights:

    * discount risk  - how aggressive the (revenue-weighted) discount is
    * margin risk    - how thin the resulting margin is
    * tier risk      - how trusted the customer is (GOLD < SILVER < BRONZE)
    * category risk  - inherent risk of the product mix

The score maps to a level used by the approval router::

    0-30   -> LOW
    31-60  -> MEDIUM
    61-100 -> HIGH

All functions here are pure (no database / ORM), which keeps the scoring
deterministic, unit-testable, and reusable from any layer.
"""
from dataclasses import dataclass, field
from typing import Iterable, Mapping

from app.models.customer import Tier
from app.models.quotation import RiskLevel


# --- Tunable reference points & weights -----------------------------------

# A revenue-weighted discount at or above this % is treated as maximum discount risk.
REFERENCE_MAX_DISCOUNT = 30.0

# Net margin % at/above which margin risk is zero; at 0% margin, risk is maximal.
TARGET_MARGIN_PERCENT = 40.0

TIER_RISK: dict[str, float] = {
    Tier.GOLD.value: 10.0,
    Tier.SILVER.value: 30.0,
    Tier.BRONZE.value: 55.0,
}

CATEGORY_RISK: dict[str, float] = {
    "Hardware": 35.0,
    "Services": 25.0,
    "Subscription": 15.0,
}

DEFAULT_TIER_RISK = 40.0
DEFAULT_CATEGORY_RISK = 30.0


@dataclass(frozen=True)
class RiskWeights:
    """Relative weights of each component in the blended score (need not sum to 1;
    the blend normalises by the total weight)."""
    discount: float = 0.35
    margin: float = 0.30
    tier: float = 0.15
    category: float = 0.20


DEFAULT_WEIGHTS = RiskWeights()


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


# --- Component scores ------------------------------------------------------

def calculate_discount_risk(weighted_discount_percent: float) -> float:
    """Higher revenue-weighted discount -> higher risk (0-100)."""
    if REFERENCE_MAX_DISCOUNT <= 0:
        return 0.0
    return round(_clamp(weighted_discount_percent / REFERENCE_MAX_DISCOUNT * 100.0), 2)


def calculate_customer_tier_risk(customer_tier: str) -> float:
    """Less trusted tiers carry more risk (0-100)."""
    return TIER_RISK.get(str(customer_tier).upper(), DEFAULT_TIER_RISK)


def calculate_margin_risk(margin_percent: float) -> float:
    """Thinner margins -> higher risk (0-100). At/above target margin, risk is 0."""
    if TARGET_MARGIN_PERCENT <= 0:
        return 0.0
    return round(_clamp((TARGET_MARGIN_PERCENT - margin_percent) / TARGET_MARGIN_PERCENT * 100.0), 2)


def calculate_category_risk(lines: Iterable[Mapping]) -> float:
    """Revenue-weighted average of per-category base risk (0-100).

    Each line is a mapping with ``category`` and ``weight`` (gross line revenue).
    """
    lines = list(lines)
    total_weight = sum(max(0.0, l.get("weight", 0.0)) for l in lines)
    if total_weight <= 0:
        return DEFAULT_CATEGORY_RISK
    weighted = sum(
        CATEGORY_RISK.get(l.get("category", ""), DEFAULT_CATEGORY_RISK)
        * (max(0.0, l.get("weight", 0.0)) / total_weight)
        for l in lines
    )
    return round(weighted, 2)


def weighted_discount_percent(lines: Iterable[Mapping]) -> float:
    """Revenue-weighted average discount % across lines (weight = gross revenue)."""
    lines = list(lines)
    total_weight = sum(max(0.0, l.get("weight", 0.0)) for l in lines)
    if total_weight <= 0:
        return 0.0
    return round(
        sum(l.get("discount_percent", 0.0) * (max(0.0, l.get("weight", 0.0)) / total_weight) for l in lines),
        4,
    )


# --- Blended score ---------------------------------------------------------

def calculate_blended_risk(
    discount_risk: float,
    margin_risk: float,
    tier_risk: float,
    category_risk: float,
    weights: RiskWeights = DEFAULT_WEIGHTS,
) -> float:
    """Weighted, normalised blend of the four component scores (0-100)."""
    total_w = weights.discount + weights.margin + weights.tier + weights.category
    if total_w <= 0:
        return 0.0
    blended = (
        discount_risk * weights.discount
        + margin_risk * weights.margin
        + tier_risk * weights.tier
        + category_risk * weights.category
    ) / total_w
    return round(_clamp(blended), 2)


def get_risk_level(blended_risk: float) -> RiskLevel:
    """Map a 0-100 blended score to LOW / MEDIUM / HIGH."""
    if blended_risk <= 30:
        return RiskLevel.LOW
    if blended_risk <= 60:
        return RiskLevel.MEDIUM
    return RiskLevel.HIGH


def assess(
    lines: Iterable[Mapping],
    customer_tier: str,
    margin_percent: float,
    weights: RiskWeights = DEFAULT_WEIGHTS,
) -> dict:
    """Full assessment entry point.

    ``lines`` items are mappings with ``category``, ``discount_percent`` and
    ``weight`` (gross line revenue). Returns the four component scores, the
    blended score, and the resulting level.
    """
    lines = list(lines)
    w_discount = weighted_discount_percent(lines)
    discount_risk = calculate_discount_risk(w_discount)
    margin_risk = calculate_margin_risk(margin_percent)
    tier_risk = calculate_customer_tier_risk(customer_tier)
    category_risk = calculate_category_risk(lines)
    blended = calculate_blended_risk(discount_risk, margin_risk, tier_risk, category_risk, weights)
    level = get_risk_level(blended)
    return {
        "weighted_discount_percent": w_discount,
        "discount_risk": discount_risk,
        "margin_risk": margin_risk,
        "tier_risk": tier_risk,
        "category_risk": category_risk,
        "blended_risk": blended,
        "risk_level": level.value,
    }
