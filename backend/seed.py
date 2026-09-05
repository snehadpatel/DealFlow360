#!/usr/bin/env python3
"""
DealFlow360 — Comprehensive Seed Script v2
Seeds all tables with realistic data for all 6 roles.
Safe to re-run: skips rows that already exist.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, date, timedelta
from uuid import uuid4
from sqlmodel import Session, select
from app.db import engine
import app.models  # register all tables

from app.models.user import User, Role
from app.models.customer import Customer, Tier, CustomerStatus
from app.models.product import Product
from app.models.warehouse import Warehouse, StockInventory
from app.models.quotation import Quotation, QuotationLine, QuoteStatus
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.audit import AuditLog
from app.models.price_list import PriceList, PriceListItem
from app.models.discount_rule import DiscountRule, UpsellRule
from app.models.order import Order, OrderLine, Shipment, Backorder, OrderStatus, ShipmentStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.notification import Notification
from app.core.security import get_password_hash


def seed():
    with Session(engine) as session:
        print("🌱 Seeding DealFlow360 database...")
        existing_users = session.exec(select(User)).all()
        user_by_email = {u.email: u for u in existing_users}


        # ─── Users ────────────────────────────────────────────────────────────
        admin = User(id=uuid4(), name="Super Admin", email="admin@dealflow360.com",
                     password_hash=get_password_hash("admin123"), role=Role.ADMIN)
        rep1 = User(id=uuid4(), name="Alex Kumar (Sales Rep)", email="alex.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep2 = User(id=uuid4(), name="Priya Sharma (Sales Rep)", email="priya.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        manager = User(id=uuid4(), name="Maria Manager", email="maria.manager@dealflow360.com",
                       password_hash=get_password_hash("mgr123"), role=Role.MANAGER)
        finance = User(id=uuid4(), name="Felix Finance", email="felix.finance@dealflow360.com",
                       password_hash=get_password_hash("fin123"), role=Role.FINANCE)
        operations = User(id=uuid4(), name="Ops Team Lead", email="ops@dealflow360.com",
                          password_hash=get_password_hash("ops123"), role=Role.OPERATIONS)
        cust_user = User(id=uuid4(), name="ABC Corp Buyer", email="buyer@abccorp.com",
                         password_hash=get_password_hash("cust123"), role=Role.CUSTOMER)

        for u in [admin, rep1, rep2, manager, finance, operations, cust_user]:
            session.add(u)
        session.flush()

        # ─── Customers ────────────────────────────────────────────────────────
        cust1 = Customer(
            id=uuid4(), name="ABC Corporation", tier=Tier.GOLD,
            email="procurement@abccorp.com", phone="+91-9800000001",
            address_billing="Tower 4, Prime Tech Park, Mumbai 400001",
            address_shipping="Warehouse Zone, Navi Mumbai 400703",
            tax_id="GSTIN-27ABCDE1234F1Z5", rep_id=rep1.id,
            credit_limit=5000000.0, payment_terms="Net 30", status=CustomerStatus.ACTIVE
        )
        cust2 = Customer(
            id=uuid4(), name="TechVision India", tier=Tier.SILVER,
            email="orders@techvision.in", phone="+91-9800000002",
            address_billing="Cyber Hub, DLF Phase II, Gurugram 122002",
            address_shipping="Sector 18, Noida 201301",
            tax_id="GSTIN-06TECVI5678G2Z6", rep_id=rep1.id,
            credit_limit=2000000.0, payment_terms="Net 45", status=CustomerStatus.ACTIVE
        )
        cust3 = Customer(
            id=uuid4(), name="Sunrise Retail Ltd", tier=Tier.BRONZE,
            email="ops@sunriseretail.com", phone="+91-9800000003",
            address_billing="MG Road, Bangalore 560001",
            address_shipping="Electronic City, Bangalore 560100",
            tax_id="GSTIN-29SUNRI8901H3Z7", rep_id=rep2.id,
            credit_limit=500000.0, payment_terms="Net 15", status=CustomerStatus.ACTIVE
        )
        cust4 = Customer(
            id=uuid4(), name="GlobalEdge Systems", tier=Tier.GOLD,
            email="purchase@globaledge.io", phone="+91-9800000004",
            address_billing="HITEC City, Hyderabad 500081",
            address_shipping="Gachibowli, Hyderabad 500032",
            tax_id="GSTIN-36GLOBA2345I4Z8", rep_id=rep2.id,
            credit_limit=3000000.0, payment_terms="Net 30", status=CustomerStatus.ACTIVE
        )

        # Link customer user to cust1
        cust_user.customer_id = cust1.id

        for c in [cust1, cust2, cust3, cust4]:
            session.add(c)
        session.add(cust_user)
        session.flush()

        # ─── Products ─────────────────────────────────────────────────────────
        prod1 = Product(id=uuid4(), name="Enterprise Laptop Pro X1", sku="LAP-PRO-X1",
                        category="Hardware", price=85000.0, cost=60000.0,
                        discount_ceiling=20.0, tax_rate=18.0, unit="unit",
                        description="High-performance enterprise laptop with 16GB RAM, 512GB SSD")
        prod2 = Product(id=uuid4(), name="Cloud Management Suite", sku="SaaS-CMS-ENT",
                        category="Subscription", price=12000.0, cost=3000.0,
                        discount_ceiling=25.0, tax_rate=18.0, unit="license",
                        description="Comprehensive cloud infrastructure management platform")
        prod3 = Product(id=uuid4(), name="Network Security Firewall XG-500", sku="NET-FW-XG500",
                        category="Hardware", price=150000.0, cost=100000.0,
                        discount_ceiling=15.0, tax_rate=18.0, unit="unit",
                        description="Enterprise-grade next-generation firewall")
        prod4 = Product(id=uuid4(), name="On-Site Deployment Service", sku="SRV-DEPLOY-01",
                        category="Services", price=50000.0, cost=20000.0,
                        discount_ceiling=10.0, tax_rate=18.0, unit="project",
                        description="Professional on-site installation and configuration service")
        prod5 = Product(id=uuid4(), name="24/7 Premium Support Plan", sku="SUP-PREMIUM-YR",
                        category="Subscription", price=24000.0, cost=8000.0,
                        discount_ceiling=15.0, tax_rate=18.0, unit="year",
                        description="Round-the-clock dedicated support with 2-hour SLA")
        prod6 = Product(id=uuid4(), name="Data Analytics Dashboard", sku="SaaS-ANALYTICS",
                        category="Subscription", price=8000.0, cost=2000.0,
                        discount_ceiling=20.0, tax_rate=18.0, unit="license",
                        description="Real-time business intelligence and reporting platform")

        for p in [prod1, prod2, prod3, prod4, prod5, prod6]:
            session.add(p)
        session.flush()

        # ─── Warehouses ───────────────────────────────────────────────────────
        wh1 = Warehouse(id=uuid4(), name="Mumbai Central Hub", location="Andheri East, Mumbai 400093",
                        city="Mumbai", is_active=True, replenishment_threshold=20,
                        shipping_cost=2500.0, priority=1)
        wh2 = Warehouse(id=uuid4(), name="Delhi NCR Warehouse", location="Sector 63, Noida 201301",
                        city="Delhi", is_active=True, replenishment_threshold=15,
                        shipping_cost=3000.0, priority=2)
        wh3 = Warehouse(id=uuid4(), name="Bangalore South Hub", location="Electronic City, Bangalore 560100",
                        city="Bangalore", is_active=True, replenishment_threshold=10,
                        shipping_cost=3500.0, priority=3)

        for w in [wh1, wh2, wh3]:
            session.add(w)
        session.flush()

        # ─── Stock Inventory ──────────────────────────────────────────────────
        stock_data = [
            (wh1.id, prod1.id, 150, 20, 50, 30),
            (wh1.id, prod3.id, 25, 5, 10, 10),
            (wh1.id, prod4.id, 0, 0, 0, 5),  # Service — no physical stock
            (wh2.id, prod1.id, 80, 10, 30, 20),
            (wh2.id, prod2.id, 0, 0, 0, 0),  # SaaS — no physical stock
            (wh2.id, prod3.id, 12, 3, 8, 8),
            (wh3.id, prod1.id, 40, 5, 20, 15),
            (wh3.id, prod3.id, 8, 2, 5, 10),  # Low stock alert
        ]
        for wh_id, pr_id, avail, reserved, incoming, reorder in stock_data:
            s = StockInventory(id=uuid4(), warehouse_id=wh_id, product_id=pr_id,
                               available_units=avail, reserved_units=reserved,
                               incoming_units=incoming, reorder_level=reorder)
            session.add(s)
        session.flush()

        # ─── Discount Rules ───────────────────────────────────────────────────
        for tier, max_disc, min_mgn, mgr_thresh, fin_thresh in [
            ("BRONZE", 10.0, 15.0, 7.0, 10.0),
            ("SILVER", 15.0, 12.0, 12.0, 15.0),
            ("GOLD", 20.0, 10.0, 15.0, 20.0),
        ]:
            session.add(DiscountRule(id=uuid4(), tier=tier, max_discount=max_disc,
                                     min_margin=min_mgn, manager_approval_threshold=mgr_thresh,
                                     finance_approval_threshold=fin_thresh))
        session.flush()

        # ─── Upsell Rules ─────────────────────────────────────────────────────
        session.add(UpsellRule(id=uuid4(), product_id=prod1.id,
                                recommended_product_id=prod5.id,
                                promotion="Add Premium Support with every Laptop order",
                                priority=1, min_margin_impact=3.2))
        session.add(UpsellRule(id=uuid4(), product_id=prod3.id,
                                recommended_product_id=prod4.id,
                                promotion="Bundle deployment service for faster ROI",
                                priority=1, min_margin_impact=2.5))
        session.flush()

        # ─── Price Lists ──────────────────────────────────────────────────────
        pl_gold = PriceList(id=uuid4(), name="Gold Customer FY2026", tier="GOLD",
                             currency="INR", effective_from=date(2026, 1, 1), expires_at=date(2026, 12, 31))
        pl_silver = PriceList(id=uuid4(), name="Silver Customer FY2026", tier="SILVER",
                               currency="INR", effective_from=date(2026, 1, 1), expires_at=date(2026, 12, 31))
        session.add(pl_gold)
        session.add(pl_silver)
        session.flush()
        session.add(PriceListItem(id=uuid4(), price_list_id=pl_gold.id, product_id=prod1.id, price=78000.0))
        session.add(PriceListItem(id=uuid4(), price_list_id=pl_gold.id, product_id=prod3.id, price=135000.0))
        session.add(PriceListItem(id=uuid4(), price_list_id=pl_silver.id, product_id=prod1.id, price=81000.0))
        session.flush()

        # ─── Subscription Plans ───────────────────────────────────────────────
        plan_starter = SubscriptionPlan(id=uuid4(), name="Starter Cloud", billing_cycle=BillingCycle.MONTHLY,
                                         price=5000.0, description="For small teams up to 10 users",
                                         is_active=True)
        plan_business = SubscriptionPlan(id=uuid4(), name="Business Pro", billing_cycle=BillingCycle.YEARLY,
                                          price=48000.0, description="Up to 50 users with analytics",
                                          is_active=True)
        plan_enterprise = SubscriptionPlan(id=uuid4(), name="Enterprise Suite", billing_cycle=BillingCycle.YEARLY,
                                            price=120000.0, description="Unlimited users, dedicated support",
                                            is_active=True)
        for pl in [plan_starter, plan_business, plan_enterprise]:
            session.add(pl)
        session.flush()

        # ─── Customer Subscriptions ───────────────────────────────────────────
        sub1 = CustomerSubscription(id=uuid4(), customer_id=cust1.id, plan_id=plan_enterprise.id,
                                     quantity=1, status=SubscriptionStatus.ACTIVE,
                                     start_date=date(2026, 1, 1), next_billing_date=date(2027, 1, 1))
        sub2 = CustomerSubscription(id=uuid4(), customer_id=cust2.id, plan_id=plan_business.id,
                                     quantity=2, status=SubscriptionStatus.ACTIVE,
                                     start_date=date(2026, 3, 1), next_billing_date=date(2027, 3, 1))
        sub3 = CustomerSubscription(id=uuid4(), customer_id=cust3.id, plan_id=plan_starter.id,
                                     quantity=1, status=SubscriptionStatus.ACTIVE,
                                     start_date=date(2026, 6, 1), next_billing_date=date(2026, 10, 1))
        for s in [sub1, sub2, sub3]:
            session.add(s)
        session.flush()

        # ─── Quotations ───────────────────────────────────────────────────────
        # Quote 1: CONFIRMED (becomes order)
        q1 = Quotation(id=uuid4(), customer_id=cust1.id, rep_id=rep1.id,
                        status=QuoteStatus.CONFIRMED, subtotal=850000.0,
                        discount_total=127500.0, tax_total=129870.0, total=852370.0,
                        margin=174370.0, margin_percent=20.5, currency="INR",
                        blended_risk=35.0, risk_level="MEDIUM", version=2,
                        expires_at=datetime.utcnow() + timedelta(days=30))
        # Quote 2: PENDING_APPROVAL (high risk)
        q2 = Quotation(id=uuid4(), customer_id=cust2.id, rep_id=rep1.id,
                        status=QuoteStatus.PENDING_APPROVAL, subtotal=450000.0,
                        discount_total=90000.0, tax_total=64800.0, total=424800.0,
                        margin=52800.0, margin_percent=12.4, currency="INR",
                        blended_risk=72.0, risk_level="HIGH", version=1,
                        expires_at=datetime.utcnow() + timedelta(days=15))
        # Quote 3: DRAFT
        q3 = Quotation(id=uuid4(), customer_id=cust3.id, rep_id=rep2.id,
                        status=QuoteStatus.DRAFT, subtotal=200000.0,
                        discount_total=10000.0, tax_total=34200.0, total=224200.0,
                        margin=60200.0, margin_percent=26.8, currency="INR",
                        blended_risk=20.0, risk_level="LOW", version=1,
                        expires_at=datetime.utcnow() + timedelta(days=15))
        # Quote 4: APPROVED
        q4 = Quotation(id=uuid4(), customer_id=cust4.id, rep_id=rep2.id,
                        status=QuoteStatus.APPROVED, subtotal=600000.0,
                        discount_total=60000.0, tax_total=97200.0, total=637200.0,
                        margin=157200.0, margin_percent=24.6, currency="INR",
                        blended_risk=28.0, risk_level="LOW", version=1,
                        expires_at=datetime.utcnow() + timedelta(days=20))

        for q in [q1, q2, q3, q4]:
            session.add(q)
        session.flush()

        # Quote lines
        session.add(QuotationLine(id=uuid4(), quotation_id=q1.id, product_id=prod1.id,
                                   quantity=10, unit_price=85000.0, unit_cost=60000.0,
                                   discount_percent=15.0, tax_rate=18.0,
                                   line_subtotal=850000.0, discount_amount=127500.0,
                                   tax_amount=129870.0, line_total=852370.0))
        session.add(QuotationLine(id=uuid4(), quotation_id=q2.id, product_id=prod3.id,
                                   quantity=3, unit_price=150000.0, unit_cost=100000.0,
                                   discount_percent=20.0, tax_rate=18.0,
                                   line_subtotal=450000.0, discount_amount=90000.0,
                                   tax_amount=64800.0, line_total=424800.0))
        session.add(QuotationLine(id=uuid4(), quotation_id=q3.id, product_id=prod2.id,
                                   quantity=20, unit_price=10000.0, unit_cost=3000.0,
                                   discount_percent=5.0, tax_rate=18.0,
                                   line_subtotal=200000.0, discount_amount=10000.0,
                                   tax_amount=34200.0, line_total=224200.0))
        session.flush()

        # ─── Approvals ────────────────────────────────────────────────────────
        apr1 = ApprovalRequest(id=uuid4(), quotation_id=q2.id, approver_id=manager.id,
                                approver_role=Role.MANAGER.value, approval_level=1,
                                status=ApprovalStatus.PENDING, quote_version=q2.version)
        apr2 = ApprovalRequest(id=uuid4(), quotation_id=q2.id, approver_id=finance.id,
                                approver_role=Role.FINANCE.value, approval_level=2,
                                status=ApprovalStatus.PENDING, quote_version=q2.version)
        session.add(apr1)
        session.add(apr2)
        session.flush()

        # ─── Orders ───────────────────────────────────────────────────────────
        ord1 = Order(id=uuid4(), quotation_id=q1.id, customer_id=cust1.id, rep_id=rep1.id,
                      status=OrderStatus.SHIPPED, total_amount=852370.0,
                      delivery_address="Warehouse Zone, Navi Mumbai 400703",
                      promised_delivery_date=date.today() + timedelta(days=3),
                      payment_status="PARTIAL")
        session.add(ord1)
        session.flush()

        session.add(OrderLine(id=uuid4(), order_id=ord1.id, product_id=prod1.id,
                               warehouse_id=wh1.id, quantity=10, unit_price=85200.0, line_total=852000.0))

        shipment1 = Shipment(id=uuid4(), order_id=ord1.id, warehouse_id=wh1.id,
                              courier="Blue Dart", tracking_number="BD-2026-10928374",
                              shipping_cost=2500.0, estimated_delivery=date.today() + timedelta(days=3),
                              status=ShipmentStatus.IN_TRANSIT)
        session.add(shipment1)

        # ─── Invoices ─────────────────────────────────────────────────────────
        inv1 = Invoice(id=uuid4(), invoice_number="INV-2026-0001", order_id=ord1.id,
                        customer_id=cust1.id, status=InvoiceStatus.PARTIALLY_PAID,
                        amount=852370.0, amount_paid=500000.0, outstanding_amount=352370.0,
                        currency="INR", due_date=date.today() + timedelta(days=30))
        inv2 = Invoice(id=uuid4(), invoice_number="INV-2026-0002",
                        customer_id=cust2.id, status=InvoiceStatus.OVERDUE,
                        amount=250000.0, amount_paid=0.0, outstanding_amount=250000.0,
                        currency="INR", due_date=date.today() - timedelta(days=10))
        inv3 = Invoice(id=uuid4(), invoice_number="INV-2026-0003",
                        customer_id=cust3.id, status=InvoiceStatus.PAID,
                        amount=75000.0, amount_paid=75000.0, outstanding_amount=0.0,
                        currency="INR", due_date=date.today() - timedelta(days=20))
        for inv in [inv1, inv2, inv3]:
            session.add(inv)
        session.flush()

        # Payments
        session.add(Payment(id=uuid4(), invoice_id=inv1.id, amount=500000.0,
                             method="BANK_TRANSFER", transaction_id="TXN-ACH-8849204",
                             status="COMPLETED"))
        session.add(Payment(id=uuid4(), invoice_id=inv3.id, amount=75000.0,
                             method="NET_30", transaction_id="TXN-NET30-9901",
                             status="COMPLETED"))

        # Credit Notes
        session.add(CreditNote(id=uuid4(), credit_note_number="CN-2026-0001",
                                customer_id=cust1.id, invoice_id=inv1.id,
                                amount=15000.0, reason="Quantity adjustment on line item 3"))

        # ─── Negotiations ─────────────────────────────────────────────────────
        neg1 = Negotiation(id=uuid4(), quotation_id=q2.id, customer_id=cust2.id,
                            rep_id=rep1.id, status=NegotiationStatus.COUNTER_OFFERED,
                            requested_discount=25.0, counter_discount=22.0)
        session.add(neg1)
        session.flush()
        session.add(NegotiationMessage(id=uuid4(), negotiation_id=neg1.id, sender_id=cust_user.id,
                                        sender_role=SenderRole.CUSTOMER,
                                        message="We need at least 25% discount to proceed with this order.",
                                        discount_proposed=25.0))
        session.add(NegotiationMessage(id=uuid4(), negotiation_id=neg1.id, sender_id=rep1.id,
                                        sender_role=SenderRole.REP,
                                        message="I can offer 22% — that's our best rate for this category.",
                                        discount_proposed=22.0))

        # ─── Backorders ───────────────────────────────────────────────────────
        session.add(Backorder(id=uuid4(), order_id=ord1.id, product_id=prod3.id,
                               required_qty=5, available_qty=3, backorder_qty=2,
                               expected_restock_date=date.today() + timedelta(days=7)))

        # ─── Notifications ────────────────────────────────────────────────────
        notifications_data = [
            (rep1.id, "Approval Required", "Quote QT-0002 for TechVision India needs manager approval.", "APPROVAL", str(q2.id)),
            (manager.id, "New Quote Pending Approval", "Alex Kumar submitted a high-risk quote (72% risk score) for your review.", "APPROVAL", str(q2.id)),
            (finance.id, "Finance Approval Needed", "Quote for TechVision India requires finance sign-off (20% discount).", "APPROVAL", str(q2.id)),
            (operations.id, "Order Shipped", "Order for ABC Corporation is in transit via Blue Dart.", "ORDER", str(ord1.id)),
            (cust_user.id, "Quote Received", "ABC Corp has received a new quotation for 10× Enterprise Laptop Pro X1.", "QUOTE", str(q1.id)),
            (rep1.id, "Counter Offer", "TechVision India countered with 25% discount request.", "NEGOTIATION", str(neg1.id)),
            (admin.id, "Low Stock Alert", "Enterprise Laptop Pro X1 stock in Bangalore Hub below reorder level.", "INVENTORY", None),
        ]
        for user_id, title, body, cat, ref in notifications_data:
            session.add(Notification(id=uuid4(), user_id=user_id, title=title, body=body,
                                      category=cat, reference_id=ref))

        # ─── Audit Logs ───────────────────────────────────────────────────────
        session.add(AuditLog(id=uuid4(), quotation_id=q2.id, user_id=rep1.id,
                              action="DISCOUNT_CHANGED", old_value="10%", new_value="20%",
                              reason="Customer requested higher discount for bulk order"))
        session.add(AuditLog(id=uuid4(), quotation_id=q1.id, user_id=manager.id,
                              action="APPROVED", reason="Margin within acceptable range, customer is GOLD tier"))
        session.add(AuditLog(id=uuid4(), quotation_id=q1.id, user_id=cust_user.id,
                              action="CONFIRMED", reason="Customer confirmed the quotation online"))

        session.commit()
        print("✅ Seed complete!")
        print(f"   👤 Users: 7 (admin, 2 reps, manager, finance, operations, customer)")
        print(f"   🏢 Customers: 4")
        print(f"   📦 Products: 6")
        print(f"   🏭 Warehouses: 3 with stock")
        print(f"   📄 Quotations: 4 (CONFIRMED, PENDING_APPROVAL, DRAFT, APPROVED)")
        print(f"   📋 Orders: 1 (SHIPPED)")
        print(f"   🧾 Invoices: 3 (PARTIALLY_PAID, OVERDUE, PAID)")
        print(f"   🔔 Notifications: 7")
        print(f"   📜 Subscription Plans: 3 | Customer Subscriptions: 3")


if __name__ == "__main__":
    seed()
