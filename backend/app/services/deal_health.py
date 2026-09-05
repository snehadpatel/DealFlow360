"""Transparent deal-health score (0–100), no LLM.

A single glass-box number for "how healthy is this quote", decomposed into five
weighted sub-scores that are each returned to the UI so the score is never a
black box — a judge can see *why* a deal is AMBER, not just that it is::

    margin              0.30   gross-margin health of the quote
    discount_discipline 0.25   how far discounts sit over policy ceilings
    approval            0.15   how heavy the required sign-off chain is
    velocity            0.15   is it moving, or stalled past SLA
    anomaly             0.15   is any discount statistically abnormal

Bands: GREEN >= 75, AMBER 50–74, RED < 50. Inputs are plain numbers/severities
(computed upstream by ``pricing_policy`` and ``anomaly``), so this module has no
DB or model dependency and is trivially testable.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

WEIGHTS = {
    "margin": 0.30,
    "discount_discipline": 0.25,
    "approval": 0.15,
    "velocity": 0.15,
    "anomaly": 0.15,
}

GREEN_MIN = 75.0
AMBER_MIN = 50.0

# Sub-score for a categorical severity (velocity/anomaly).
_SEVERITY_SCORE = {"NONE": 100.0, "LOW": 60.0, "MEDIUM": 35.0, "HIGH": 12.0}
# Sub-score for the approval burden by chain length.
_APPROVAL_SCORE = {0: 100.0, 1: 60.0, 2: 30.0}

MARGIN_FULL_HEALTH_PCT = 40.0   # >=40% gross margin scores a perfect 100
OVERAGE_ZERO_SCORE_PP = 20.0    # 20pp of summed overage drives discipline to 0


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


@dataclass
class HealthFeature:
    name: str
    score: float           # 0-100 sub-score
    weight: float
    contribution: float    # score * weight (points toward the overall)
    detail: str


@dataclass
class DealHealth:
    score: float           # 0-100 overall
    band: str              # GREEN | AMBER | RED
    features: List[HealthFeature] = field(default_factory=list)


def _band(score: float) -> str:
    if score >= GREEN_MIN:
        return "GREEN"
    if score >= AMBER_MIN:
        return "AMBER"
    return "RED"


def score_deal(
    margin_pct: float,
    total_overage_pp: float,
    approval_chain: list,
    stall_severity: str = "NONE",
    anomaly_severity: str = "NONE",
) -> DealHealth:
    """Compute the weighted health score from pre-computed glass-box inputs."""
    margin_score = _clamp(margin_pct / MARGIN_FULL_HEALTH_PCT * 100.0)
    discipline_score = _clamp(100.0 - (max(0.0, total_overage_pp) / OVERAGE_ZERO_SCORE_PP) * 100.0)
    approval_score = _APPROVAL_SCORE.get(len(approval_chain or []), 30.0)
    velocity_score = _SEVERITY_SCORE.get((stall_severity or "NONE").upper(), 100.0)
    anomaly_score = _SEVERITY_SCORE.get((anomaly_severity or "NONE").upper(), 100.0)

    raw = {
        "margin": (margin_score, f"Gross margin {margin_pct:.0f}% (100 at >={MARGIN_FULL_HEALTH_PCT:.0f}%)."),
        "discount_discipline": (discipline_score, f"Summed overage {total_overage_pp:.1f}pp over ceilings."),
        "approval": (approval_score, f"Approval chain: {', '.join(approval_chain) if approval_chain else 'auto-approve'}."),
        "velocity": (velocity_score, f"Stall severity: {stall_severity}."),
        "anomaly": (anomaly_score, f"Discount anomaly severity: {anomaly_severity}."),
    }

    features: List[HealthFeature] = []
    overall = 0.0
    for name, weight in WEIGHTS.items():
        sub, detail = raw[name]
        contribution = round(sub * weight, 2)
        overall += contribution
        features.append(HealthFeature(name=name, score=round(sub, 2), weight=weight,
                                      contribution=contribution, detail=detail))

    overall = round(overall, 2)
    return DealHealth(score=overall, band=_band(overall), features=features)
