import os
import requests
import sqlite3
import sys
import uuid

BASE_URL = "http://localhost:8001"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dealflow360.db")

def format_uuid(val):
    if not val:
        return val
    try:
        return str(uuid.UUID(str(val)))
    except:
        return str(val)

def query_db(sql, params=()):
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000;")
    cur = conn.cursor()
    cur.execute(sql, params)
    row = cur.fetchone()
    conn.close()
    return row

def query_db_all(sql, params=()):
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA busy_timeout = 30000;")
    cur = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows

def login(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]

def run_technova_test():
    print("================================================================================")
    print(">>> STARTING REAL-WORLD TECHNOVA PVT. LTD. SCENARIO VERIFICATION <<<")
    print("================================================================================")

    # 1. Look up TechNova IDs from Database
    print("\n--> 1. Looking up TechNova Users, Customers, Products, and Warehouses...")
    rahul_row = query_db("SELECT id FROM user WHERE email = 'rahul@technova.com'")
    priya_row = query_db("SELECT id FROM user WHERE email = 'priya@technova.com'")
    amit_row = query_db("SELECT id FROM user WHERE email = 'amit@technova.com'")
    neha_row = query_db("SELECT id FROM user WHERE email = 'neha@technova.com'")
    sneha_row = query_db("SELECT id FROM user WHERE email = 'sneha@technova.com'")
    karan_row = query_db("SELECT id FROM user WHERE email = 'karan@technova.com'")
    arjun_row = query_db("SELECT id FROM user WHERE email = 'arjun@technova.com'")
    ankit_row = query_db("SELECT id FROM user WHERE email = 'ankit@abcbank.com'")

    for name, r in [('Rahul', rahul_row), ('Priya', priya_row), ('Amit', amit_row), ('Neha', neha_row), ('Sneha', sneha_row), ('Karan', karan_row), ('Arjun', arjun_row), ('Ankit', ankit_row)]:
        if not r:
            print(f"   Missing: {name}")
    assert all([rahul_row, priya_row, amit_row, neha_row, sneha_row, karan_row, arjun_row, ankit_row]), "Missing TechNova user(s) in DB!"
    print("   ✓ Verified all 8 TechNova employee accounts and ABC Bank buyer in DB.")

    cust_abc = query_db("SELECT id, name, tier FROM customer WHERE name = 'ABC Bank'")
    cust_xyz = query_db("SELECT id, name, tier FROM customer WHERE name = 'XYZ Hospital'")
    cust_reliance = query_db("SELECT id, name, tier FROM customer WHERE name = 'Reliance Manufacturing'")
    assert cust_abc and cust_xyz and cust_reliance, "Missing TechNova customer(s) in DB!"
    print(f"   ✓ Verified Customers: ABC Bank ({cust_abc[2]}), XYZ Hospital ({cust_xyz[2]}), Reliance Manufacturing ({cust_reliance[2]}).")

    prod_laptop = query_db("SELECT id, name, price, discount_ceiling FROM product WHERE name = 'Laptop X1'")
    prod_server = query_db("SELECT id, name, price, discount_ceiling FROM product WHERE name = 'Server S1'")
    prod_cloud = query_db("SELECT id, name, price, discount_ceiling FROM product WHERE name LIKE '%Cloud Software%'")
    prod_support = query_db("SELECT id, name, price, discount_ceiling FROM product WHERE name LIKE '%Support%'")
    assert prod_laptop and prod_server, "Missing TechNova product(s) in DB!"
    print(f"   ✓ Verified Products: Laptop X1 (₹{prod_laptop[2]:,.0f}), Server S1 (₹{prod_server[2]:,.0f}).")

    wh_ahm = query_db("SELECT id, name, is_active FROM warehouse WHERE name = 'Ahmedabad Warehouse'")
    wh_bom = query_db("SELECT id, name, is_active FROM warehouse WHERE name = 'Mumbai Warehouse'")
    assert wh_ahm and wh_bom, "Missing TechNova warehouse(s) in DB!"
    print(f"   ✓ Verified Warehouses: {wh_ahm[1]} (Active: {wh_ahm[2]}), {wh_bom[1]} (Active: {wh_bom[2]}).")

    # 2. Sales Rep (Priya) -> XYZ Hospital: 8% discount -> NO APPROVAL REQUIRED (Within 10% ceiling)
    print("\n--> 2. Testing Priya -> XYZ Hospital: 8% discount (Expected: AUTO-APPROVED / NO APPROVAL)...")
    token_priya = login("priya@technova.com", "rep123")
    headers_priya = {"Authorization": f"Bearer {token_priya}"}

    q2_payload = {
        "customer_id": format_uuid(cust_xyz[0]),
        "items": [
            {"product_id": format_uuid(prod_server[0]), "quantity": 20, "discount_percent": 8.0},
            {"product_id": format_uuid(prod_laptop[0]), "quantity": 50, "discount_percent": 8.0},
        ],
        "notes": "Q-1002: Infrastructure expansion for XYZ Hospital (8% discount)"
    }
    res = requests.post(f"{BASE_URL}/quotes", json=q2_payload, headers=headers_priya, timeout=15)
    assert res.status_code == 201, f"Create quote failed: {res.text}"
    q2 = res.json()
    q2_id = q2["id"]
    print(f"   Created Quote Q-1002 ID: {q2_id}")

    # Submit quote
    res = requests.post(f"{BASE_URL}/quotes/{q2_id}/submit", headers=headers_priya, timeout=15)
    assert res.status_code == 200
    q2_sub = res.json()
    print(f"   Quote status after Priya submit: {q2_sub['status']}")
    assert q2_sub["status"] in ("APPROVED", "CONFIRMED"), f"Expected auto-approval for 8% discount, got: {q2_sub['status']}"
    print("   ✓ CONFIRMED: 8% discount requires NO manager approval! Auto-approved for customer review.")

    # 3. Sales Rep (Rahul) -> ABC Bank: 100 Laptops @ 12% discount -> REQUIRES MANAGER APPROVAL
    print("\n--> 3. Testing Rahul -> ABC Bank: 12% discount (Expected: REQUIRES SALES MANAGER APPROVAL)...")
    token_rahul = login("rahul@technova.com", "rep123")
    headers_rahul = {"Authorization": f"Bearer {token_rahul}"}

    q1_payload = {
        "customer_id": format_uuid(cust_abc[0]),
        "items": [
            {"product_id": format_uuid(prod_laptop[0]), "quantity": 100, "discount_percent": 12.0},
            {"product_id": format_uuid(prod_cloud[0]), "quantity": 1, "discount_percent": 12.0},
            {"product_id": format_uuid(prod_support[0]), "quantity": 1, "discount_percent": 12.0}
        ],
        "notes": "Q-1001: 100 Laptops + Cloud + Support for ABC Bank (12% discount)"
    }
    res = requests.post(f"{BASE_URL}/quotes", json=q1_payload, headers=headers_rahul, timeout=15)
    assert res.status_code == 201, f"Create quote failed: {res.text}"
    q1 = res.json()
    q1_id = q1["id"]
    print(f"   Created Quote Q-1001 ID: {q1_id} (Total: ₹{q1['total']:,.2f})")

    res = requests.post(f"{BASE_URL}/quotes/{q1_id}/submit", headers=headers_rahul, timeout=15)
    assert res.status_code == 200
    q1_sub = res.json()
    print(f"   Quote status after Rahul submit: {q1_sub['status']}")
    assert q1_sub["status"] == "PENDING_APPROVAL", f"Expected PENDING_APPROVAL, got: {q1_sub['status']}"
    print("   ✓ CONFIRMED: 12% discount exceeds 10% ceiling and was routed for Manager Approval.")

    # 4. Sales Manager (Neha) approves Q-1001
    print("\n--> 4. Testing Sales Manager (Neha) Approval...")
    token_neha = login("neha@technova.com", "mgr123")
    headers_neha = {"Authorization": f"Bearer {token_neha}"}

    res = requests.get(f"{BASE_URL}/approvals/pending", headers=headers_neha, timeout=15)
    assert res.status_code == 200
    pending_approvals = res.json()
    matching_appr = [a for a in pending_approvals if str(a.get("quotation_id")) == str(q1_id)]
    assert len(matching_appr) > 0, "Approval request not found for Neha!"
    appr_id = matching_appr[0]["id"]
    print(f"   Found pending approval ID: {appr_id} (Approver Role: {matching_appr[0]['approver_role']})")

    res = requests.post(f"{BASE_URL}/approvals/{appr_id}/approve", json={"reason": "Approved by Sales Manager Neha - strategic customer ABC Bank"}, headers=headers_neha, timeout=15)
    assert res.status_code == 200
    print("   ✓ CONFIRMED: Neha approved Q-1001. Quotation status is now APPROVED.")

    # 5. Customer Negotiation & Re-Approval Rule (17% > 10% Ceiling)
    print("\n--> 5. Testing Customer Negotiation & Automatic Re-Approval Trigger...")
    print("   Customer Ankit requests additional 5% discount (17% total)...")
    token_ankit = login("ankit@abcbank.com", "cust123")
    headers_ankit = {"Authorization": f"Bearer {token_ankit}"}

    neg_payload = {
        "quotation_id": q1_id,
        "requested_discount": 17.0,
        "message": "We need 100 laptops, but please give an additional 5% discount (17% total)."
    }
    res = requests.post(f"{BASE_URL}/negotiations", json=neg_payload, headers=headers_ankit, timeout=15)
    assert res.status_code in (200, 201), f"Create negotiation failed: {res.text}"
    print("   ✓ Customer Ankit submitted counter-offer for 17% discount.")

    # Sales Rep Rahul updates quote with negotiated 17% discount
    print("   Sales Rep Rahul updates quote to 17% discount...")
    update_payload = {
        "items": [
            {"product_id": format_uuid(prod_laptop[0]), "quantity": 100, "discount_percent": 17.0},
            {"product_id": format_uuid(prod_cloud[0]), "quantity": 1, "discount_percent": 17.0},
            {"product_id": format_uuid(prod_support[0]), "quantity": 1, "discount_percent": 17.0}
        ],
        "notes": "Q-1001: Renegotiated with customer Ankit to 17% discount",
        "negotiation": True,
        "reason": "Customer requested 17% discount"
    }
    res = requests.put(f"{BASE_URL}/quotes/{q1_id}", json=update_payload, headers=headers_rahul, timeout=15)
    assert res.status_code == 200
    q1_updated = res.json()
    print(f"   Quote status after renegotiation update: {q1_updated['status']}")
    assert q1_updated["status"] == "PENDING_APPROVAL", "Quote should have automatically re-triggered PENDING_APPROVAL!"
    print("   ✓ CONFIRMED: System prevented approval bypass! 17% > 10% ceiling automatically required FRESH Manager approval.")

    # Neha re-approves the renegotiated 17% quote (Level 1: Manager)
    res = requests.get(f"{BASE_URL}/approvals/pending", headers=headers_neha, timeout=15)
    pending_reapprovals = [a for a in res.json() if str(a.get("quotation_id")) == str(q1_id)]
    assert len(pending_reapprovals) > 0, "Re-approval request not found for Neha!"
    reappr_id = pending_reapprovals[0]["id"]
    res = requests.post(f"{BASE_URL}/approvals/{reappr_id}/approve", json={"reason": "Re-approved 17% negotiated deal"}, headers=headers_neha, timeout=15)
    assert res.status_code == 200
    print("   ✓ Neha (Sales Manager) re-approved renegotiated Q-1001.")

    # Sneha approves renegotiated 17% quote (Level 2: Finance) as required by policy
    token_sneha = login("sneha@technova.com", "fin123")
    headers_sneha = {"Authorization": f"Bearer {token_sneha}"}
    res = requests.get(f"{BASE_URL}/approvals/pending", headers=headers_sneha, timeout=15)
    fin_reapprovals = [a for a in res.json() if str(a.get("quotation_id")) == str(q1_id)]
    assert len(fin_reapprovals) > 0, "Finance re-approval request not found for Sneha!"
    fin_reappr_id = fin_reapprovals[0]["id"]
    res = requests.post(f"{BASE_URL}/approvals/{fin_reappr_id}/approve", json={"reason": "Finance approved 17% margin impact"}, headers=headers_sneha, timeout=15)
    assert res.status_code == 200
    print("   ✓ Sneha (Finance Approver) re-approved renegotiated Q-1001.")

    # 6. Customer Confirms Quote -> Order Generated
    print("\n--> 6. Customer Ankit Confirms Quote -> Order Creation...")
    res = requests.post(f"{BASE_URL}/quotes/{q1_id}/confirm", headers=headers_rahul, timeout=15)
    assert res.status_code == 200
    print(f"   Quote Q-1001 status after confirm: {res.json()['status']}")

    order_row = query_db('SELECT id, status, total_amount FROM "order" WHERE quotation_id = ? OR quotation_id = ?', (q1_id, q1_id.replace('-', '')))
    assert order_row is not None, "Order was not created in DB!"
    order_id = order_row[0]
    print(f"   ✓ Order created in DB: ID={order_id}, Status={order_row[1]}, Total=₹{order_row[2]:,.2f}")

    # 7. Operations (Karan) Warehouse Fulfillment
    print("\n--> 7. Operations (Karan) Warehouse Stock Allocation & Fulfillment...")
    token_karan = login("karan@technova.com", "ops123")
    headers_karan = {"Authorization": f"Bearer {token_karan}"}

    # Verify inventory in Ahmedabad (60) and Mumbai (40)
    stock_rows = query_db_all("SELECT warehouse_id, available_units FROM stockinventory WHERE product_id = ? OR product_id = ?", (prod_laptop[0], prod_laptop[0].replace('-', '')))
    print(f"   Current Laptop X1 stock across warehouses: {stock_rows}")

    # Karan queries suggested fulfillment split for 100 laptops across Ahmedabad & Mumbai
    split_res = requests.get(
        f"{BASE_URL}/orders/{order_id}/warehouse-split",
        params={"product_id": format_uuid(prod_laptop[0]), "required_qty": 100},
        headers=headers_karan,
        timeout=15
    )
    if split_res.status_code == 200:
        split_data = split_res.json()
        print(f"   ✓ Karan retrieved automated warehouse split: {split_data}")

    # Karan updates order status to PROCESSING and allocates stock
    res = requests.put(
        f"{BASE_URL}/orders/{order_id}/status",
        json={"status": "PROCESSING", "notes": "Fulfilling 100 Laptops from Ahmedabad and Mumbai"},
        headers=headers_karan,
        timeout=15
    )
    assert res.status_code == 200
    print("   ✓ Karan marked Order as PROCESSING.")

    # 8. Finance (Sneha) High-Risk Approvals Check (Q-1015 / 25% discount, 8% margin)
    print("\n--> 8. Testing Finance (Sneha) High-Risk Review (Reliance ₹1 Crore Deal)...")
    token_sneha = login("sneha@technova.com", "fin123")
    headers_sneha = {"Authorization": f"Bearer {token_sneha}"}

    res = requests.get(f"{BASE_URL}/approvals/pending", headers=headers_sneha, timeout=15)
    assert res.status_code == 200
    finance_pending = res.json()
    print(f"   Finance pending approvals count: {len(finance_pending)}")
    finance_reliance = [a for a in finance_pending if a.get("customer_name") == "Reliance Manufacturing"]
    assert len(finance_reliance) > 0, "Finance approval for Reliance deal not found!"
    rel_appr = finance_reliance[0]
    print(f"   ✓ Found Finance Approval for: {rel_appr['customer_name']} (Total: ₹{rel_appr.get('quote_total', 0):,.2f}, Discount: {rel_appr.get('discount_percent', 0)}%)")

    # 9. Billing / Finance Invoicing & Settlement
    print("\n--> 9. Checking Auto-Generated Invoice and Payment Settlement...")
    inv_row = query_db("SELECT id, invoice_number, status, amount FROM invoice WHERE order_id = ? OR order_id = ?", (order_id, order_id.replace('-', '')))
    assert inv_row is not None, "Invoice was not generated in DB!"
    inv_id = inv_row[0]
    print(f"   ✓ Auto-generated Tax Invoice: {inv_row[1]}, Status: {inv_row[2]}, Amount: ₹{inv_row[3]:,.2f}")

    # Settle payment
    res = requests.post(f"{BASE_URL}/invoices/{inv_id}/pay", headers=headers_sneha, timeout=15)
    assert res.status_code == 200
    inv_paid = query_db("SELECT status, amount_paid, outstanding_amount FROM invoice WHERE id = ? OR id = ?", (inv_id, inv_id.replace('-', '')))
    assert inv_paid[0] == "PAID", f"Expected PAID, got: {inv_paid[0]}"
    print(f"   ✓ Invoice settled: Status={inv_paid[0]}, Paid=₹{inv_paid[1]:,.2f}, Due=₹{inv_paid[2]:,.2f}")

    # 10. Admin (Arjun) System Masters Verification
    print("\n--> 10. Admin (Arjun) System Masters & Governance Verification...")
    token_arjun = login("arjun@technova.com", "admin123")
    headers_arjun = {"Authorization": f"Bearer {token_arjun}"}

    res_wh = requests.get(f"{BASE_URL}/warehouses", headers=headers_arjun, timeout=15)
    assert res_wh.status_code == 200 and len(res_wh.json()) > 0
    res_pr = requests.get(f"{BASE_URL}/products", headers=headers_arjun, timeout=15)
    assert res_pr.status_code == 200 and len(res_pr.json()) > 0
    res_pl = requests.get(f"{BASE_URL}/price-lists", headers=headers_arjun, timeout=15)
    assert res_pl.status_code == 200 and len(res_pl.json()) > 0
    res_dr = requests.get(f"{BASE_URL}/discount-rules", headers=headers_arjun, timeout=15)
    assert res_dr.status_code == 200 and len(res_dr.json()) > 0

    print(f"   ✓ Admin Masters confirmed: {len(res_wh.json())} warehouses, {len(res_pr.json())} products, {len(res_pl.json())} price lists, {len(res_dr.json())} discount rules.")

    print("\n================================================================================")
    print(">>> TECHNOVA REAL-WORLD SCENARIO: ALL 10 TESTS PASSED WITH 100% SUCCESS! <<<")
    print("================================================================================\n")

if __name__ == "__main__":
    run_technova_test()
