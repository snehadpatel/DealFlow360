"""Intent definitions for DealFlow360 AI Chatbot.

Each intent maps to a specific domain action in the sales operations platform.
The intent classifier model is fine-tuned to recognise these categories.
"""

from enum import Enum
from typing import Dict, List


class Intent(str, Enum):
    CHECK_BILLING = "check_billing"
    DEAL_STATUS = "deal_status"
    UPSELL = "upsell"
    SUBSCRIPTION_QUERY = "subscription_query"
    ANOMALY_ALERT = "anomaly_alert"
    APPROVAL_STATUS = "approval_status"
    CUSTOMER_INFO = "customer_info"
    GENERAL = "general"


INTENT_LABELS: List[str] = [intent.value for intent in Intent]

LABEL_TO_ID: Dict[str, int] = {label: idx for idx, label in enumerate(INTENT_LABELS)}
ID_TO_LABEL: Dict[int, str] = {idx: label for label, idx in LABEL_TO_ID.items()}

NUM_INTENTS = len(INTENT_LABELS)

# Human-readable descriptions shown in chat responses
INTENT_DESCRIPTIONS: Dict[str, str] = {
    Intent.CHECK_BILLING: "Billing & invoice queries",
    Intent.DEAL_STATUS: "Deal and quotation status",
    Intent.UPSELL: "Cross-sell & upsell recommendations",
    Intent.SUBSCRIPTION_QUERY: "Subscription management",
    Intent.ANOMALY_ALERT: "Pricing anomaly detection",
    Intent.APPROVAL_STATUS: "Approval workflow status",
    Intent.CUSTOMER_INFO: "Customer information lookup",
    Intent.GENERAL: "General assistance",
}

# Suggestion chips per intent (shown after a response)
INTENT_SUGGESTIONS: Dict[str, List[str]] = {
    Intent.CHECK_BILLING: [
        "Show outstanding balance",
        "Download invoice PDF",
        "Payment history",
    ],
    Intent.DEAL_STATUS: [
        "Show deal health score",
        "View quotation details",
        "Check approval chain",
    ],
    Intent.UPSELL: [
        "More recommendations",
        "Show product catalog",
        "Bundle suggestions",
    ],
    Intent.SUBSCRIPTION_QUERY: [
        "Active subscriptions",
        "Next billing date",
        "Subscription plans",
    ],
    Intent.ANOMALY_ALERT: [
        "Show all anomalies",
        "Discount analysis",
        "Risk assessment",
    ],
    Intent.APPROVAL_STATUS: [
        "Pending approvals",
        "My approval history",
        "Escalate approval",
    ],
    Intent.CUSTOMER_INFO: [
        "Customer contacts",
        "Purchase history",
        "Account overview",
    ],
    Intent.GENERAL: [
        "Check billing status",
        "View deal health",
        "Get upsell ideas",
    ],
}
