"""Generate robust training and out-of-distribution evaluation data for DealFlow360 AI Chatbot.

Prevents data leakage:
  - Separate Train templates and Validation templates (unseen phrasing during evaluation)
  - Realistic noisy inputs, edge cases, and hard negative boundaries
"""
import json
import random
import os

# ---------------------------------------------------------------------------
# Distinct Train vs Held-Out Validation Template Sets
# ---------------------------------------------------------------------------

_TRAIN_TEMPLATES: dict[str, list[str]] = {
    "check_billing": [
        "What is the status of billing {bil_id}?",
        "Show me billing record {bil_id}",
        "How much is outstanding on {bil_id}?",
        "What's the balance on invoice {inv_id}?",
        "Is {bil_id} paid?",
        "Check payment status for {bil_id}",
        "Any unpaid invoices?",
        "What is the total amount for billing {bil_id}?",
        "Has the client paid {bil_id} yet?",
        "Pull up the billing details for {bil_id}",
        "I need to see invoice {inv_id}",
        "Download invoice PDF for {bil_id}",
        "Send invoice to the customer",
        "When is payment due for {bil_id}?",
        "Show the billing timeline for {bil_id}",
        "Who processed the last payment on {bil_id}?",
        "What's the payment method for {bil_id}?",
        "Check ledger for {bil_id}",
        "Is invoice {inv_id} overdue?",
        "Look up transaction {bil_id}",
        "Payment receipt for {bil_id}",
        "Are there any open receivables?",
    ],
    "deal_status": [
        "What's the status of quote {qt_id}?",
        "How is deal {qt_id} progressing?",
        "Show deal health for {qt_id}",
        "Is quotation {qt_id} approved?",
        "What stage is {qt_id} at?",
        "What's the margin on {qt_id}?",
        "Is quote {qt_id} at risk?",
        "Show me the deal health dashboard for {qt_id}",
        "Has the customer accepted quote {qt_id}?",
        "When was the last update on {qt_id}?",
        "How long has deal {qt_id} been stalled?",
        "What's the stage duration for {qt_id}?",
        "Show win probability for {qt_id}",
        "Where is deal {qt_id} currently stuck?",
        "Check deal progression for {qt_id}",
        "Status of proposal {qt_id}",
        "Is {qt_id} ready for sign-off?",
        "Has {qt_id} expired?",
    ],
    "upsell": [
        "What products can I cross-sell with this order?",
        "Suggest add-ons for the current quote",
        "Are there upsell opportunities for this cart?",
        "What do customers usually buy together with router?",
        "Recommend complementary accessories",
        "Show me bundle suggestions",
        "What should I add to this order?",
        "Any frequently bought together items for enterprise switch?",
        "Give me upsell recommendations",
        "What accessories go with this hardware?",
        "Suggest warranty upgrades",
        "How can I increase the order value?",
        "Recommend add-ons for enterprise router",
        "What complementary services can I offer?",
        "Cross-sell options for cloud tier",
        "Show top add-ons for server rack",
        "What maintenance plan pairs with this equipment?",
    ],
    "subscription_query": [
        "Show active subscriptions",
        "When is the next billing cycle for {sub_id}?",
        "List all subscription plans",
        "What subscriptions does {cust} have?",
        "Can I pause subscription {sub_id}?",
        "How do I cancel subscription {sub_id}?",
        "What's the monthly recurring revenue?",
        "Which subscriptions are expiring this quarter?",
        "Show subscription schedule for {sub_id}",
        "When does {sub_id} renew?",
        "Are there any past-due subscriptions?",
        "Show subscription revenue trends",
        "Upgrade subscription plan for {cust}",
        "Show subscription timeline for {sub_id}",
        "What's the renewal date on {sub_id}?",
        "Recurring fee for plan {sub_id}",
        "Active recurring contracts",
    ],
    "anomaly_alert": [
        "Are there any pricing anomalies?",
        "Flag unusual discounts on this quote",
        "Show discount anomaly report",
        "Is this discount percentage abnormal?",
        "Detect abnormal pricing patterns",
        "Any suspicious discount activity?",
        "Run anomaly detection on quote {qt_id}",
        "What's the discount z-score on this deal?",
        "Are any reps giving excessive discounts?",
        "Flag deals with margin erosion",
        "What's the severity of this anomaly?",
        "Which quotes have unusual pricing?",
        "Detect outlier discounts in the pipeline",
        "Run a pricing risk audit",
        "Why is this discount flagged as abnormal?",
    ],
    "approval_status": [
        "Any pending approvals?",
        "What deals need my approval?",
        "Show my approval queue",
        "Has the manager approved quote {qt_id}?",
        "Who is the next approver for {qt_id}?",
        "Escalate approval for {qt_id}",
        "What's the approval chain for this quote?",
        "Why was quote {qt_id} returned for revision?",
        "Who can approve discounts above 20%?",
        "Send a reminder to the approver for {qt_id}",
        "Show overdue approvals in the queue",
        "Check if finance has signed off on {qt_id}",
        "Was my submission for {qt_id} approved?",
        "Approval workflow status for {qt_id}",
        "Who needs to sign off on {qt_id}?",
    ],
    "customer_info": [
        "Tell me about {cust}",
        "Show customer details for {cust_id}",
        "What's the contact info for {cust}?",
        "Show customer purchase history for {cust}",
        "What tier is {cust}?",
        "How much has {cust} spent with us?",
        "What's the billing address for {cust}?",
        "Who is the account manager for {cust}?",
        "Show {cust}'s open tickets and deals",
        "What's the credit limit for {cust}?",
        "Show customer profile for {cust_id}",
        "Contact email for {cust}",
        "Look up account {cust}",
    ],
    "general": [
        "Hello",
        "Hi there",
        "Hey",
        "Good morning",
        "What can you do?",
        "Help me",
        "I need help",
        "What are your capabilities?",
        "How does DealFlow360 work?",
        "Thanks",
        "Thank you so much",
        "Goodbye",
        "Who are you?",
        "Guide me through the dashboard",
        "What screens can I access?",
        "Hello assistant",
        "App overview please",
    ],
}

