"""Deterministic calculation logic for pricing, discounts, approvals, and splits."""

def calculate_blended_discount_risk(lines: list, customer_tier: str) -> float:
    """Calculates a weighted discount risk score based on category ceilings and customer tier."""
    tier_weights = {"BRONZE": 1.2, "SILVER": 1.0, "GOLD": 0.8}
    weight = tier_weights.get(customer_tier.upper(), 1.0)
    
    total_revenue = sum(l.get("line_total", 0) for l in lines)
    if total_revenue == 0:
        return 0.0
    
    weighted_discount = sum(l.get("discount_percent", 0) * (l.get("line_total", 0) / total_revenue) for l in lines)
    return round(weighted_discount * weight, 2)

def determine_approval_chain(blended_risk: float) -> list:
    """Determines whether quotation requires Manager or Finance sign-off."""
    if blended_risk <= 10.0:
        return []
    elif blended_risk <= 20.0:
        return ["MANAGER"]
    else:
        return ["MANAGER", "FINANCE"]

def recommend_warehouse_split(required_qty: int, warehouses_stock: list) -> list:
    """Allocates units across warehouses based on available stock."""
    allocations = []
    remaining = required_qty
    for wh in sorted(warehouses_stock, key=lambda x: x["available_units"], reverse=True):
        if remaining <= 0:
            break
        take = min(wh["available_units"], remaining)
        allocations.append({"warehouse_id": wh["warehouse_id"], "allocated": take})
        remaining -= take
    return allocations
