"""Generate training data for DealFlow360 AI Chatbot models.

Creates two JSON files:
  1. intent_training_data.json  — labelled (text, intent) pairs for the classifier
  2. response_training_data.json — (prompt, response) pairs for the generator

Run:  python -m app.ml.generate_training_data
"""
import json
import random
import os

from app.ml.intents import INTENT_LABELS

# ---------------------------------------------------------------------------
# 1. Intent classification dataset
# ---------------------------------------------------------------------------

_TEMPLATES: dict[str, list[str]] = {
    "check_billing": [
        "What is the status of billing {bil_id}?",
        "Show me billing record {bil_id}",
        "How much is outstanding on {bil_id}?",
        "What's the balance on invoice {inv_id}?",
        "Is {bil_id} paid?",
        "Check payment status for {bil_id}",
        "Any unpaid invoices?",
        "What is the total amount for billing {bil_id}?",
        "Show outstanding balance",
        "Has the client paid {bil_id} yet?",
        "Pull up the billing details",
        "I need to see invoice {inv_id}",
        "Give me a billing summary",
        "Download invoice PDF for {bil_id}",
        "Send invoice to the customer",
        "When is payment due for {bil_id}?",
        "Show me the payment history",
        "What billing records are overdue?",
        "List all partially paid bills",
        "How much has been collected so far?",
        "What is the recurring charge amount?",
        "Break down the one-time charges",
        "Show the billing timeline for {bil_id}",
        "Who processed the last payment?",
        "What's the payment method for {bil_id}?",
    ],
    "deal_status": [
        "What's the status of quote {qt_id}?",
        "How is deal {qt_id} progressing?",
        "Show deal health for {qt_id}",
        "Is quotation {qt_id} approved?",
        "What stage is {qt_id} at?",
        "Give me a deal summary",
        "How many deals are in pipeline?",
        "What's the margin on {qt_id}?",
        "Is this deal at risk?",
        "Show me the deal health dashboard",
        "What's the win probability?",
        "Has the customer accepted the quote?",
        "When was the last update on {qt_id}?",
        "List all active quotations",
        "Show deals closing this month",
        "Which deals need attention?",
        "What is the total pipeline value?",
        "Give me a status update on my deals",
        "How long has this deal been stalled?",
        "What's the conversion rate?",
        "Show me recent deal activity",
        "Which deals are close to expiring?",
        "What's the average deal size?",
        "List deals by stage",
        "Any deals flagged for review?",
    ],
    "upsell": [
        "What products can I cross-sell with this order?",
        "Suggest add-ons for the current quote",
        "Are there upsell opportunities?",
        "What do customers usually buy together?",
        "Recommend complementary products",
        "Show me bundle suggestions",
        "What should I add to this cart?",
        "Any frequently bought together items?",
        "Give me upsell recommendations",
        "What accessories go with this product?",
        "Suggest premium upgrades",
        "What can increase the deal value?",
        "Show me cross-sell analytics",
        "Which products have the best attach rate?",
        "Recommend add-ons for enterprise router",
        "What's the best bundle for this customer?",
        "How can I increase the order value?",
        "Show product affinity analysis",
        "What are the top-selling bundles?",
        "Suggest a higher-tier alternative",
        "Any promotional bundles available?",
        "What complementary services can I offer?",
        "Show me the product recommendation engine results",
        "Analyze the basket for cross-sell potential",
        "What maintenance plan goes with this hardware?",
    ],
    "subscription_query": [
        "Show active subscriptions",
        "When is the next billing cycle?",
        "List all subscription plans",
        "What subscriptions does {cust} have?",
        "Can I pause subscription {sub_id}?",
        "How do I cancel a subscription?",
        "What's the monthly recurring revenue?",
        "Show subscription summary",
        "Which subscriptions are expiring?",
        "What's the renewal rate?",
        "Show me subscription analytics",
        "How many active subscribers do we have?",
        "What subscription plan is the most popular?",
        "Show the billing schedule for {sub_id}",
        "When does {sub_id} renew?",
        "What's the churn rate?",
        "List subscriptions by status",
        "Are there any past-due subscriptions?",
        "Show subscription revenue trends",
        "What's the average subscription value?",
        "Upgrade subscription plan for {cust}",
        "Show subscription timeline for {sub_id}",
        "What's included in the enterprise plan?",
        "Compare subscription tiers",
        "How many subscriptions were added this month?",
    ],
    "anomaly_alert": [
        "Are there any pricing anomalies?",
        "Flag unusual discounts",
        "Show discount anomaly report",
        "Is this discount percentage normal?",
        "Detect abnormal pricing patterns",
        "Any suspicious discount activity?",
        "Run anomaly detection on this quote",
        "What's the risk score for this deal?",
        "Show me outlier discounts",
        "Are any reps giving excessive discounts?",
        "Flag deals with margin erosion",
        "What's the discount z-score?",
        "Show anomaly alerts dashboard",
        "Any stalled deals that need attention?",
        "Which quotes have unusual pricing?",
        "Detect fraud patterns in discounts",
        "Show the risk assessment report",
        "Are there compliance violations?",
        "What's the severity of this anomaly?",
        "List all flagged transactions",
        "Run a pricing audit",
        "Show me the anomaly narrative",
        "Which deals are outside normal ranges?",
        "Alert me about unusual activity",
        "What triggers an anomaly flag?",
    ],
    "approval_status": [
        "Any pending approvals?",
        "What needs my approval?",
        "Show my approval queue",
        "Has the manager approved {qt_id}?",
        "Who is the next approver?",
        "Escalate this approval",
        "What's the approval chain for this quote?",
        "How long has this been waiting for approval?",
        "List all rejected approvals",
        "Show approval history for {qt_id}",
        "Why was this quote returned?",
        "Who can approve discounts above 20%?",
        "Send a reminder to the approver",
        "What's the average approval time?",
        "Show overdue approvals",
        "How many approvals are in the queue?",
        "What's the approval workflow?",
        "Check if finance has signed off",
        "List approvals by priority",
        "Was my last submission approved?",
        "Show the approval audit trail",
        "Who approved this discount?",
        "Can I bypass the approval step?",
        "What's the approval policy for this tier?",
        "Show me the SLA for approvals",
    ],
    "customer_info": [
        "Tell me about {cust}",
        "Show customer details for {cust_id}",
        "What's the contact info for {cust}?",
        "Show customer purchase history",
        "What tier is {cust}?",
        "How much has {cust} spent with us?",
        "Show me the customer profile",
        "What's the customer's billing address?",
        "List all customers",
        "Show top customers by revenue",
        "What products has {cust} ordered?",
        "Who is the account manager for {cust}?",
        "Show customer activity log",
        "When was the last order from {cust}?",
        "What's the customer satisfaction score?",
        "Show {cust}'s open tickets",
        "List customer contacts",
        "What's the customer's tax ID?",
        "Show accounts receivable for {cust}",
        "How many active deals with {cust}?",
        "Customer onboarding status",
        "Show customer segmentation",
        "What region is {cust} in?",
        "List customers by tier",
        "Show me the customer 360 view",
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
        "How does this work?",
        "Thanks",
        "Thank you",
        "Bye",
        "See you later",
        "Who are you?",
        "What is DealFlow360?",
        "How do I use the platform?",
        "Show me the main menu",
        "Take me to the dashboard",
        "I'm new here",
        "Guide me through the app",
        "What features do you support?",
        "Can you explain this screen?",
        "Tell me a joke",
        "Good afternoon",
        "What's new?",
    ],
}

