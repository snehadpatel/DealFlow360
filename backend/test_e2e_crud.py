import requests
import sqlite3
import sys

BASE_URL = "http://localhost:8001"
DB_PATH = "dealflow360.db"

def to_db_id(val):
    if not val:
        return val
    return str(val).replace("-", "")

def query_db(sql, params=()):
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cur = conn.cursor()
    cur.execute(sql, params)
    row = cur.fetchone()
    conn.close()
    return row

def run_test():
    session = requests.Session()
    
    # 1. Login as Admin
    print("--> 1. Logging in as Admin...", flush=True)
    res = session.post(f"{BASE_URL}/auth/login", json={"email": "admin@dealflow360.com", "password": "admin123"}, timeout=15)
    if res.status_code != 200:
        print(f"Failed to login: {res.status_code} {res.text}", flush=True)
        sys.exit(1)
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Admin logged in successfully.", flush=True)

    # 2. Customers CRUD
    print("--> 2. Testing Customer CRUD...", flush=True)
    cust_data = {
        "name": "Apex Global Dynamics",
        "email": "contact@apexglobal.example",
        "phone": "+1-555-0199",
        "tier": "GOLD",
        "currency": "USD",
        "billing_address": "100 Innovation Way, Suite 400, Austin, TX",
        "credit_limit": 75000.0,
        "payment_terms": "NET_30"
    }
    res = session.post(f"{BASE_URL}/customers", json=cust_data, headers=headers, timeout=15)
    assert res.status_code == 201, f"Create customer failed: {res.text}"
    customer = res.json()
    customer_id = customer["id"]
    print(f"   Created customer ID: {customer_id}", flush=True)

    # Verify directly in SQLite DB
    row = query_db("SELECT id, name, tier, credit_limit FROM customer WHERE id = ? OR id = ?", (customer_id, to_db_id(customer_id)))
    assert row is not None, "Customer not found in DB!"
    print(f"   Verified Customer in SQLite DB: {row}", flush=True)

    # 3. Warehouses CRUD
    print("--> 3. Testing Warehouse CRUD...", flush=True)
    wh_data = {
        "name": "Pacific Northwest Hub",
        "city": "Seattle",
        "location": "Seattle, WA",
        "is_active": True
    }
    res = session.post(f"{BASE_URL}/warehouses", json=wh_data, headers=headers, timeout=15)
    assert res.status_code == 201, f"Create warehouse failed: {res.text}"
    warehouse = res.json()
    warehouse_id = warehouse["id"]
    print(f"   Created warehouse ID: {warehouse_id}", flush=True)

    row = query_db("SELECT id, name, location, is_active FROM warehouse WHERE id = ? OR id = ?", (warehouse_id, to_db_id(warehouse_id)))
    assert row is not None, "Warehouse not found in DB!"
    print(f"   Verified Warehouse in SQLite DB: {row}", flush=True)

    # 4. Products & Price Lists check
    print("--> 4. Testing Products and Price Lists...", flush=True)
    res = session.get(f"{BASE_URL}/products", headers=headers, timeout=15)
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0, "No products found!"
    product = products[0]
    print(f"   Using product: {product['name']} (ID: {product['id']}, price: {product['price']})", flush=True)

    res = session.get(f"{BASE_URL}/price-lists", headers=headers, timeout=15)
    assert res.status_code == 200
    price_lists = res.json()
    print(f"   Found {len(price_lists)} price lists in DB.", flush=True)

    # 5. Quotation -> Approval -> Order -> Invoice -> Payment Flow
    print("--> 5. Testing Full Quotation Lifecycle...", flush=True)
    quote_payload = {
        "customer_id": customer_id,
        "items": [
            {
                "product_id": product["id"],
                "quantity": 10,
                "discount_percent": 25.0  # 25% discount triggers manager approval
            }
        ],
        "notes": "E2E automated flow quotation verification"
    }
    res = session.post(f"{BASE_URL}/quotes", json=quote_payload, headers=headers, timeout=15)
    assert res.status_code == 201, f"Create quote failed: {res.text}"
    quote = res.json()
    quote_id = quote["id"]
    print(f"   Created quote ID: {quote_id} (Status: {quote['status']})", flush=True)

    # Submit quote
    print("   Submitting quote for approval...", flush=True)
    res = session.post(f"{BASE_URL}/quotes/{quote_id}/submit", headers=headers, timeout=15)
    assert res.status_code == 200, f"Submit quote failed: {res.text}"
    quote_submitted = res.json()
    print(f"   Quote status after submit: {quote_submitted['status']}", flush=True)

    quote_row = query_db("SELECT id, status, total FROM quotation WHERE id = ? OR id = ?", (quote_id, to_db_id(quote_id)))
    print(f"   Quotation DB record: {quote_row}", flush=True)
    assert quote_row[1] in ("PENDING_APPROVAL", "APPROVED"), f"Unexpected status: {quote_row[1]}"

    # If pending approval, approve it
    if quote_row[1] == "PENDING_APPROVAL":
        print("   Checking pending approvals...", flush=True)
        res = session.get(f"{BASE_URL}/approvals/pending", headers=headers, timeout=15)
        assert res.status_code == 200
        pending_list = res.json()
        matching_approvals = [a for a in pending_list if str(a.get("quotation_id")) == str(quote_id) or str(a.get("quote_id")) == str(quote_id)]
        assert len(matching_approvals) > 0, "Approval record not found for quote!"
        approval_id = matching_approvals[0]["id"]
        print(f"   Approving quote approval ID {approval_id}...", flush=True)
        res = session.post(f"{BASE_URL}/approvals/{approval_id}/approve", json={"reason": "Approved via automated E2E test"}, headers=headers, timeout=15)
        assert res.status_code == 200, f"Approve failed: {res.text}"
        
        quote_status_row = query_db("SELECT status FROM quotation WHERE id = ? OR id = ?", (quote_id, to_db_id(quote_id)))
        assert quote_status_row[0] == "APPROVED", f"Quote is not APPROVED in DB: {quote_status_row[0]}"
        print("   Quote successfully APPROVED in DB.", flush=True)

    # Confirm quote -> Creates Order and Invoice
    print("   Confirming quote (creating order and invoice)...", flush=True)
    res = session.post(f"{BASE_URL}/quotes/{quote_id}/confirm", headers=headers, timeout=15)
    assert res.status_code == 200, f"Confirm failed: {res.text}"
    confirm_res = res.json()
    print(f"   Confirmation result: {confirm_res}", flush=True)

    # Check Order in SQLite DB
    order_row = query_db('SELECT id, status, total_amount FROM "order" WHERE quotation_id = ? OR quotation_id = ?', (quote_id, to_db_id(quote_id)))
    assert order_row is not None, "Order was not created in DB!"
    order_id = order_row[0]
    print(f"   Order verified in SQLite DB: {order_row}", flush=True)

    # Check Invoice in SQLite DB
    invoice_row = query_db('SELECT id, invoice_number, status, amount FROM invoice WHERE order_id = ? OR order_id = ?', (order_id, to_db_id(order_id)))
    assert invoice_row is not None, "Invoice was not auto-generated in DB!"
    invoice_id = invoice_row[0]
    print(f"   Invoice verified in SQLite DB: {invoice_row}", flush=True)

    # Check Invoice enriched API returns correct customer_name
    res = session.get(f"{BASE_URL}/invoices/{invoice_id}", headers=headers, timeout=15)
    assert res.status_code == 200
    inv_detail = res.json()
    assert inv_detail.get("customer_name") == "Apex Global Dynamics", f"Expected customer name, got {inv_detail.get('customer_name')}"
    print(f"   Invoice API correctly enriched with customer name: {inv_detail['customer_name']}", flush=True)

    # Settle Invoice Payment
    print(f"   Recording payment for invoice ID {invoice_id}...", flush=True)
    res = session.post(f"{BASE_URL}/invoices/{invoice_id}/pay", headers=headers, timeout=15)
    assert res.status_code == 200, f"Pay invoice failed: {res.text}"
    
    inv_paid_row = query_db("SELECT status, amount_paid, outstanding_amount FROM invoice WHERE id = ? OR id = ?", (invoice_id, to_db_id(invoice_id)))
    print(f"   Invoice payment verified in SQLite DB: {inv_paid_row}", flush=True)
    assert inv_paid_row[0] == "PAID", f"Invoice status is not PAID: {inv_paid_row[0]}"

    print("\n========================================================", flush=True)
    print(">>> ALL DATABASE CRUD & CROSS-PAGE FLOW TESTS PASSED! <<<", flush=True)
    print("========================================================\n", flush=True)

if __name__ == "__main__":
    run_test()
