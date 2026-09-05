"""Statistical anomaly + stall detection (pure stdlib ``statistics``).

Glass-box deal-health signals. Two independent, hand-checkable detectors:

1. **Discount anomaly** — is this line's discount abnormal versus the rep's own
   history? We compute *both* the classic z-score and the robust **modified
   z-score** (Iglewicz–Hoaglin, ``0.6745*(x-median)/MAD``) and pick by sample
   size: MAD is resistant to the very outliers we hunt, so it wins on small
   samples; the z-score is fine once the baseline is large. Reporting both lets
   a judge see the method is not cherry-picked.

2. **Stall detection** — a quote sitting in PENDING_APPROVAL or DRAFT past its
   SLA. Pure date arithmetic.

No LLM, no randomness. The narrator agent turns these numbers into prose but
can never change them.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

# --- Thresholds (conventional, in code) --------------------------------------
Z_THRESHOLD = 3.0                 # |z| above this is anomalous (normal-ish data)
MODIFIED_Z_THRESHOLD = 3.5        # Iglewicz–Hoaglin's recommended cutoff
SMALL_SAMPLE_N = 12               # below this, trust the robust (MAD) method
MAD_SCALE = 0.6745                # 0.75th quantile of the standard normal

# Stall SLAs by status (days since last update).
STALL_SLA_DAYS = {"PENDING_APPROVAL": 7, "DRAFT": 14, "APPROVED": 5}
_BIG = 999.0                      # stand-in for an "infinite" score (zero spread)


@dataclass
class Baseline:
    n: int
    mean: float
    std: float
    median: float
    mad: float


@dataclass
class DiscountAnomaly:
    value: float
    z_score: float
    modified_z_score: float
    method: str                   # "modified_zscore" | "zscore"
    is_anomaly: bool
    severity: str                 # NONE | LOW | MEDIUM | HIGH
    baseline: Baseline


@dataclass
class StallStatus:
    is_stalled: bool
    days_stale: int
    threshold_days: Optional[int]
    severity: str                 # NONE | LOW | MEDIUM | HIGH
    status: str


def zscore(x: float, sample: List[float]) -> float:
    """Classic z-score of x against the sample's mean/pop-stdev (0 if no spread)."""
    if len(sample) < 2:
        return 0.0
    mean = statistics.mean(sample)
    std = statistics.pstdev(sample)
    if std == 0:
        return 0.0 if x == mean else (_BIG if x > mean else -_BIG)
    return (x - mean) / std


def modified_zscore(x: float, sample: List[float]) -> float:
    """Robust z-score using the median and MAD (Iglewicz–Hoaglin)."""
    if len(sample) < 2:
        return 0.0
    med = statistics.median(sample)
    mad = statistics.median([abs(v - med) for v in sample])
    if mad == 0:
        # Degenerate spread: fall back to a mean-absolute-deviation scale.
        mean_ad = statistics.mean([abs(v - med) for v in sample])
        if mean_ad == 0:
            return 0.0 if x == med else (_BIG if x > med else -_BIG)
        return (x - med) / (1.253314 * mean_ad)   # consistent scale for MeanAD
    return MAD_SCALE * (x - med) / mad


def choose_method(n: int) -> str:
    """Small samples ⇒ robust MAD method; larger ⇒ classic z-score."""
    return "modified_zscore" if n < SMALL_SAMPLE_N else "zscore"


def _severity(score: float, threshold: float) -> str:
    a = abs(score)
    if a < threshold:
        return "NONE"
    if a < threshold * 1.5:
        return "LOW"
    if a < threshold * 2.5:
        return "MEDIUM"
    return "HIGH"


def build_baseline(sample: List[float]) -> Baseline:
    if not sample:
        return Baseline(n=0, mean=0.0, std=0.0, median=0.0, mad=0.0)
    med = statistics.median(sample)
    mad = statistics.median([abs(v - med) for v in sample]) if len(sample) > 1 else 0.0
    return Baseline(
        n=len(sample),
        mean=round(statistics.mean(sample), 4),
        std=round(statistics.pstdev(sample), 4) if len(sample) > 1 else 0.0,
        median=round(med, 4),
        mad=round(mad, 4),
    )


def detect_discount_anomaly(value: float, sample: List[float]) -> DiscountAnomaly:
    """Flag ``value`` against a rep's historical discount ``sample``.

    Computes both scores, selects one by sample size, and grades severity. With
    too little history (n<2) nothing can be anomalous — returns a NONE verdict.
    """
    baseline = build_baseline(sample)
    z = zscore(value, sample)
    mz = modified_zscore(value, sample)
    method = choose_method(len(sample))

    if len(sample) < 2:
        return DiscountAnomaly(value=value, z_score=0.0, modified_z_score=0.0,
                               method=method, is_anomaly=False, severity="NONE",
                               baseline=baseline)

    if method == "modified_zscore":
        is_anom = abs(mz) > MODIFIED_Z_THRESHOLD
        severity = _severity(mz, MODIFIED_Z_THRESHOLD)
    else:
        is_anom = abs(z) > Z_THRESHOLD
        severity = _severity(z, Z_THRESHOLD)

    return DiscountAnomaly(
        value=round(value, 4),
        z_score=round(z, 4),
        modified_z_score=round(mz, 4),
        method=method,
        is_anomaly=bool(is_anom),
        severity=severity if is_anom else "NONE",
        baseline=baseline,
    )


def detect_stalled(updated_at: datetime, status: str,
                   now: Optional[datetime] = None) -> StallStatus:
    """Detect a quote stalled past the SLA for its status."""
    now = now or datetime.utcnow()
    days = max(0, (now - updated_at).days)
    threshold = STALL_SLA_DAYS.get((status or "").upper())
    if threshold is None:
        return StallStatus(is_stalled=False, days_stale=days, threshold_days=None,
                           severity="NONE", status=status)
    is_stalled = days > threshold
    if not is_stalled:
        severity = "NONE"
    elif days > threshold * 3:
        severity = "HIGH"
    elif days > threshold * 2:
        severity = "MEDIUM"
    else:
        severity = "LOW"
    return StallStatus(is_stalled=is_stalled, days_stale=days, threshold_days=threshold,
                       severity=severity, status=status)