_ENTITY_VARS = {
    "bil_id": ["BIL-2045", "BIL-1987", "BIL-3201", "BIL-4456", "BIL-1122"],
    "inv_id": ["INV-2045", "INV-1987", "INV-3201", "INV-4456", "INV-1122"],
    "qt_id": ["QT-2026-0184", "QT-2026-0312", "QT-2026-0099", "QT-2025-0455", "QT-2026-0501"],
    "sub_id": ["SUB-0045", "SUB-0112", "SUB-0234", "SUB-0078", "SUB-0301"],
    "cust": ["ABC Industries", "Acme Corp", "TechVision Ltd", "Global Dynamics", "Nexus Systems"],
    "cust_id": ["CUST-0012", "CUST-0034", "CUST-0056", "CUST-0078", "CUST-0091"],
}

# Extra natural variations to double the dataset size
_PREFIXES = ["", "Hey, ", "Can you ", "Please ", "I want to ", "Could you ", "I'd like to "]
_SUFFIXES = ["", "?", " please", " for me", " right now", " quickly"]


def _expand(template: str) -> str:
    """Fill entity placeholders with random values."""
    result = template
    for key, values in _ENTITY_VARS.items():
        placeholder = "{" + key + "}"
        if placeholder in result:
            result = result.replace(placeholder, random.choice(values))
    return result


