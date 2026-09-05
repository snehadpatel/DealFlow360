#!/usr/bin/env python3
"""
Populate rich, realistic B2B dataset for buyer@abccorp.com (customer_id: d2b93a51-7f2e-4bbc-abab-c7506ba13250)
and all Customer users in dealflow360.db.
"""
import os
import sys
import random
from datetime import datetime, date, timedelta
from uuid import uuid4

sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import create_engine, Session, select
import app.models
from app.models.user import User, Role
from app.models.customer import Customer
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.quotation import Quotation, QuotationLine, QuotationVersion, QuoteStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus, PaymentMethod
from app.models.order import Order, OrderLine, Shipment, ShipmentStatus, OrderStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole

def seed():
    db_path = os.path.abspath('dealflow360.db')
    print("Database path:", db_path)
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == 'buyer@abccorp.com')).first()
        if not user or not user.customer_id:
            print("❌ buyer@abccorp.com not found!")
            return

        cust_id = user.customer_id
        customer = session.exec(select(Customer).where(Customer.id == cust_id)).first()
        print(f"Targeting Customer: {customer.name if customer else 'Unknown'} ({cust_id})")

        products = session.exec(select(Product)).all()
        warehouses = session.exec(select(Warehouse)).all()
        plans = session.exec(select(SubscriptionPlan)).all()
        reps = session.exec(select(User).where(User.role == Role.REP)).all()
        rep_user = reps[0] if reps else user

        print(f"Base data: {len(products)} products, {len(warehouses)} warehouses, {len(plans)} plans")

        # 1. Add 18 Quotations for buyer@abccorp.com across ALL statuses
        quote_scenarios = [
            (QuoteStatus.CONFIRMED, 120, "Global Data Center Expansion", 0.0),
            (QuoteStatus.APPROVED, 45, "Enterprise Security License Upgrade", 10.0),
            (QuoteStatus.PENDING_APPROVAL, 10, "Q3 Cloud Operations Hardware Bundle", 15.0),
            (QuoteStatus.DRAFT, 2, "AI Engine Add-on Pilot", 5.0),
            (QuoteStatus.REJECTED, 90, "Legacy Router Replacement Pack", 25.0),
            (QuoteStatus.EXPIRED, 180, "2025 SLA Renewal Package", 8.0),
            (QuoteStatus.CONFIRMED, 75, "High-Throughput SAN Storage Array", 12.0),
            (QuoteStatus.APPROVED, 30, "Multi-Cloud Transceiver Expansion", 7.5),
            (QuoteStatus.PENDING_APPROVAL, 5, "Rack Server Cluster & Power Backup", 18.0),
            (QuoteStatus.CONFIRMED, 150, "Annual Dedicated Support Package", 0.0),
            (QuoteStatus.CONFIRMED, 210, "Initial Core Infrastructure Setup", 5.0),
            (QuoteStatus.DRAFT, 1, "Disaster Recovery Node Expansion", 10.0),
            (QuoteStatus.APPROVED, 20, "Network Edge Firewall Refresh", 12.5),
            (QuoteStatus.CONFIRMED, 60, "UPS Power & Monitoring Bundle", 4.0),
            (QuoteStatus.REJECTED, 110, "Custom AI Ops Training & Onboarding", 30.0),
            (QuoteStatus.CONFIRMED, 14, "Autonomous Failover Cluster Node", 8.0),
            (QuoteStatus.PENDING_APPROVAL, 3, "Security Operations Center Analytics", 12.0),
            (QuoteStatus.APPROVED, 8, "High-Availability Load Balancer Pair", 15.0),
        ]

        created_quotes = []
        for status, days_ago, note, disc in quote_scenarios:
            dt = datetime.utcnow() - timedelta(days=days_ago)
            q = Quotation(
                id=uuid4(),
                customer_id=cust_id,
                rep_id=rep_user.id,
                status=status,
                version=1,
                subtotal=0.0,
                discount_total=0.0,
                total=0.0,
                margin=0.0,
                margin_percent=32.5,
                created_at=dt,
                valid_until=(dt + timedelta(days=30)).date(),
            )
            session.add(q)
            session.commit()

            selected_prods = random.sample(products, min(len(products), random.randint(2, 4)))
            subtotal, disc_total, grand_total = 0.0, 0.0, 0.0

            for p in selected_prods:
                qty = random.randint(2, 15)
                l_sub = round(p.price * qty, 2)
                l_disc = round(l_sub * (disc / 100.0), 2)
                l_tot = round(l_sub - l_disc, 2)

                subtotal += l_sub
                disc_total += l_disc
                grand_total += l_tot

                line = QuotationLine(
                    id=uuid4(),
                    quotation_id=q.id,
                    product_id=p.id,
                    quantity=qty,
                    unit_price=p.price,
                    unit_cost=p.cost,
                    discount_percent=disc,
                    line_subtotal=l_sub,
                    discount_amount=l_disc,
                    line_total=l_tot,
                )
                session.add(line)

            q.subtotal = round(subtotal, 2)
            q.discount_total = round(disc_total, 2)
            q.total = round(grand_total, 2)
            q.margin = round(grand_total * 0.325, 2)
            session.add(q)

            qv = QuotationVersion(
                id=uuid4(),
                quotation_id=q.id,
                version=1,
                status=str(status.value if hasattr(status, 'value') else status),
                subtotal=q.subtotal,
                discount_total=q.discount_total,
                tax_total=0.0,
                total=q.total,
                margin=q.margin,
                margin_percent=32.5,
                created_at=dt,
                reason=note,
            )
            session.add(qv)
            created_quotes.append(q)

        session.commit()
        print(f"✅ Added {len(created_quotes)} Quotations for {user.email}")

        # 2. Add 14 Invoices, Orders & Shipments
        confirmed_quotes = [q for q in created_quotes if q.status == QuoteStatus.CONFIRMED]
        if not confirmed_quotes:
            confirmed_quotes = created_quotes

        inv_specs = [
            (InvoiceStatus.PAID, 115, "INV-2026-001"),
            (InvoiceStatus.PAID, 70, "INV-2026-002"),
            (InvoiceStatus.PAID, 55, "INV-2026-003"),
            (InvoiceStatus.SENT, 10, "INV-2026-004"),
            (InvoiceStatus.OVERDUE, 40, "INV-2026-005"),
            (InvoiceStatus.PAID, 200, "INV-2026-006"),
            (InvoiceStatus.SENT, 5, "INV-2026-007"),
            (InvoiceStatus.PAID, 140, "INV-2026-008"),
            (InvoiceStatus.OVERDUE, 35, "INV-2026-009"),
            (InvoiceStatus.PAID, 95, "INV-2026-010"),
            (InvoiceStatus.PARTIALLY_PAID, 8, "INV-2026-011"),
            (InvoiceStatus.PAID, 160, "INV-2026-012"),
            (InvoiceStatus.SENT, 2, "INV-2026-013"),
            (InvoiceStatus.OVERDUE, 15, "INV-2026-014"),
        ]

        for idx, (inv_status, days_ago, inv_num) in enumerate(inv_specs):
            ref_q = confirmed_quotes[idx % len(confirmed_quotes)]
            inv_dt = datetime.utcnow() - timedelta(days=days_ago)

            ord_obj = Order(
                id=uuid4(),
                quotation_id=ref_q.id,
                customer_id=cust_id,
                rep_id=rep_user.id,
                status=OrderStatus.DELIVERED if inv_status == InvoiceStatus.PAID else OrderStatus.SHIPPED,
                total_amount=ref_q.total,
                created_at=inv_dt,
            )
            session.add(ord_obj)
            session.commit()

            ol = OrderLine(
                id=uuid4(),
                order_id=ord_obj.id,
                product_id=products[0].id,
                warehouse_id=warehouses[0].id,
                quantity=5,
                unit_price=products[0].price,
                line_total=ref_q.total,
            )
            session.add(ol)

            shp = Shipment(
                id=uuid4(),
                order_id=ord_obj.id,
                warehouse_id=warehouses[0].id,
                carrier=random.choice(["FedEx Express", "UPS Ground", "DHL Express"]),
                tracking_number=f"TRK-{random.randint(100000000, 999999999)}",
                status=ShipmentStatus.DELIVERED if inv_status == InvoiceStatus.PAID else ShipmentStatus.IN_TRANSIT,
                created_at=inv_dt + timedelta(days=1),
            )
            session.add(shp)

            amt_paid = ref_q.total if inv_status == InvoiceStatus.PAID else (round(ref_q.total * 0.5, 2) if inv_status == InvoiceStatus.PARTIALLY_PAID else 0.0)
            out_amt = round(ref_q.total - amt_paid, 2)

            inv = Invoice(
                id=uuid4(),
                invoice_number=inv_num,
                order_id=ord_obj.id,
                customer_id=cust_id,
                status=inv_status,
                amount=ref_q.total,
                amount_paid=amt_paid,
                outstanding_amount=out_amt,
                due_date=(inv_dt + timedelta(days=30)).date(),
                created_at=inv_dt,
            )
            session.add(inv)
            session.commit()

            if amt_paid > 0:
                pay = Payment(
                    id=uuid4(),
                    invoice_id=inv.id,
                    amount=amt_paid,
                    method=random.choice([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD]),
                    transaction_id=f"TXN-ONLINE-{random.randint(100000, 999999)}",
                    status="COMPLETED",
                    paid_at=inv_dt + timedelta(days=12),
                )
                session.add(pay)

            if idx % 3 == 0:
                cn = CreditNote(
                    id=uuid4(),
                    credit_note_number=f"CN-REBATE-{random.randint(1000, 9999)}",
                    invoice_id=inv.id,
                    customer_id=cust_id,
                    amount=round(inv.amount * 0.05, 2),
                    reason="Quarterly Enterprise Volume Rebate Credit",
                    created_at=inv_dt + timedelta(days=15),
                )
                session.add(cn)

        session.commit()
        print("✅ Added 14 Invoices, Orders & Shipments")

        # 3. Add 9 Subscriptions
        sub_specs = [
            (SubscriptionStatus.ACTIVE, 0, BillingCycle.MONTHLY, 3),
            (SubscriptionStatus.ACTIVE, 1, BillingCycle.YEARLY, 1),
            (SubscriptionStatus.ACTIVE, 2, BillingCycle.QUARTERLY, 5),
            (SubscriptionStatus.PAUSED, 3, BillingCycle.MONTHLY, 2),
            (SubscriptionStatus.ACTIVE, 4, BillingCycle.YEARLY, 10),
            (SubscriptionStatus.CANCELLED, 5, BillingCycle.MONTHLY, 1),
            (SubscriptionStatus.ACTIVE, 6, BillingCycle.MONTHLY, 4),
            (SubscriptionStatus.PAUSED, 7, BillingCycle.YEARLY, 2),
            (SubscriptionStatus.ACTIVE, 8, BillingCycle.MONTHLY, 6),
        ]

        for s_status, plan_idx, cycle, qty in sub_specs:
            plan = plans[plan_idx % len(plans)]
            start_d = date.today() - timedelta(days=random.randint(60, 300))
            next_d = date.today() + timedelta(days=random.randint(10, 45)) if s_status == SubscriptionStatus.ACTIVE else None

            sub = CustomerSubscription(
                id=uuid4(),
                customer_id=cust_id,
                plan_id=plan.id,
                quantity=qty,
                status=s_status,
                start_date=start_d,
                next_billing_date=next_d,
            )
            session.add(sub)

        session.commit()
        print("✅ Added 9 Subscriptions")

        # 4. Add 8 Negotiation Threads with messages
        neg_specs = [
            (NegotiationStatus.OPEN, 15.0, 10.0,
             [
                 ("CUSTOMER", "Hi Alex, we are comparing this quote with a competing offer. Can you offer a 15% discount on the hardware bundle?"),
                 ("REP", "Thanks for reaching out! I reviewed the request with our manager. We can offer a 10% discount if we commit to annual billing."),
                 ("CUSTOMER", "Let me check with our finance team and get back to you."),
             ]),
            (NegotiationStatus.ACCEPTED, 10.0, 10.0,
             [
                 ("CUSTOMER", "Requesting a 10% discount on the Enterprise Security License Upgrade."),
                 ("REP", "Discount approved! We have updated quote Q-2026-102 for your confirmation."),
                 ("CUSTOMER", "Perfect, thank you! Confirming the order."),
             ]),
            (NegotiationStatus.COUNTER_OFFERED, 18.0, 12.0,
             [
                 ("CUSTOMER", "Can we get 18% off the Rack Server Cluster?"),
                 ("REP", "Our maximum approved ceiling is 12% for this tier."),
             ]),
            (NegotiationStatus.REJECTED, 25.0, None,
             [
                 ("CUSTOMER", "We need 25% discount to move forward with the legacy replacement."),
                 ("REP", "Unfortunately, 25% exceeds our margin ceiling for this category."),
             ]),
            (NegotiationStatus.ACCEPTED, 7.5, 7.5,
             [
                 ("CUSTOMER", "Can we round off the price with a 7.5% discount?"),
                 ("REP", "7.5% discount accepted. Updated in customer portal."),
             ]),
            (NegotiationStatus.OPEN, 10.0, None,
             [
                 ("CUSTOMER", "Inquiring about Disaster Recovery Node expansion volume pricing."),
             ]),
            (NegotiationStatus.OPEN, 12.0, 8.0,
             [
                 ("CUSTOMER", "Can you adjust the SOC Analytics pricing for 12% discount?"),
                 ("REP", "We can do 8% immediately or wait for manager sign-off for 12%."),
             ]),
            (NegotiationStatus.ACCEPTED, 5.0, 5.0,
             [
                 ("CUSTOMER", "Confirming 5% discount for Load Balancers."),
                 ("REP", "Done! Quote updated."),
             ]),
        ]

        for idx, (n_status, req_disc, count_disc, messages) in enumerate(neg_specs):
            target_q = created_quotes[idx % len(created_quotes)]
            neg = Negotiation(
                id=uuid4(),
                quotation_id=target_q.id,
                customer_id=cust_id,
                rep_id=rep_user.id,
                status=n_status,
                requested_discount=req_disc,
                counter_discount=count_disc,
                final_discount=count_disc if n_status == NegotiationStatus.ACCEPTED else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            )
            session.add(neg)
            session.commit()

            for s_role_str, msg_text in messages:
                s_role = SenderRole.CUSTOMER if s_role_str == "CUSTOMER" else SenderRole.REP
                s_id = user.id if s_role == SenderRole.CUSTOMER else rep_user.id
                msg = NegotiationMessage(
                    id=uuid4(),
                    negotiation_id=neg.id,
                    sender_id=s_id,
                    sender_role=s_role,
                    message=msg_text,
                    discount_proposed=req_disc if s_role == SenderRole.CUSTOMER else count_disc,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 20)),
                )
                session.add(msg)

        session.commit()
        print("✅ Added 8 Negotiation threads & messages")

        print("\n🎉 DEMO CUSTOMER DATABASE POPULATED SUCCESSFULLY!")

if __name__ == "__main__":
    seed()
