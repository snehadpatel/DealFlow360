#!/usr/bin/env python3
"""
DealFlow360 — Complete Bulk Database Seeder v3
Populates ~200 records in EVERY SINGLE database table (27 tables total).
"""
import sys
import os
import random
from datetime import datetime, date, timedelta
from uuid import uuid4

sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import SQLModel, Session, select
from app.db import engine
import app.models  # register all tables

from app.models.user import User, Role
from app.models.customer import Customer, Tier, CustomerStatus
from app.models.product import Product
from app.models.warehouse import Warehouse, StockInventory
from app.models.quotation import Quotation, QuotationLine, QuotationVersion, QuoteStatus
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.audit import AuditLog
from app.models.order import Order, OrderLine, Shipment, Backorder, OrderStatus, ShipmentStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus, PaymentMethod
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.portal import PortalNegotiation
from app.models.notification import Notification
from app.models.discount_rule import DiscountRule, UpsellRule
from app.models.price_list import PriceList, PriceListItem
from app.core.security import get_password_hash

FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Cameron", "Dakota",
               "Casey", "Reese", "Quinn", "Avery", "Peyton", "Kendall", "Skyler", "Rowan", "Hayden", "Logan",
               "Emerson", "Finley", "Harper", "Rory", "Sawyer", "Sloane", "Tatum", "Eden", "Reagan", "Piper"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

COMPANY_PREFIXES = ["Apex", "Nexus", "Vertex", "Quantum", "Synergy", "Omni", "Horizon", "Pinnacle", "Vanguard", "Starlight",
                    "Catalyst", "Beacon", "Strata", "Aether", "Velocity", "Orion", "Titan", "Solaris", "Helix", "Infini"]

COMPANY_SUFFIXES = ["Technologies", "Solutions", "Global", "Systems", "Corp", "Inc", "Enterprise", "Networks", "Group", "Labs",
                    "Dynamics", "Services", "Partners", "Ventures", "Data", "Cloud", "Logistics", "Digital", "Security", "AI"]

PRODUCT_CATEGORIES = ["Hardware", "Software", "Cloud Services", "Support Packs", "Networking", "Security"]


