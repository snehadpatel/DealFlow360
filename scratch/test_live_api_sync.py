import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def login(email, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    token = resp.json().get("access_token")
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def test_full_cross_page_flow():
    print("\n--- 1. Login as Sales Rep (Rahul) ---")
    rep_headers = login("rahul@technova.com", "rep123")
    print("   Sales Rep logged in successfully.")

    print("\n--- 2. Fetch Customer and Catalog ---")
    customers = requests.get(f"{BASE_URL}/customers", headers=rep_headers).json()
    assert len(customers) > 0, "No customers found"
    customer = customers[0]
    print(f"   Using customer: {customer['name']} ({customer['id']})")

    products = requests.get(f"{BASE_URL}/products", headers=rep_headers).json()
    assert len(products) > 0, "No products found"
    # Find a SaaS/Subscription product and a Hardware/Services product
    saas_prod = next((p for p in products if "cloud" in p['name'].lower() or "subscription" in p['category'].lower() or "saas" in p['category'].lower()), products[0])
    print(f"   Selected Product: {saas_prod['name']} (Category: {saas_prod['category']}, Price: ₹{saas_prod['price']})")

    print("\n--- 3. Create Quotation in Quotation Builder ---")
    quote_payload = {
        "customer_id": customer["id"],
        "notes": "Live cross-page synchronization test quote",
        "currency": "INR",
        "items": [
            {
                "product_id": saas_prod["id"],
                "quantity": 5,
                "discount_percent": 25.0 # Above ceiling to trigger multi-tier approval
            }
        ]
    }
    create_resp = requests.post(f"{BASE_URL}/quotes", json=quote_payload, headers=rep_headers)
    assert create_resp.status_code == 200, f"Create quote failed: {create_resp.text}"
    quote = create_resp.json()
    quote_id = quote["id"]
    print(f"   Quote created: ID {quote_id} | Status: {quote['status']} | Total: ₹{quote['total']}")

    print("\n--- 4. Verify Quote in Sales Pipeline / My Quotations ---")
    my_quotes = requests.get(f"{BASE_URL}/quotes", headers=rep_headers).json()
    found_quote = next((q for q in my_quotes if q["id"] == quote_id), None)
    assert found_quote is not None, f"Quote {quote_id} not listed in /quotes"
    assert found_quote["status"] == "DRAFT"
    print("   Verified quote appears in Sales Rep quotations with status DRAFT.")

    print("\n--- 5. Submit Quotation for Approval ---")
    submit_resp = requests.post(f"{BASE_URL}/quotes/{quote_id}/submit", headers=rep_headers)
    assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
    submitted_quote = submit_resp.json()
    assert submitted_quote["status"] == "PENDING_APPROVAL"
    print(f"   Quote submitted. Status: {submitted_quote['status']}")

    print("\n--- 6. Manager Review (Neha) ---")
    mgr_headers = login("neha@technova.com", "mgr123")
    summary = requests.get(f"{BASE_URL}/approvals/summary", headers=mgr_headers).json()
    print(f"   Manager Approval Summary: {summary}")
    assert summary.get("pending", 0) > 0, "Expected at least 1 pending approval"

    approvals = requests.get(f"{BASE_URL}/approvals", params={"status": "PENDING"}, headers=mgr_headers).json()
    mgr_req = next((a for a in approvals if a.get("quotation_id") == quote_id and a.get("approver_role") == "MANAGER"), None)
    assert mgr_req is not None, f"Manager approval request for quote {quote_id} not found"
    print(f"   Found Manager Approval Request ID: {mgr_req['id']}")

    approve_resp = requests.post(f"{BASE_URL}/approvals/{mgr_req['id']}/approve", json={"comment": "Approved by Sales Manager"}, headers=mgr_headers)
    assert approve_resp.status_code == 200, f"Manager approval failed: {approve_resp.text}"
    print("   Sales Manager approved successfully.")

    print("\n--- 7. Finance Review (Sneha) ---")
    fin_headers = login("sneha@technova.com", "fin123")
    fin_approvals = requests.get(f"{BASE_URL}/approvals", params={"status": "PENDING"}, headers=fin_headers).json()
    fin_req = next((a for a in fin_approvals if a.get("quotation_id") == quote_id and a.get("approver_role") == "FINANCE"), None)
    assert fin_req is not None, f"Finance approval request for quote {quote_id} not found"
    print(f"   Found Finance Approval Request ID: {fin_req['id']}")

    approve_fin_resp = requests.post(f"{BASE_URL}/approvals/{fin_req['id']}/approve", json={"comment": "Approved by Finance"}, headers=fin_headers)
    assert approve_fin_resp.status_code == 200, f"Finance approval failed: {approve_fin_resp.text}"
    print("   Finance approved successfully.")

    print("\n--- 8. Verify Quote Status is now APPROVED ---")
    approved_quote = requests.get(f"{BASE_URL}/quotes/{quote_id}", headers=rep_headers).json()
    assert approved_quote["status"] == "APPROVED", f"Expected APPROVED, got {approved_quote['status']}"
    print("   Verified: Quotation is APPROVED and ready for customer acceptance.")

    print("\n--- 9. Customer Acceptance / Quote Confirmation ---")
    # Accept quotation via confirm endpoint
    confirm_resp = requests.post(f"{BASE_URL}/quotes/{quote_id}/confirm", headers=rep_headers)
    assert confirm_resp.status_code == 200, f"Confirmation failed: {confirm_resp.text}"
    confirmed_quote = confirm_resp.json()
    assert confirmed_quote["status"] == "CONFIRMED"
    print("   Quotation confirmed into Order!")

    print("\n--- 10. Verify Order Generation ---")
    orders = requests.get(f"{BASE_URL}/orders", headers=rep_headers).json()
    order = next((o for o in orders if o.get("quotation_id") == quote_id), None)
    assert order is not None, f"No order created for quote {quote_id}"
    order_id = order["id"]
    print(f"   Order verified: ID {order_id} | Status: {order.get('status')} | Total: ₹{order.get('total')}")

    print("\n--- 11. Verify Invoice Generation ---")
    invoices = requests.get(f"{BASE_URL}/invoices", headers=fin_headers).json()
    inv_items = invoices.get("items", invoices) if isinstance(invoices, dict) else invoices
    inv = next((i for i in inv_items if i.get("quote_id") == quote_id or i.get("quotationId") == quote_id or str(i.get("notes", "")).find(str(quote_id)) >= 0), None)
    assert inv is not None, f"No invoice created for quote {quote_id}"
    inv_id = inv["id"]
    print(f"   Invoice verified: ID {inv_id} | Status: {inv.get('status')} | Total: ₹{inv.get('total')}")

    print("\n--- 12. Record Payment on Invoice ---")
    pay_resp = requests.post(
        f"{BASE_URL}/invoices/{inv_id}/payment",
        json={"amount": inv["total"], "method": "BANK_TRANSFER", "notes": "Settled in full via wire transfer"},
        headers=fin_headers
    )
    assert pay_resp.status_code == 200, f"Payment recording failed: {pay_resp.text}"
    paid_inv = requests.get(f"{BASE_URL}/invoices/{inv_id}", headers=fin_headers).json()
    assert paid_inv["status"] == "PAID", f"Expected PAID, got {paid_inv['status']}"
    print(f"   Payment recorded! Invoice status updated to: {paid_inv['status']}")

    print("\n--- 13. Verify Customer Subscriptions ---")
    subs = requests.get(f"{BASE_URL}/subscriptions", headers=fin_headers).json()
    sub_items = subs.get("items", subs) if isinstance(subs, dict) else subs
    print(f"   Active Subscriptions Count in system: {len(sub_items)}")

    print("\n--- 14. Verify Operations Fulfillment ---")
    ops_headers = login("karan@technova.com", "ops123")
    ful_orders = requests.get(f"{BASE_URL}/fulfillment/orders", headers=ops_headers).json()
    print(f"   Fulfillment orders count: {len(ful_orders)}")

    print("\n--- 15. Verify Admin Audit Trail ---")
    admin_headers = login("arjun@technova.com", "admin123")
    audit_logs = requests.get(f"{BASE_URL}/admin/audit-logs", headers=admin_headers).json()
    log_items = audit_logs.get("items", audit_logs) if isinstance(audit_logs, dict) else audit_logs
    assert len(log_items) > 0, "No audit logs found"
    print(f"   Verified {len(log_items)} audit log entries in admin database.")

    print("\n" + "=" * 60)
    print(">>> COMPLETE END-TO-END CROSS-PAGE SYNC TEST PASSED! <<<")
    print("=" * 60)

if __name__ == "__main__":
    test_full_cross_page_flow()