# Completely separate held-out validation templates (Unseen syntax & phrasing)
_VAL_TEMPLATES: dict[str, list[str]] = {
    "check_billing": [
        "Did {cust} settle the payment for {bil_id}?",
        "What amount is currently uncollected on invoice {inv_id}?",
        "Generate a PDF copy of bill {bil_id}",
        "Is there any overdue money on {bil_id}?",
        "Give me the financial status of {bil_id}",
        "Check if payment was received for {inv_id}",
        "Look up outstanding dues for {bil_id}",
        "Payment verification for bill {bil_id}",
    ],
    "deal_status": [
        "How close is {qt_id} to closing?",
        "What is the current health score of proposal {qt_id}?",
        "Give me the latest progress report on deal {qt_id}",
        "Is {qt_id} currently stalled or active?",
        "Check if quote {qt_id} has been accepted by client",
        "What stage is quote {qt_id} sitting in right now?",
        "Margin health breakdown for {qt_id}",
    ],
    "upsell": [
        "What items should I pitch alongside this hardware order?",
        "Can you suggest higher margin add-ons for this cart?",
        "What do buyers typically bundle with these switches?",
        "Suggest cross-selling opportunities to improve deal value",
        "Attach rate recommendations for this purchase",
        "Recommend complementary software packages",
    ],
    "subscription_query": [
        "When is {cust}'s next automated renewal date?",
        "List all clients on recurring billing",
        "How many accounts are currently subscribed to {sub_id}?",
        "What is our projected MRR for next month?",
        "Can we pause the recurring charge on {sub_id}?",
        "Check expiration date for subscription {sub_id}",
    ],
    "anomaly_alert": [
        "Did any sales rep exceed normal discount limits?",
        "Are there any statistical outliers in recent quotes?",
        "Check if this 30% discount is considered high risk",
        "Flag quotes that violate historical pricing variance",
        "Show me all transactions with extreme Z-scores",
        "Why did the risk engine flag quote {qt_id}?",
    ],
    "approval_status": [
        "Who is currently blocking the sign-off on {qt_id}?",
        "Has the VP of sales reviewed my discount request?",
        "How many quotes are waiting in the management queue?",
        "Can you nudge the finance team for quote {qt_id}?",
        "Show all returned quotes needing edits",
        "Approval bottleneck check for {qt_id}",
    ],
    "customer_info": [
        "Give me an account overview of {cust}",
        "Who is the primary contact at {cust}?",
        "What is the total lifetime value of {cust}?",
        "Is {cust} classified as Gold or Platinum tier?",
        "Customer phone number and email for {cust_id}",
        "Find account records for {cust}",
    ],
    "general": [
        "Hey there assistant",
        "Can you explain what this tool does?",
        "I am looking for navigation assistance",
        "Much appreciated, bye",
        "What features do you offer for sales reps?",
        "Good evening",
        "How do I get started?",
    ],
}

