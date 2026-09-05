"""Typed request/response contracts for the /ai endpoints.

Design rule: the original frontend-facing shapes (``UpsellItem`` with
``product_name/reasoning/suggested_price/margin_impact``, ``UpsellResponse``,
``AnomalyNarrativeResponse``) are preserved field-for-field so nothing the
frontend already reads can break. Everything new is **optional** and additive:
the real computed numbers (confidence, lift, margin, rank, health features) and
the LLM-written prose. The small ``*Narration`` models are the ONLY thing the
LLM is ever asked to produce — pure text, no numbers.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


# ============================ UPSELL =========================================

class UpsellItem(BaseModel):
    # --- original fields (unchanged; always populated) ---
    product_name: str
    reasoning: str
    suggested_price: float
    margin_impact: str
    # --- additive: the real market-basket numbers (glass-box) ---
    product_id: Optional[str] = None
    anchor_product_name: Optional[str] = None
    confidence: Optional[float] = None       # P(B | A), 0-1
    lift: Optional[float] = None             # association strength vs baseline
    support: Optional[float] = None          # P(A and B), 0-1
    margin_pct: Optional[float] = None       # gross margin of the suggestion, 0-1
    rank_score: Optional[float] = None       # 0-100 blended rank
    promotion_flag: Optional[bool] = None    # high-margin AND high-lift
    promotion_tag: Optional[str] = None      # LLM-written badge, e.g. "Margin booster"
    pitch: Optional[str] = None              # LLM-written one-line sales pitch


class UpsellBasis(BaseModel):
    transactions_analyzed: int
    rules_mined: int
    method: str = "association-rules(support/confidence/lift) + margin-aware rank"
    llm_used: bool = False


class UpsellResponse(BaseModel):
    recommendations: List[UpsellItem]
    basis: Optional[UpsellBasis] = None


class UpsellRequest(BaseModel):
    """Hybrid input: the cart comes from the client; the stats are computed
    server-side from confirmed history. Accepts product ids and/or names."""
    cart_product_ids: List[str] = Field(default_factory=list)
    cart_product_names: List[str] = Field(default_factory=list)
    top_k: int = 3


# ============================ ANOMALY / DEAL HEALTH ==========================

class AnomalyStats(BaseModel):
    value: float
    z_score: float
    modified_z_score: float
    method: str
    mean: float
    std: float
    median: float
    mad: float
    n: int


class AnomalyNarrativeResponse(BaseModel):
    # --- original fields (unchanged) ---
    deal_id: str
    narrative: str
    recommended_action: str
    # --- additive: the computed evidence behind the narrative ---
    is_anomaly: Optional[bool] = None
    severity: Optional[str] = None
    anomalous_line: Optional[str] = None     # product name of the worst line
    stats: Optional[AnomalyStats] = None
    is_stalled: Optional[bool] = None
    days_stale: Optional[int] = None
    llm_used: bool = False


class AnomalyRequest(BaseModel):
    """Prefer ``quotation_id`` (server loads real data). The loose fields are a
    fallback for ad-hoc/manual calls without a persisted quote."""
    quotation_id: Optional[str] = None
    deal_id: Optional[str] = None
    rep_id: Optional[str] = None
    discount_percent: Optional[float] = None
    status: Optional[str] = None


class HealthFeatureOut(BaseModel):
    name: str
    score: float
    weight: float
    contribution: float
    detail: str


class DealHealthResponse(BaseModel):
    deal_id: str
    score: float
    band: str                                # GREEN | AMBER | RED
    features: List[HealthFeatureOut]
    summary: Optional[str] = None            # optional LLM one-liner
    llm_used: bool = False


class DealHealthRequest(BaseModel):
    quotation_id: str


# ============================ NEGOTIATION COPILOT ============================

class NegotiationRequest(BaseModel):
    """A customer counter-offer to evaluate. Either give a ``quotation_id`` +
    ``product_id`` (server loads the line) or the explicit price/cost fields."""
    quotation_id: Optional[str] = None
    product_id: Optional[str] = None
    counter_discount: float
    customer_note: Optional[str] = None
    # explicit fallback line economics (used when no quotation_id is given)
    list_price: Optional[float] = None
    cost: Optional[float] = None
    category_ceiling: Optional[float] = None
    tier: Optional[str] = None
    target_margin_pct: Optional[float] = None
    persist: bool = False                    # store the counter in PortalNegotiation


class NegotiationResponse(BaseModel):
    decision: str                            # ACCEPT | COUNTER | ESCALATE
    counter_discount: float
    allowed_ceiling: float
    margin_floor_discount: float
    policy_safe_max_discount: float
    recommended_counter_discount: float
    projected_margin_pct: float
    recommended_margin_pct: float
    overage_pp: float
    approval_chain: List[str]
    policy_notes: List[str]
    reply_draft: str                         # LLM- or template-written customer reply
    internal_nudge: str                      # LLM- or template-written note to the rep
    llm_used: bool = False


# ============================ LLM-ONLY NARRATION SUB-SCHEMAS =================
# These are the ONLY structures the model is asked to fill. No numbers here.

class UpsellNarration(BaseModel):
    pitch: str = Field(description="One concise B2B sales sentence for this add-on.")
    promotion_tag: str = Field(description="A 1-3 word badge, e.g. 'Margin booster'.")


class AnomalyNarration(BaseModel):
    narrative: str = Field(description="2 sentences explaining the anomaly/stall in plain business language.")
    recommended_action: str = Field(description="One concrete next step for the rep or manager.")


class NegotiationNarration(BaseModel):
    reply_draft: str = Field(description="A polite, firm reply to the customer proposing the recommended terms.")
    internal_nudge: str = Field(description="A one-line internal note telling the rep what to do and why.")