def generate_intent_data() -> list[dict]:
    """Generate ~800+ labelled intent samples."""
    samples = []
    for intent, templates in _TEMPLATES.items():
        for template in templates:
            # Base version
            text = _expand(template)
            samples.append({"text": text, "label": intent})
            # 2-3 variations per template
            for _ in range(random.randint(2, 3)):
                prefix = random.choice(_PREFIXES)
                suffix = random.choice(_SUFFIXES)
                varied = prefix + _expand(template).rstrip("?").rstrip(".") + suffix
                varied = varied.strip()
                if varied and varied not in [s["text"] for s in samples]:
                    samples.append({"text": varied, "label": intent})
    random.shuffle(samples)
    return samples


# ---------------------------------------------------------------------------
# 2. Response generation dataset
# ---------------------------------------------------------------------------

_RESPONSE_TEMPLATES: dict[str, list[dict]] = {
    "check_billing": [
        {
            "context": "Billing ID: BIL-2045, Status: PARTIALLY_PAID, Total: $142,500, Paid: $60,000, Outstanding: $82,500, Customer: ABC Industries Ltd.",
            "user": "What is the status of billing BIL-2045?",
            "response": "Billing record BIL-2045 for ABC Industries Ltd. is currently **partially paid**. The total amount is $142,500, with $60,000 already received. The outstanding balance of $82,500 is due under the Net 30 terms. Would you like me to send a payment reminder or download the invoice?"
        },
        {
            "context": "Billing ID: BIL-1987, Status: PAID, Total: $45,000, Paid: $45,000, Outstanding: $0, Customer: TechVision Ltd.",
            "user": "Is BIL-1987 paid?",
            "response": "Yes! Billing record BIL-1987 for TechVision Ltd. has been **fully paid**. The total amount of $45,000 was received in full. No outstanding balance remains."
        },
        {
            "context": "Billing ID: BIL-3201, Status: OVERDUE, Total: $78,900, Paid: $0, Outstanding: $78,900, Customer: Global Dynamics, Days Overdue: 15",
            "user": "Any overdue invoices?",
            "response": "⚠️ There is **1 overdue billing record**: BIL-3201 for Global Dynamics. The full amount of $78,900 is outstanding and is 15 days past due. I recommend sending an urgent payment reminder. Would you like me to escalate this?"
        },
        {
            "context": "Summary: 12 active billing records, Total Outstanding: $245,780, 2 overdue, 5 partially paid, 5 fully paid",
            "user": "Give me a billing summary",
            "response": "Here's your billing overview:\n• **12** active records\n• **$245,780** total outstanding\n• **2** overdue (needs attention)\n• **5** partially paid\n• **5** fully paid\n\nWould you like details on the overdue bills?"
        },
        {
            "context": "Billing ID: BIL-4456, Status: PENDING, Total: $33,200, Customer: Nexus Systems, Invoice Generated: Yes, Sent: No",
            "user": "Check payment status for BIL-4456",
            "response": "Billing BIL-4456 for Nexus Systems is **pending** — the invoice for $33,200 has been generated but not yet sent to the customer. Would you like me to dispatch the invoice now?"
        },
    ],
    "deal_status": [
        {
            "context": "Quote: QT-2026-0184, Status: SUBMITTED, Customer: ABC Industries, Total: $142,500, Margin: 32%, Stage: Awaiting Approval, Days in Stage: 3",
            "user": "What's the status of quote QT-2026-0184?",
            "response": "Quote **QT-2026-0184** for ABC Industries ($142,500) is currently **awaiting approval**. It's been in this stage for 3 days. The deal margin is healthy at 32%. The next step is manager sign-off."
        },
        {
            "context": "Pipeline: 24 active deals, Total Value: $2.1M, 8 in negotiation, 6 awaiting approval, 4 at risk, 6 confirmed",
            "user": "How many deals are in pipeline?",
            "response": "Your current pipeline has **24 active deals** worth **$2.1M**:\n• 8 in negotiation\n• 6 awaiting approval\n• 4 at risk ⚠️\n• 6 confirmed ✅\n\nShall I show you the at-risk deals?"
        },
        {
            "context": "Quote: QT-2026-0312, Status: STALLED, Days Since Update: 14, Customer: Acme Corp, Total: $89,000",
            "user": "Is this deal at risk?",
            "response": "⚠️ Deal QT-2026-0312 with Acme Corp appears **stalled** — it hasn't been updated in 14 days. Total value: $89,000. I recommend reaching out to the customer or escalating internally."
        },
    ],
    "upsell": [
        {
            "context": "Cart: Enterprise Core Router XG-900 (qty 10). Recommendations: 1) Rack Mounting Kit (85% attach rate), 2) Extended Warranty (72% attach rate), 3) Cloud Management Suite (68% attach rate). Analysis: 156 transactions, 42 rules mined.",
            "user": "What products can I cross-sell with this order?",
            "response": "Based on analysis of **156 past transactions**, here are the top cross-sell opportunities for your Enterprise Router order:\n\n1. 🔧 **Rack Mounting Kit** — 85% of similar orders include this\n2. 🛡️ **Extended Warranty** — 72% attach rate\n3. ☁️ **Cloud Management Suite** — 68% attach rate\n\nAdding all three could increase deal value by ~$15,000. Want me to add any to the quote?"
        },
        {
            "context": "No cart items. General recommendation: Top bundles this quarter — Network Security Suite + Firewall, SaaS Platform + Support SLA",
            "user": "Show me bundle suggestions",
            "response": "Here are the **top-performing bundles** this quarter:\n\n1. 🔒 **Network Security Suite + Firewall** — 89% customer satisfaction\n2. ☁️ **SaaS Platform + Premium Support SLA** — 34% higher retention\n\nWould you like to apply one of these to a specific quotation?"
        },
    ],
    "subscription_query": [
        {
            "context": "Active Subscriptions: 45, MRR: $127,500, Churn Rate: 2.3%, Top Plan: Enterprise Cloud (28 subscribers)",
            "user": "Show active subscriptions",
            "response": "You have **45 active subscriptions** generating **$127,500 MRR**:\n• Top plan: Enterprise Cloud (28 subscribers)\n• Churn rate: 2.3% (healthy)\n\nWould you like to see subscriptions by status or expiring soon?"
        },
        {
            "context": "Subscription: SUB-0045, Plan: Enterprise Cloud Suite, Cycle: Monthly, Next Billing: Oct 5 2026, Amount: $1,250/month, Customer: ABC Industries",
            "user": "When is the next billing cycle?",
            "response": "Subscription **SUB-0045** (Enterprise Cloud Suite) for ABC Industries bills **monthly at $1,250**. The next billing date is **October 5, 2026**."
        },
    ],
    "anomaly_alert": [
        {
            "context": "Anomaly detected: Quote QT-2026-0184, Line: Enterprise Router, Discount: 28%, Rep Average: 12%, Z-Score: 3.2, Severity: HIGH",
            "user": "Are there any pricing anomalies?",
            "response": "🚨 **HIGH severity anomaly detected** on QT-2026-0184:\n\nThe Enterprise Router line has a **28% discount** — the rep's average is only 12%. The z-score of 3.2 indicates this is statistically unusual.\n\nThis may need manager review before approval. Want me to flag it?"
        },
        {
            "context": "No anomalies detected. All quotes within normal discount ranges.",
            "user": "Any suspicious discount activity?",
            "response": "✅ **No anomalies detected.** All active quotes have discounts within normal ranges for their respective reps and product categories."
        },
    ],
    "approval_status": [
        {
            "context": "Pending Approvals: 3. 1) QT-2026-0184 (High discount, waiting Manager), 2) QT-2026-0099 (Large order, waiting Finance), 3) QT-2026-0312 (Custom pricing, waiting Director)",
            "user": "Any pending approvals?",
            "response": "You have **3 pending approvals**:\n\n1. **QT-2026-0184** — High discount, awaiting Manager ⏳\n2. **QT-2026-0099** — Large order ($200K+), awaiting Finance ⏳\n3. **QT-2026-0312** — Custom pricing, awaiting Director ⏳\n\nWant me to send reminders to the approvers?"
        },
    ],
    "customer_info": [
        {
            "context": "Customer: ABC Industries Ltd., ID: CUST-0012, Tier: GOLD, Total Spend: $485,000, Active Deals: 3, Subscriptions: 2, Contact: accounts.payable@abcindustries.com, Phone: +1 (408) 555-0192",
            "user": "Tell me about ABC Industries",
            "response": "**ABC Industries Ltd.** (CUST-0012)\n• Tier: 🥇 GOLD\n• Total spend: $485,000\n• Active deals: 3\n• Subscriptions: 2\n• Contact: accounts.payable@abcindustries.com\n• Phone: +1 (408) 555-0192\n\nNeed to see their purchase history or open deals?"
        },
    ],
    "general": [
        {
            "context": "",
            "user": "Hello",
            "response": "Hi! 👋 I'm your **DealFlow360 AI Assistant**. I can help you with:\n\n• 📋 Deal & quotation status\n• 💰 Billing & invoice queries\n• 🎯 Upsell recommendations\n• 📊 Subscription management\n• ⚠️ Anomaly alerts\n• ✅ Approval workflows\n\nWhat would you like to know?"
        },
        {
            "context": "",
            "user": "What can you do?",
            "response": "I'm your AI-powered sales operations assistant! Here's what I can do:\n\n1. **Check billing** — status, outstanding balances, invoice details\n2. **Track deals** — pipeline, health scores, at-risk flags\n3. **Suggest upsells** — cross-sell products based on purchase patterns\n4. **Manage subscriptions** — renewals, billing cycles, churn\n5. **Detect anomalies** — flag unusual discounts or stalled deals\n6. **Track approvals** — pending queue, approval chains\n\nJust ask me anything!"
        },
        {
            "context": "",
            "user": "Thanks",
            "response": "You're welcome! 😊 Let me know if you need anything else."
        },
    ],
}