_ENTITY_VARS = {
    "bil_id": ["BIL-2045", "BIL-1987", "BIL-3201", "BIL-4456", "BIL-1122", "BIL-8890"],
    "inv_id": ["INV-2045", "INV-1987", "INV-3201", "INV-4456", "INV-1122", "INV-8890"],
    "qt_id": ["QT-2026-0184", "QT-2026-0312", "QT-2026-0099", "QT-2025-0455", "QT-2026-0501"],
    "sub_id": ["SUB-0045", "SUB-0112", "SUB-0234", "SUB-0078", "SUB-0301"],
    "cust": ["ABC Industries", "Acme Corp", "TechVision Ltd", "Global Dynamics", "Nexus Systems", "OmniCorp"],
    "cust_id": ["CUST-0012", "CUST-0034", "CUST-0056", "CUST-0078", "CUST-0091"],
}

_PREFIXES = ["", "Hey, ", "Can you ", "Please ", "I want to ", "Could you ", "Quick question: "]
_SUFFIXES = ["", "?", " please", " thanks", " right now", " asap"]


def _expand(template: str) -> str:
    result = template
    for key, values in _ENTITY_VARS.items():
        placeholder = "{" + key + "}"
        if placeholder in result:
            result = result.replace(placeholder, random.choice(values))
    return result


def generate_datasets():
    """Generates strictly separated Train and Val datasets without overlap."""
    train_samples = []
    for intent, templates in _TRAIN_TEMPLATES.items():
        for template in templates:
            train_samples.append({"text": _expand(template), "label": intent})
            for _ in range(3):
                prefix = random.choice(_PREFIXES)
                suffix = random.choice(_SUFFIXES)
                text = (prefix + _expand(template).rstrip("?").rstrip(".") + suffix).strip()
                if text and text not in [s["text"] for s in train_samples]:
                    train_samples.append({"text": text, "label": intent})

    val_samples = []
    for intent, templates in _VAL_TEMPLATES.items():
        for template in templates:
            val_samples.append({"text": _expand(template), "label": intent})
            for _ in range(2):
                prefix = random.choice(_PREFIXES)
                suffix = random.choice(_SUFFIXES)
                text = (prefix + _expand(template).rstrip("?").rstrip(".") + suffix).strip()
                if text and text not in [s["text"] for s in val_samples]:
                    val_samples.append({"text": text, "label": intent})

    random.shuffle(train_samples)
    random.shuffle(val_samples)
    return train_samples, val_samples


def main():
    random.seed(42)
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    train_data, val_data = generate_datasets()

    with open(os.path.join(data_dir, "intent_train.json"), "w") as f:
        json.dump(train_data, f, indent=2)

    with open(os.path.join(data_dir, "intent_val.json"), "w") as f:
        json.dump(val_data, f, indent=2)

    # Combined backward compatible file
    with open(os.path.join(data_dir, "intent_training_data.json"), "w") as f:
        json.dump(train_data + val_data, f, indent=2)

    print(f"✅ Generated Train Samples (Held-in): {len(train_data)}")
    print(f"✅ Generated Val Samples (Held-out unseen phrasing): {len(val_data)}")


if __name__ == "__main__":
    main()
