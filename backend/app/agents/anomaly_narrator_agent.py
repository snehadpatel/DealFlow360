"""Anomaly / stall narration agent.

Turns the numbers from ``services.anomaly`` into a plain-language explanation
and a recommended action. The verdict (is_anomaly, scores, baseline, stall
days) is computed upstream and passed in; the LLM only rephrases it. On any LLM
failure a deterministic template quotes the identical figures.
"""
from __future__ import annotations

from typing import Optional

from app.schemas.ai_schemas import (AnomalyNarrativeResponse, AnomalyStats, AnomalyNarration)
from app.services.anomaly import DiscountAnomaly, StallStatus
from app.agents.llm_runtime import run_structured, llm_available

_SYSTEM = ("You explain B2B deal risk to a sales manager. Be precise and calm. "
           "Do NOT invent or change any number; only translate the provided "
           "evidence into two clear sentences and one action.")

_HUMAN = ("Deal {deal_id}. Evidence:\n{evidence}\n"
          "Write a 2-sentence narrative explaining what is off (or that it looks healthy) "
          "and one concrete recommended action.")


def _chosen_score(a: DiscountAnomaly) -> float:
    return a.modified_z_score if a.method == "modified_zscore" else a.z_score


def _method_label(method: str) -> str:
    return "modified z-score" if method == "modified_zscore" else "z-score"


def _build_evidence(deal_id: str, line_name: str, anomaly: Optional[DiscountAnomaly],
                    stall: Optional[StallStatus]) -> str:
    parts = []
    if anomaly and anomaly.is_anomaly:
        b = anomaly.baseline
        parts.append(f"- '{line_name}' discount {anomaly.value:.1f}% is an outlier vs this rep's "
                     f"baseline (mean {b.mean:.1f}%, std {b.std:.1f}, median {b.median:.1f}%); "
                     f"{_method_label(anomaly.method)} {_chosen_score(anomaly):.1f} (severity {anomaly.severity}).")
    if stall and stall.is_stalled:
        parts.append(f"- Quote has been in {stall.status} for {stall.days_stale} days "
                     f"(SLA {stall.threshold_days}d, severity {stall.severity}).")
    if not parts:
        parts.append("- No statistical discount anomaly and within stall SLA; the deal looks healthy.")
    return "\n".join(parts)


def _template_narrative(deal_id: str, line_name: str, anomaly: Optional[DiscountAnomaly],
                        stall: Optional[StallStatus]) -> tuple:
    is_anom = bool(anomaly and anomaly.is_anomaly)
    is_stall = bool(stall and stall.is_stalled)
    if is_anom:
        b = anomaly.baseline
        narrative = (f"Deal {deal_id}'s '{line_name}' discount of {anomaly.value:.1f}% is a statistical "
                     f"outlier for this rep, whose discounts average {b.mean:.1f}% "
                     f"({_method_label(anomaly.method)} {_chosen_score(anomaly):.1f}).")
        if is_stall:
            narrative += f" It has also stalled in {stall.status} for {stall.days_stale} days."
        action = (f"Verify the {anomaly.value:.1f}% discount with the rep against the ~{b.mean:.1f}% baseline "
                  f"and route to Manager for sign-off before it ages further.")
    elif is_stall:
        narrative = (f"Deal {deal_id} shows no pricing anomaly, but it has sat in {stall.status} "
                     f"for {stall.days_stale} days, past the {stall.threshold_days}-day SLA.")
        action = "Follow up with the approver to unblock the quote or re-engage the customer."
    else:
        narrative = f"Deal {deal_id} shows no discount anomaly and is within its stall SLA."
        action = "No action needed; proceed as normal."
    return narrative, action


def generate_anomaly_narrative(deal_id: str, line_name: str,
                               anomaly: Optional[DiscountAnomaly] = None,
                               stall: Optional[StallStatus] = None,
                               narrate: bool = True) -> AnomalyNarrativeResponse:
    narrative, action = _template_narrative(deal_id, line_name, anomaly, stall)
    used_llm = False

    if narrate:
        result = run_structured(
            task="anomaly", system=_SYSTEM, human=_HUMAN,
            variables={"deal_id": deal_id,
                       "evidence": _build_evidence(deal_id, line_name, anomaly, stall)},
            output_model=AnomalyNarration,
        )
        if result is not None:
            narrative = result.narrative or narrative
            action = result.recommended_action or action
            used_llm = True

    stats = None
    if anomaly is not None:
        b = anomaly.baseline
        stats = AnomalyStats(value=anomaly.value, z_score=anomaly.z_score,
                             modified_z_score=anomaly.modified_z_score, method=anomaly.method,
                             mean=b.mean, std=b.std, median=b.median, mad=b.mad, n=b.n)

    return AnomalyNarrativeResponse(
        deal_id=deal_id,
        narrative=narrative,
        recommended_action=action,
        is_anomaly=bool(anomaly and anomaly.is_anomaly),
        severity=(anomaly.severity if anomaly else None),
        anomalous_line=(line_name if anomaly and anomaly.is_anomaly else None),
        stats=stats,
        is_stalled=bool(stall and stall.is_stalled),
        days_stale=(stall.days_stale if stall else None),
        llm_used=used_llm,
    )


# --- Legacy entrypoint retained for backward compatibility. ------------------
def generate_deal_anomaly_narrative(deal_data: dict) -> AnomalyNarrativeResponse:
    """Deprecated shim: the router now computes real anomaly evidence and calls
    ``generate_anomaly_narrative``. Falls back to a minimal healthy verdict."""
    deal_id = str(deal_data.get("deal_id", "Q-Unknown"))
    return generate_anomaly_narrative(deal_id=deal_id, line_name="line item",
                                      anomaly=None, stall=None, narrate=False)