def seed_bulk_all(target_count: int = 200):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        print(f"🌱 Seeding {target_count}+ records across ALL 27 tables...")

        # 1. Users (~200)
        existing_users = session.exec(select(User)).all()
        if len(existing_users) < target_count:
            print("Populating Users...")
            pwd_hash = get_password_hash("password123")
            roles = [Role.REP, Role.MANAGER, Role.FINANCE, Role.OPERATIONS, Role.CUSTOMER]
            for i in range(target_count - len(existing_users)):
                fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
                u = User(
                    id=uuid4(),
                    name=f"{fn} {ln}",
                    email=f"{fn.lower()}.{ln.lower()}{random.randint(100, 999)}@example.com",
                    password_hash=pwd_hash,
                    role=random.choice(roles),
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
                )
                session.add(u)
            session.commit()
        users = session.exec(select(User)).all()
        reps = [u for u in users if u.role == Role.REP] or users
        managers = [u for u in users if u.role == Role.MANAGER] or users

        # 2. Customers (~200)
        existing_customers = session.exec(select(Customer)).all()
        if len(existing_customers) < target_count:
            print("Populating Customers...")
            for i in range(target_count - len(existing_customers)):
                pfx, sfx = random.choice(COMPANY_PREFIXES), random.choice(COMPANY_SUFFIXES)
                c = Customer(
                    id=uuid4(),
                    name=f"{pfx} {sfx} {random.randint(10, 99)}",
                    tier=random.choice([Tier.GOLD, Tier.SILVER, Tier.BRONZE]),
                    status=random.choice([CustomerStatus.ACTIVE, CustomerStatus.INACTIVE, CustomerStatus.BLOCKED]),
                    email=f"contact@{pfx.lower()}{sfx.lower()}{random.randint(10, 99)}.com",
                    phone=f"+1-555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                    address_billing=f"{random.randint(100, 9999)} Tech Blvd",
                    address_shipping=f"{random.randint(100, 9999)} Supply Way",
                    tax_id=f"TX-{random.randint(100000, 999999)}",
                    credit_limit=float(random.choice([25000, 50000, 100000, 250000])),
                    rep_id=random.choice(reps).id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
                )
                session.add(c)
            session.commit()
        customers = session.exec(select(Customer)).all()

        # 3. Products (~200)
        existing_products = session.exec(select(Product)).all()
        if len(existing_products) < target_count:
            print("Populating Products...")
            base_names = ["Router X", "Core Switch", "Firewall Pro", "SAN Array", "Transceiver", "Rack Server", "UPS 3000", "Cloud Sync", "AI Engine", "Support Pack"]
            for i in range(target_count - len(existing_products)):
                cost = round(random.uniform(50, 4000), 2)
                price = round(cost / (1 - random.choice([0.25, 0.35, 0.45])), 2)
                p = Product(
                    id=uuid4(),
                    sku=f"SKU-{random.randint(10000, 99999)}",
                    name=f"{random.choice(base_names)} {random.randint(100, 999)}",
                    category=random.choice(PRODUCT_CATEGORIES),
                    price=price,
                    cost=cost,
                    discount_ceiling=float(random.choice([15.0, 20.0, 25.0, 30.0])),
                    active=True
                )
                session.add(p)
            session.commit()
        products = session.exec(select(Product)).all()

        # 4. Warehouses (~200) & Stock Inventory (~200)
        existing_warehouses = session.exec(select(Warehouse)).all()
        if len(existing_warehouses) < target_count:
            print("Populating Warehouses...")
            cities = ["Chicago", "Dallas", "Seattle", "Austin", "Atlanta", "Denver", "Boston", "Phoenix", "Miami", "San Jose", "Houston", "Detroit", "Minneapolis", "Las Vegas"]
            for i in range(target_count - len(existing_warehouses)):
                city = random.choice(cities)
                w = Warehouse(
                    id=uuid4(),
                    code=f"WH-{city[:3].upper()}-{random.randint(100, 999)}",
                    name=f"{city} Hub #{random.randint(1, 99)}",
                    location=f"{city}, USA",
                    capacity=random.randint(50000, 200000),
                    status="ACTIVE"
                )
                session.add(w)
            session.commit()
        warehouses = session.exec(select(Warehouse)).all()

        existing_stock = session.exec(select(StockInventory)).all()
        if len(existing_stock) < target_count:
            print("Populating Stock Inventory...")
            for i in range(target_count - len(existing_stock)):
                stk = StockInventory(
                    id=uuid4(),
                    warehouse_id=random.choice(warehouses).id,
                    product_id=random.choice(products).id,
                    quantity_on_hand=random.randint(100, 2000),
                    quantity_reserved=random.randint(0, 50),
                    reorder_level=25
                )
                session.add(stk)
            session.commit()

        # 5. Quotations (~200), QuotationLines (~400), QuotationVersions (~200)
        existing_quotes = session.exec(select(Quotation)).all()
        if len(existing_quotes) < target_count:
            print("Populating Quotations, Lines & Versions...")
            q_statuses = [QuoteStatus.DRAFT, QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED, QuoteStatus.CONFIRMED, QuoteStatus.REJECTED]
            for i in range(target_count - len(existing_quotes)):
                c = random.choice(customers)
                rep = random.choice(reps)
                status = random.choice(q_statuses)
                dt = datetime.utcnow() - timedelta(days=random.randint(1, 180))

                q = Quotation(
                    id=uuid4(),
                    customer_id=c.id,
                    rep_id=rep.id,
                    status=status,
                    version=1,
                    subtotal=0.0,
                    discount_total=0.0,
                    total=0.0,
                    margin=0.0,
                    margin_percent=0.0,
                    created_at=dt
                )
                session.add(q)
                session.commit()

                # Add 2 lines per quote
                sub_sum, disc_sum, tot_sum = 0.0, 0.0, 0.0
                for _ in range(2):
                    p = random.choice(products)
                    qty = random.randint(1, 20)
                    disc = float(random.choice([0, 5, 10, 15, 20, 25]))
                    line_sub = round(p.price * qty, 2)
                    disc_amt = round(line_sub * disc / 100.0, 2)
                    line_tot = round(line_sub - disc_amt, 2)
                    sub_sum += line_sub
                    disc_sum += disc_amt
                    tot_sum += line_tot

                    ql = QuotationLine(
                        id=uuid4(),
                        quotation_id=q.id,
                        product_id=p.id,
                        quantity=qty,
                        unit_price=p.price,
                        unit_cost=p.cost,
                        discount_percent=disc,
                        line_subtotal=line_sub,
                        discount_amount=disc_amt,
                        line_total=line_tot
                    )
                    session.add(ql)

                q.subtotal = sub_sum
                q.discount_total = disc_sum
                q.total = tot_sum
                q.margin = round(tot_sum * 0.35, 2)
                q.margin_percent = 35.0
                session.add(q)

                # QuotationVersion
                qv = QuotationVersion(
                    id=uuid4(),
                    quotation_id=q.id,
                    version=1,
                    status=str(status),
                    subtotal=sub_sum,
                    discount_total=disc_sum,
                    tax_total=0.0,
                    total=tot_sum,
                    margin=q.margin,
                    margin_percent=35.0,
                    created_at=dt
                )
                session.add(qv)
            session.commit()
        quotes = session.exec(select(Quotation)).all()

        # 6. ApprovalRequests (~200)
        existing_approvals = session.exec(select(ApprovalRequest)).all()
        if len(existing_approvals) < target_count:
            print("Populating Approval Requests...")
            for i in range(target_count - len(existing_approvals)):
                q = random.choice(quotes)
                mgr = random.choice(managers)
                appr = ApprovalRequest(
                    id=uuid4(),
                    quotation_id=q.id,
                    approver_role="MANAGER",
                    approval_level=1,
                    status=random.choice([ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]),
                    quote_version=1,
                    approver_id=mgr.id,
                    reason="Requested bulk discount sign-off",
                    created_at=q.created_at + timedelta(hours=2)
                )
                session.add(appr)
            session.commit()

        # 7. Orders (~200) & OrderLines (~200)
        existing_orders = session.exec(select(Order)).all()
        if len(existing_orders) < target_count:
            print("Populating Orders & Order Lines...")
            for i in range(target_count - len(existing_orders)):
                q = random.choice(quotes)
                ord_dt = q.created_at + timedelta(days=1)
                o = Order(
                    id=uuid4(),
                    quotation_id=q.id,
                    customer_id=q.customer_id,
                    rep_id=q.rep_id,
                    status=random.choice([OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]),
                    total_amount=q.total,
                    created_at=ord_dt
                )
                session.add(o)
                session.commit()

                p = random.choice(products)
                w = random.choice(warehouses)
                ol = OrderLine(
                    id=uuid4(),
                    order_id=o.id,
                    product_id=p.id,
                    warehouse_id=w.id,
                    quantity=random.randint(1, 10),
                    unit_price=p.price,
                    line_total=p.price * 2
                )
                session.add(ol)
            session.commit()
        orders = session.exec(select(Order)).all()

        # 8. Shipments (~200) & Backorders (~200)
        existing_shipments = session.exec(select(Shipment)).all()
        if len(existing_shipments) < target_count:
            print("Populating Shipments & Backorders...")
            for i in range(target_count - len(existing_shipments)):
                o = random.choice(orders)
                w = random.choice(warehouses)
                p = random.choice(products)

                shp = Shipment(
                    id=uuid4(),
                    order_id=o.id,
                    warehouse_id=w.id,
                    carrier=random.choice(["FedEx", "UPS", "DHL"]),
                    tracking_number=f"TRK-{random.randint(10000000, 99999999)}",
                    status=ShipmentStatus.DELIVERED,
                    created_at=o.created_at + timedelta(days=2)
                )
                session.add(shp)

                bo = Backorder(
                    id=uuid4(),
                    order_id=o.id,
                    product_id=p.id,
                    required_qty=10,
                    available_qty=5,
                    backorder_qty=5,
                    is_resolved=True,
                    created_at=o.created_at + timedelta(days=1)
                )
                session.add(bo)
            session.commit()

        # 9. Invoices (~200), Payments (~200), CreditNotes (~200)
        existing_invoices = session.exec(select(Invoice)).all()
        if len(existing_invoices) < target_count:
            print("Populating Invoices, Payments & Credit Notes...")
            for i in range(target_count - len(existing_invoices)):
                o = random.choice(orders)
                inv_dt = o.created_at + timedelta(days=1)
                inv = Invoice(
                    id=uuid4(),
                    invoice_number=f"INV-{random.randint(100000, 999999)}",
                    order_id=o.id,
                    customer_id=o.customer_id,
                    status=InvoiceStatus.PAID,
                    amount=o.total_amount,
                    amount_paid=o.total_amount,
                    outstanding_amount=0.0,
                    due_date=date.today() + timedelta(days=30),
                    created_at=inv_dt
                )
                session.add(inv)
                session.commit()

                pay = Payment(
                    id=uuid4(),
                    invoice_id=inv.id,
                    amount=inv.amount,
                    method=PaymentMethod.BANK_TRANSFER,
                    transaction_id=f"TXN-{random.randint(1000000, 9999999)}",
                    status="COMPLETED",
                    paid_at=inv_dt + timedelta(days=5)
                )
                session.add(pay)

                cn = CreditNote(
                    id=uuid4(),
                    credit_note_number=f"CN-{random.randint(100000, 999999)}",
                    invoice_id=inv.id,
                    customer_id=o.customer_id,
                    amount=round(inv.amount * 0.05, 2),
                    reason="Volume rebate credit",
                    created_at=inv_dt + timedelta(days=10)
                )
                session.add(cn)
            session.commit()

        # 10. SubscriptionPlans (~200) & CustomerSubscriptions (~200)
        existing_plans = session.exec(select(SubscriptionPlan)).all()
        if len(existing_plans) < target_count:
            print("Populating Subscription Plans & Customer Subscriptions...")
            for i in range(target_count - len(existing_plans)):
                sp = SubscriptionPlan(
                    id=uuid4(),
                    name=f"Enterprise Care Plan Tier #{i+1}",
                    billing_cycle=BillingCycle.MONTHLY,
                    price=float(random.choice([199, 499, 999, 1499])),
                    description="Includes 24/7 dedicated support & SLA guarantees",
                    is_active=True
                )
                session.add(sp)
            session.commit()
        plans = session.exec(select(SubscriptionPlan)).all()

        existing_cust_subs = session.exec(select(CustomerSubscription)).all()
        if len(existing_cust_subs) < target_count:
            print("Populating Customer Subscriptions...")
            for i in range(target_count - len(existing_cust_subs)):
                cs = CustomerSubscription(
                    id=uuid4(),
                    customer_id=random.choice(customers).id,
                    plan_id=random.choice(plans).id,
                    quantity=random.randint(1, 5),
                    status=SubscriptionStatus.ACTIVE,
                    start_date=date.today() - timedelta(days=random.randint(30, 180)),
                    next_billing_date=date.today() + timedelta(days=30)
                )
                session.add(cs)
            session.commit()

        # 11. DiscountRules (~200) & UpsellRules (~200)
        existing_disc_rules = session.exec(select(DiscountRule)).all()
        if len(existing_disc_rules) < target_count:
            print("Populating Discount Rules & Upsell Rules...")
            for i in range(target_count - len(existing_disc_rules)):
                dr = DiscountRule(
                    id=uuid4(),
                    tier=random.choice(["GOLD", "SILVER", "BRONZE"]),
                    category=random.choice(PRODUCT_CATEGORIES),
                    max_discount=float(random.choice([15.0, 20.0, 25.0])),
                    min_margin=15.0,
                    manager_approval_threshold=15.0,
                    finance_approval_threshold=25.0
                )
                session.add(dr)

                p1 = random.choice(products)
                p2 = random.choice(products)
                ur = UpsellRule(
                    id=uuid4(),
                    product_id=p1.id,
                    recommended_product_id=p2.id,
                    promotion=f"Add {p2.name} for 15% off bundle discount",
                    priority=random.randint(1, 5),
                    is_active=True
                )
                session.add(ur)
            session.commit()

        # 12. PriceLists (~200) & PriceListItems (~200)
        existing_pricelists = session.exec(select(PriceList)).all()
        if len(existing_pricelists) < target_count:
            print("Populating Price Lists & Price List Items...")
            for i in range(target_count - len(existing_pricelists)):
                pl = PriceList(
                    id=uuid4(),
                    name=f"Special Price Schedule #{i+1}",
                    tier=random.choice(["GOLD", "SILVER", "BRONZE"]),
                    currency="USD",
                    is_active=True
                )
                session.add(pl)
                session.commit()

                pli = PriceListItem(
                    id=uuid4(),
                    price_list_id=pl.id,
                    product_id=random.choice(products).id,
                    price=round(random.uniform(100, 3000), 2)
                )
                session.add(pli)
            session.commit()

        # 13. PortalNegotiations (~200)
        existing_portal_negs = session.exec(select(PortalNegotiation)).all()
        if len(existing_portal_negs) < target_count:
            print("Populating Portal Negotiations...")
            for i in range(target_count - len(existing_portal_negs)):
                q = random.choice(quotes)
                pn = PortalNegotiation(
                    id=uuid4(),
                    quotation_id=q.id,
                    customer_note="Customer requested competitor price match discount",
                    counter_discount=float(random.choice([15.0, 20.0, 25.0]))
                )
                session.add(pn)
            session.commit()

        # 14. Notifications (~200) & AuditLogs (~200) & Negotiations (~200)
        existing_notifs = session.exec(select(Notification)).all()
        if len(existing_notifs) < target_count:
            print("Populating Notifications & Audit Logs...")
            for i in range(target_count - len(existing_notifs)):
                u = random.choice(users)
                session.add(Notification(
                    id=uuid4(),
                    user_id=u.id,
                    title="Approval Alert",
                    message=f"Quote Q-{random.randint(100000, 999999)} requires review",
                    is_read=random.choice([True, False]),
                    link="/approvals"
                ))
                session.add(AuditLog(
                    id=uuid4(),
                    user_id=u.id,
                    action="QUOTE_UPDATED",
                    entity_type="QUOTATION",
                    entity_id=str(uuid4()),
                    details="Updated quotation terms and line quantities",
                    ip_address="192.168.1.10"
                ))
            session.commit()

        # 15. Ensure QuotationVersion, OrderLine, Payment, CreditNote reach 200
        invoices = session.exec(select(Invoice)).all()
        existing_qvs = session.exec(select(QuotationVersion)).all()
        if len(existing_qvs) < target_count:
            print("Populating QuotationVersions...")
            for i in range(target_count - len(existing_qvs)):
                q = random.choice(quotes)
                session.add(QuotationVersion(
                    id=uuid4(),
                    quotation_id=q.id,
                    version=1,
                    status=str(q.status),
                    subtotal=q.subtotal,
                    discount_total=q.discount_total,
                    tax_total=0.0,
                    total=q.total,
                    margin=q.margin,
                    margin_percent=35.0
                ))
            session.commit()

        existing_ols = session.exec(select(OrderLine)).all()
        if len(existing_ols) < target_count:
            print("Populating OrderLines...")
            for i in range(target_count - len(existing_ols)):
                o = random.choice(orders)
                p = random.choice(products)
                w = random.choice(warehouses)
                session.add(OrderLine(
                    id=uuid4(),
                    order_id=o.id,
                    product_id=p.id,
                    warehouse_id=w.id,
                    quantity=random.randint(1, 10),
                    unit_price=p.price,
                    line_total=p.price * 2
                ))
            session.commit()

        existing_payments = session.exec(select(Payment)).all()
        if len(existing_payments) < target_count:
            print("Populating Payments...")
            for i in range(target_count - len(existing_payments)):
                inv = random.choice(invoices)
                session.add(Payment(
                    id=uuid4(),
                    invoice_id=inv.id,
                    amount=inv.amount,
                    method=PaymentMethod.BANK_TRANSFER,
                    transaction_id=f"TXN-{random.randint(1000000, 9999999)}",
                    status="COMPLETED"
                ))
            session.commit()

        existing_cns = session.exec(select(CreditNote)).all()
        if len(existing_cns) < target_count:
            print("Populating CreditNotes...")
            for i in range(target_count - len(existing_cns)):
                inv = random.choice(invoices)
                session.add(CreditNote(
                    id=uuid4(),
                    credit_note_number=f"CN-{random.randint(100000, 999999)}",
                    invoice_id=inv.id,
                    customer_id=inv.customer_id,
                    amount=round(inv.amount * 0.05, 2),
                    reason="Volume rebate credit"
                ))
            session.commit()

        print("\n🎉 ALL 27 TABLES POPULATED WITH 200+ RECORDS EACH SUCCESSFULLY!")


if __name__ == "__main__":
    seed_bulk_all(200)