def generate_response_data() -> list[dict]:
    """Generate prompt→response training pairs for the generator model."""
    samples = []
    for intent, examples in _RESPONSE_TEMPLATES.items():
        for ex in examples:
            prompt = f"[INTENT] {intent}\n[CONTEXT] {ex['context']}\n[USER] {ex['user']}\n[RESPONSE]"
            samples.append({
                "prompt": prompt,
                "response": ex["response"],
                "intent": intent,
            })
            # Create 2-3 light paraphrase variations
            for _ in range(random.randint(2, 3)):
                user_var = random.choice(_PREFIXES) + ex["user"].rstrip("?").rstrip(".") + random.choice(_SUFFIXES)
                prompt_var = f"[INTENT] {intent}\n[CONTEXT] {ex['context']}\n[USER] {user_var.strip()}\n[RESPONSE]"
                samples.append({
                    "prompt": prompt_var,
                    "response": ex["response"],
                    "intent": intent,
                })
    random.shuffle(samples)
    return samples


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    random.seed(42)
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    # Intent classification data
    intent_data = generate_intent_data()
    intent_path = os.path.join(data_dir, "intent_training_data.json")
    with open(intent_path, "w") as f:
        json.dump(intent_data, f, indent=2)
    print(f"✅ Intent training data: {len(intent_data)} samples → {intent_path}")

    # Count per intent
    from collections import Counter
    counts = Counter(s["label"] for s in intent_data)
    for label, count in sorted(counts.items()):
        print(f"   {label}: {count}")

    # Response generation data
    response_data = generate_response_data()
    response_path = os.path.join(data_dir, "response_training_data.json")
    with open(response_path, "w") as f:
        json.dump(response_data, f, indent=2)
    print(f"✅ Response training data: {len(response_data)} samples → {response_path}")


if __name__ == "__main__":
    main()
