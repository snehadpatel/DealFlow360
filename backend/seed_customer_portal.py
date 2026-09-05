#!/usr/bin/env python3
"""
Seed Customer Portal with Rich & Diverse Data for B2B Demo
Populates 15+ quotes, 12+ invoices, 8+ subscriptions, 10+ orders/shipments,
and 6+ negotiation threads for buyer@abccorp.com (Titanium Pharma) and ALL customer accounts.
"""
import sys
import os
import random
from datetime import datetime, date, timedelta
from uuid import uuid4

sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import SQLModel, Session, select
from app.db import engine
import app.models  # register all models

from app.models.user import User, Role
from app.models.customer import Customer, Tier, CustomerStatus
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationVersion, QuoteStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus, PaymentMethod
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.order import Order, OrderLine, Shipment, ShipmentStatus, OrderStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.warehouse import Warehouse

def seed_rich_customer_portal():
    with Session(engine) as session:
        print("🚀 Seeding rich B2B Customer Portal data for buyer@abccorp.com & Customer accounts...")

        # 1. Attach customer_id to any customer user missing one
        all_customers = session.exec(select(Customer)).all()
        print(f"Loaded {len(all_customers)} Customers from DB.")
        if not all_customers:
            print("❌ No Customers found in DB!")
            return

        cust_users = session.exec(select(User).where(User.role == Role.CUSTOMER)).all()
        for idx, cu in enumerate(cust_users):
            if not cu.customer_id:
                cu.customer_id = all_customers[idx % len(all_customers)].id
                session.add(cu)
        session.commit()

        # Target primary demo user: buyer@abccorp.com
        user = session.exec(select(User).where(User.email == 'buyer@abccorp.com')).first()
        if not user:
            user = User(
                id=uuid4(),
                name="ABC Corp Buyer",
                email="buyer@abccorp.com",
                password_hash="$2b$12$O8s9bg4cuXx75QTk5cV4auDrzvOtnp9L5/QE7TG6ws2i7JLed.nNe",  # cust123
                role=Role.CUSTOMER,
                customer_id=all_customers[0].id,
                is_active=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        target_cust_id = user.customer_id
        target_customer = session.exec(select(Customer).where(Customer.id == target_cust_id)).first()
        print(f"Primary Customer: {target_customer.name if target_customer else 'Demo Customer'} ({target_cust_id})")

        reps = session.exec(select(User).where(User.role == Role.REP)).all()
        rep_user = reps[0] if reps else user
        products = session.exec(select(Product)).all()
        warehouses = session.exec(select(Warehouse)).all()
        plans = session.exec(select(SubscriptionPlan)).all()

        # 2. Seed 15 Quotations with realistic line items & versions for target_cust_id
        quote_scenarios = [
            (QuoteStatus.CONFIRMED, "Q-2026-101", 120, "Global Data Center Expansion", 0.0),
            (QuoteStatus.APPROVED, "Q-2026-102", 45, "Enterprise Security License Upgrade", 10.0),
            (QuoteStatus.PENDING_APPROVAL, "Q-2026-103", 10, "Q3 Cloud Operations Hardware Bundle", 15.0),
            (QuoteStatus.DRAFT, "Q-2026-104", 2, "AI Engine Add-on Pilot", 5.0),
            (QuoteStatus.REJECTED, "Q-2026-105", 90, "Legacy Router Replacement Pack", 25.0),
            (QuoteStatus.EXPIRED, "Q-2026-106", 180, "2025 SLA Renewal Package", 8.0),
            (QuoteStatus.CONFIRMED, "Q-2026-107", 75, "High-Throughput SAN Storage Array", 12.0),
            (QuoteStatus.APPROVED, "Q-2026-108", 30, "Multi-Cloud Transceiver Expansion", 7.5),
            (QuoteStatus.PENDING_APPROVAL, "Q-2026-109", 5, "Rack Server Cluster & Power Backup", 18.0),
            (QuoteStatus.CONFIRMED, "Q-2026-110", 150, "Annual Dedicated Support Package", 0.0),
            (QuoteStatus.CONFIRMED, "Q-2026-111", 210, "Initial Core Infrastructure Setup", 5.0),
            (QuoteStatus.DRAFT, "Q-2026-112", 1, "Disaster Recovery Node Expansion", 10.0),
            (QuoteStatus.APPROVED, "Q-2026-113", 20, "Network Edge Firewall Refresh", 12.5),
            (QuoteStatus.CONFIRMED, "Q-2026-114", 60, "UPS Power & Monitoring Bundle", 4.0),
            (QuoteStatus.REJECTED, "Q-2026-115", 110, "Custom AI Ops Training & Onboarding", 30.0),
        ]

        created_quotes = []
        for status, q_num, days_ago, note, disc in quote_scenarios:
            dt = datetime.utcnow() - timedelta(days=days_ago)
            q = Quotation(
                id=uuid4(),
                customer_id=target_cust_id,
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
            created_quotes.append((q, q_num))

        session.commit()
        print(f"  ✅ Seeded {len(created_quotes)} Quotations for {user.email}")

        # 3. Seed 12 Invoices, Shipments & Payment records
        confirmed_quotes = [q_tuple for q_tuple in created_quotes if q_tuple[0].status == QuoteStatus.CONFIRMED]
        invoice_specs = [
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
            (InvoiceStatus.SENT, 8, "INV-2026-011"),
            (InvoiceStatus.PAID, 160, "INV-2026-012"),
        ]

        for idx, (inv_status, days_ago, inv_num) in enumerate(invoice_specs):
            ref_q, _ = confirmed_quotes[idx % len(confirmed_quotes)]
            inv_dt = datetime.utcnow() - timedelta(days=days_ago)

            ord_obj = Order(
                id=uuid4(),
                quotation_id=ref_q.id,
                customer_id=target_cust_id,
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

            amt_paid = ref_q.total if inv_status == InvoiceStatus.PAID else 0.0
            out_amt = 0.0 if inv_status == InvoiceStatus.PAID else ref_q.total

            inv = Invoice(
                id=uuid4(),
                invoice_number=inv_num,
                order_id=ord_obj.id,
                customer_id=target_cust_id,
                status=inv_status,
                amount=ref_q.total,
                amount_paid=amt_paid,
                outstanding_amount=out_amt,
                due_date=(inv_dt + timedelta(days=30)).date(),
                created_at=inv_dt,
            )
            session.add(inv)
            session.commit()

            if inv_status == InvoiceStatus.PAID:
                pay = Payment(
                    id=uuid4(),
                    invoice_id=inv.id,
                    amount=inv.amount,
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
                    customer_id=target_cust_id,
                    amount=round(inv.amount * 0.05, 2),
                    reason="Quarterly Volume Rebate Credit",
                    created_at=inv_dt + timedelta(days=15),
                )
                session.add(cn)

        session.commit()
        print(f"  ✅ Seeded 12 Invoices & Orders for {user.email}")

        # 4. Seed 8 Subscriptions
        sub_specs = [
            (SubscriptionStatus.ACTIVE, 0, BillingCycle.MONTHLY, 3),
            (SubscriptionStatus.ACTIVE, 1, BillingCycle.YEARLY, 1),
            (SubscriptionStatus.ACTIVE, 2, BillingCycle.MONTHLY, 5),
            (SubscriptionStatus.PAUSED, 3, BillingCycle.MONTHLY, 2),
            (SubscriptionStatus.ACTIVE, 4, BillingCycle.YEARLY, 10),
            (SubscriptionStatus.CANCELLED, 5, BillingCycle.MONTHLY, 1),
            (SubscriptionStatus.ACTIVE, 6, BillingCycle.MONTHLY, 4),
            (SubscriptionStatus.PAUSED, 7, BillingCycle.YEARLY, 2),
        ]

        for s_status, plan_idx, cycle, qty in sub_specs:
            plan = plans[plan_idx % len(plans)]
            start_d = date.today() - timedelta(days=random.randint(60, 300))
            next_d = date.today() + timedelta(days=random.randint(10, 45)) if s_status == SubscriptionStatus.ACTIVE else None

            sub = CustomerSubscription(
                id=uuid4(),
                customer_id=target_cust_id,
                plan_id=plan.id,
                quantity=qty,
                status=s_status,
                start_date=start_d,
                next_billing_date=next_d,
            )
            session.add(sub)

        session.commit()
        print(f"  ✅ Seeded 8 Subscriptions for {user.email}")

        # 5. Seed 6 Negotiations with Messages
        neg_specs = [
            ("Q-2026-103", NegotiationStatus.OPEN, 15.0, 10.0,
             [
                 ("CUSTOMER", "Hi Alex, we are comparing this quote with a competing offer. Can you offer a 15% discount on the hardware bundle?"),
                 ("REP", "Thanks for reaching out! I reviewed the request with our manager. We can offer a 10% discount if we commit to annual billing."),
                 ("CUSTOMER", "Let me check with our finance team and get back to you."),
             ]),
            ("Q-2026-102", NegotiationStatus.ACCEPTED, 10.0, 10.0,
             [
                 ("CUSTOMER", "Requesting a 10% discount on the Enterprise Security License Upgrade."),
                 ("REP", "Discount approved! We have updated quote Q-2026-102 for your confirmation."),
                 ("CUSTOMER", "Perfect, thank you! Confirming the order."),
             ]),
            ("Q-2026-109", NegotiationStatus.COUNTER_OFFERED, 18.0, 12.0,
             [
                 ("CUSTOMER", "Can we get 18% off the Rack Server Cluster?"),
                 ("REP", "Our maximum approved ceiling is 12% for this tier."),
             ]),
            ("Q-2026-105", NegotiationStatus.REJECTED, 25.0, None,
             [
                 ("CUSTOMER", "We need 25% discount to move forward with the legacy replacement."),
                 ("REP", "Unfortunately, 25% exceeds our margin ceiling for this category."),
             ]),
            ("Q-2026-108", NegotiationStatus.ACCEPTED, 7.5, 7.5,
             [
                 ("CUSTOMER", "Can we round off the price with a 7.5% discount?"),
                 ("REP", "7.5% discount accepted. Updated in customer portal."),
             ]),
            ("Q-2026-112", NegotiationStatus.OPEN, 10.0, None,
             [
                 ("CUSTOMER", "Inquiring about Disaster Recovery Node expansion volume pricing."),
             ]),
        ]

        for q_code, n_status, req_disc, count_disc, messages in neg_specs:
            match_q = next((qt[0] for qt in created_quotes if qt[1] == q_code), created_quotes[0][0])
            neg = Negotiation(
                id=uuid4(),
                quotation_id=match_q.id,
                customer_id=target_cust_id,
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
        print(f"  ✅ Seeded 6 Negotiation threads with conversation histories for {user.email}")

        print("\n🎉 CUSTOMER PORTAL DEMO DATA SUCCESSFULLY SEEDED!")


if __name__ == "__main__":
    seed_rich_customer_portal()
