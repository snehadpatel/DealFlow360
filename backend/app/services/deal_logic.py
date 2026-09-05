"""DEPRECATED — superseded by ``app.services.pricing_policy``.

This module previously held the deterministic calculations, but its
``calculate_blended_discount_risk`` was incorrect (it computed a revenue-
weighted *average* discount and ignored per-product ceilings, instead of the
spec's *sum of per-line overages* against the stricter of tier/category
ceiling). It had no callers.

The correct, spec-compliant logic now lives in ``pricing_policy``. The two
functions that were always correct are re-exported here so any lingering
import keeps working; prefer importing them from ``pricing_policy`` directly.
"""
from app.services.pricing_policy import (  # noqa: F401
    blended_risk,
    determine_approval_chain,
    recommend_warehouse_split,
)
