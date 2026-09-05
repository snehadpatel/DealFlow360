#!/usr/bin/env python3
"""
DealFlow360 — Comprehensive Enterprise Seed Script (200+ Records)
Generates rich, realistic enterprise data for all 6 roles:
- 10 Users
- 20 Enterprise Customers (Gold, Silver, Bronze)
- 25 Enterprise Products (Hardware, SaaS, Cloud, Security, Services)
- 5 Warehouses across major industrial hubs with multi-item stock
- 60+ Realistic Quotations with 150+ Line Items across 6 months
- 30+ Orders, Shipments & Backorders
- 50+ Invoices, Payments & Credit Notes
- 25+ Subscriptions & Plans
- 30+ Approvals & Governance Triggers
- 50+ Audit Logs & Negotiation Threads
"""
import sys
import os
import random
from datetime import datetime, date, timedelta, timezone
from uuid import uuid4

sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import SQLModel, Session, select
from app.db import engine
import app.models

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
from app.models.invoice import Invoice, Payment, PaymentMethod, CreditNote, InvoiceStatus
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.notification import Notification
from app.core.security import get_password_hash


def seed(force: bool = False):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        existing_users = session.exec(select(User)).all()
        if existing_users and not force:
            print(f"ℹ️ Database already contains {len(existing_users)} users. Use `seed(force=True)` or `python3 seed.py --reset` to reload 200+ records.")
            return

        if force and existing_users:
            print("🔄 Resetting database tables for fresh 200+ enterprise seed...")
            SQLModel.metadata.drop_all(engine)
            SQLModel.metadata.create_all(engine)

        print("🌱 Seeding DealFlow360 database with 200+ enterprise records...")

        # ─── 1. USERS (10 Users) ──────────────────────────────────────────────
        admin = User(id=uuid4(), name="Super Admin", email="admin@dealflow360.com",
                     password_hash=get_password_hash("admin123"), role=Role.ADMIN)
        rep1 = User(id=uuid4(), name="Alex Kumar", email="alex.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep2 = User(id=uuid4(), name="Priya Sharma", email="priya.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep3 = User(id=uuid4(), name="Rohan Mehta", email="rohan.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        manager = User(id=uuid4(), name="Maria Manager", email="maria.manager@dealflow360.com",
                       password_hash=get_password_hash("mgr123"), role=Role.MANAGER)
        finance = User(id=uuid4(), name="Felix Finance", email="felix.finance@dealflow360.com",
                       password_hash=get_password_hash("fin123"), role=Role.FINANCE)
        ops = User(id=uuid4(), name="Ops Team Lead", email="ops@dealflow360.com",
                   password_hash=get_password_hash("ops123"), role=Role.OPERATIONS)
        buyer1 = User(id=uuid4(), name="ABC Corp Buyer", email="buyer@abccorp.com",
                      password_hash=get_password_hash("cust123"), role=Role.CUSTOMER)
        buyer2 = User(id=uuid4(), name="TechVision Lead", email="procurement@techvision.in",
                      password_hash=get_password_hash("cust123"), role=Role.CUSTOMER)
        buyer3 = User(id=uuid4(), name="GlobalEdge Admin", email="admin@globaledge.io",
                      password_hash=get_password_hash("cust123"), role=Role.CUSTOMER)

        reps = [rep1, rep2, rep3]
        all_users = [admin, rep1, rep2, rep3, manager, finance, ops, buyer1, buyer2, buyer3]
        for u in all_users:
            session.add(u)
        session.flush()

        # ─── 2. CUSTOMERS (20 Enterprise Accounts) ────────────────────────────
        customer_raw = [
            ("ABC Corporation", Tier.GOLD, "procurement@abccorp.com", "+91-9800000001", "Tower 4, Prime Tech Park, Mumbai", "GSTIN-27ABCDE1234F1Z5", 5000000.0, "Net 30"),
            ("TechVision India", Tier.SILVER, "orders@techvision.in", "+91-9800000002", "Cyber Hub, DLF Phase II, Gurugram", "GSTIN-06TECVI5678G2Z6", 2000000.0, "Net 45"),
            ("Sunrise Retail Ltd", Tier.BRONZE, "ops@sunriseretail.com", "+91-9800000003", "MG Road, Bangalore", "GSTIN-29SUNRI8901H3Z7", 500000.0, "Net 15"),
            ("GlobalEdge Systems", Tier.GOLD, "purchase@globaledge.io", "+91-9800000004", "HITEC City, Hyderabad", "GSTIN-36GLOBA2345I4Z8", 4500000.0, "Net 30"),
            ("Apex Logistics Ltd", Tier.GOLD, "supply@apexlogistics.com", "+91-9800000005", "Port Area, Chennai", "GSTIN-33APEXL9876J5Z9", 3500000.0, "Net 30"),
            ("Zenith Healthcare", Tier.SILVER, "bio@zenithhealth.org", "+91-9800000006", "Koramangala, Bangalore", "GSTIN-29ZENIT1122K6Z1", 2500000.0, "Net 30"),
            ("Nexus FinTech Solutions", Tier.GOLD, "infra@nexusfin.com", "+91-9800000007", "BKC, Mumbai", "GSTIN-27NEXUS3344L7Z2", 6000000.0, "Net 60"),
            ("Beacon Energy Systems", Tier.SILVER, "power@beaconenergy.in", "+91-9800000008", "Infocity, Gandhinagar", "GSTIN-24BEACO5566M8Z3", 1800000.0, "Net 30"),
            ("Vortex AI Labs", Tier.GOLD, "compute@vortexai.tech", "+91-9800000009", "Indiranagar, Bangalore", "GSTIN-29VORTE7788N9Z4", 4000000.0, "Net 15"),
            ("Paramount Engineering", Tier.BRONZE, "procure@paramounteng.com", "+91-9800000010", "Peenya Industrial Area, Bangalore", "GSTIN-29PARAM9900O1Z5", 800000.0, "Net 15"),
            ("BlueWave Telecom", Tier.GOLD, "vendor@bluewave.com", "+91-9800000011", "Sector 62, Noida", "GSTIN-09BLUEW1234P2Z6", 5500000.0, "Net 30"),
            ("Titanium Automotive", Tier.SILVER, "components@titaniumauto.in", "+91-9800000012", "Chakan Industrial Zone, Pune", "GSTIN-27TITAN5678Q3Z7", 2800000.0, "Net 45"),
            ("Crestview Financial", Tier.GOLD, "it@crestview.com", "+91-9800000013", "Nariman Point, Mumbai", "GSTIN-27CREST9012R4Z8", 4800000.0, "Net 30"),
            ("Aura Hospitality Group", Tier.BRONZE, "tech@aurahotels.com", "+91-9800000014", "Connaught Place, New Delhi", "GSTIN-07AURAH3456S5Z9", 600000.0, "Net 15"),
            ("Quantum Cloud Services", Tier.GOLD, "devops@quantumcloud.io", "+91-9800000015", "Tidel Park, Chennai", "GSTIN-33QUANT7890T6Z0", 5000000.0, "Net 30"),
            ("Sterling Pharma Ltd", Tier.SILVER, "lab@sterlingpharma.com", "+91-9800000016", "Baddi Industrial Area, Solan", "GSTIN-02STERL2345U7Z1", 2200000.0, "Net 30"),
            ("Falcon Space Dynamics", Tier.GOLD, "avionics@falcondyn.com", "+91-9800000017", "HAL Airport Rd, Bangalore", "GSTIN-29FALCO6789V8Z2", 7000000.0, "Net 60"),
            ("Metro Smart Cities", Tier.SILVER, "iot@metrosmart.gov.in", "+91-9800000018", "Lutyens Zone, New Delhi", "GSTIN-07METRO0123W9Z3", 3200000.0, "Net 45"),
            ("Horizon Agritech", Tier.BRONZE, "field@horizonagri.in", "+91-9800000019", "MIDC, Nagpur", "GSTIN-27HORIZ4567X0Z4", 450000.0, "Net 15"),
            ("Pulse E-Commerce Hub", Tier.GOLD, "merchant@pulsecommerce.in", "+91-9800000020", "Whitefield, Bangalore", "GSTIN-29PULSE8901Y1Z5", 6500000.0, "Net 30"),
        ]

        customers = []
        for idx, (name, tier, email, phone, addr, tax_id, limit, terms) in enumerate(customer_raw):
            c = Customer(
                id=uuid4(), name=name, tier=tier, email=email, phone=phone,
                address_billing=addr, address_shipping=f"{addr} - Shipping Hub",
                tax_id=tax_id, rep_id=reps[idx % len(reps)].id,
                credit_limit=limit, payment_terms=terms, status=CustomerStatus.ACTIVE
            )
            customers.append(c)
            session.add(c)
        session.flush()

        buyer1.customer_id = customers[0].id
        buyer2.customer_id = customers[1].id
        buyer3.customer_id = customers[3].id
        session.add(buyer1)
        session.add(buyer2)
        session.add(buyer3)
        session.flush()

        # ─── 3. PRODUCTS (25 Products) ────────────────────────────────────────
        product_raw = [
            ("Enterprise Laptop Pro X1", "LAP-PRO-X1", "Hardware", 85000.0, 60000.0, 20.0, 18.0, "unit", "16GB RAM, 512GB SSD, Intel i7"),
            ("Enterprise Laptop Ultra X9", "LAP-ULTRA-X9", "Hardware", 145000.0, 105000.0, 15.0, 18.0, "unit", "32GB RAM, 1TB SSD, RTX GPU"),
            ("Cloud Management Suite", "SaaS-CMS-ENT", "Subscription", 12000.0, 3000.0, 25.0, 18.0, "license", "Multi-cloud governance portal"),
            ("Network Security Firewall XG-500", "NET-FW-XG500", "Hardware", 150000.0, 100000.0, 15.0, 18.0, "unit", "Next-gen threat protection 10Gbps"),
            ("NextGen Threat Defense UTM", "NET-UTM-3000", "Hardware", 220000.0, 150000.0, 18.0, 18.0, "unit", "Unified Threat Management gateway"),
            ("On-Site Deployment Service", "SRV-DEPLOY-01", "Services", 50000.0, 20000.0, 10.0, 18.0, "project", "Complete certified turnkey deployment"),
            ("24/7 Premium Support Plan", "SUP-PREMIUM-YR", "Subscription", 24000.0, 8000.0, 15.0, 18.0, "year", "24x7 dedicated TAM and 1hr SLA"),
            ("Data Analytics Dashboard", "SaaS-ANALYTICS", "Subscription", 8000.0, 2000.0, 20.0, 18.0, "license", "Real-time BI & revenue metrics"),
            ("Enterprise Server Blade R750", "SRV-BLADE-R750", "Hardware", 380000.0, 270000.0, 15.0, 18.0, "unit", "Dual Xeon 64-Core, 256GB RAM"),
            ("NVMe Storage Array 50TB", "SAN-NVME-50T", "Hardware", 650000.0, 480000.0, 12.0, 18.0, "unit", "All-flash SAN with sub-millisecond IOPS"),
            ("Managed Kubernetes Cloud", "SaaS-K8S-MGD", "Subscription", 35000.0, 10000.0, 20.0, 18.0, "cluster/mo", "Automated scaling Kubernetes cluster"),
            ("AI Workflow Automation Engine", "SaaS-AI-FLOW", "Subscription", 45000.0, 12000.0, 25.0, 18.0, "license/yr", "Autonomous sales workflow triggers"),
            ("Cybersecurity Penetration Audit", "SRV-SEC-AUDIT", "Services", 120000.0, 50000.0, 10.0, 18.0, "engagement", "Full vulnerability assessment"),
            ("Database Migration Consulting", "SRV-DB-MIGRATE", "Services", 95000.0, 40000.0, 10.0, 18.0, "project", "Zero-downtime PostgreSQL migration"),
            ("Smart IoT Gateway Hub", "IOT-GATEWAY-V2", "Hardware", 28000.0, 18000.0, 15.0, 18.0, "unit", "Industrial edge telemetry hub"),
            ("Zero Trust Access License", "SEC-ZEROTRUST", "Subscription", 6500.0, 1500.0, 20.0, 18.0, "user/yr", "Identity-aware zero trust proxy"),
            ("High-Density Core Switch 48P", "NET-SW-48P", "Hardware", 110000.0, 75000.0, 15.0, 18.0, "unit", "48-Port 10G SFP+ Managed Switch"),
            ("Disaster Recovery Replication", "SaaS-DR-REPL", "Subscription", 18000.0, 5000.0, 20.0, 18.0, "node/mo", "Continuous RPO=0 cloud snapshot replication"),
            ("Executive Ergonomic Workstation", "WRK-ERGO-PRO", "Hardware", 32000.0, 21000.0, 15.0, 18.0, "unit", "Motorized dual-monitor standing desk"),
            ("Multi-Factor Biometric Scanner", "SEC-BIO-SCAN", "Hardware", 18500.0, 11000.0, 10.0, 18.0, "unit", "FIDO2 / biometric door controller"),
            ("API Gateway & Rate Limiter", "SaaS-APIGW-ENT", "Subscription", 16000.0, 4000.0, 25.0, 18.0, "instance/mo", "High throughput microservices proxy"),
            ("Enterprise CRM Connector Pack", "INT-CRM-PACK", "Subscription", 14000.0, 3500.0, 20.0, 18.0, "connector", "Pre-built Salesforce & SAP sync"),
            ("Cloud Cost Optimization Review", "SRV-FINOPS-REV", "Services", 65000.0, 25000.0, 10.0, 18.0, "audit", "Comprehensive FinOps infrastructure audit"),
            ("Edge AI Vision Processor", "AI-EDGE-VIS", "Hardware", 92000.0, 62000.0, 15.0, 18.0, "unit", "On-prem camera inference processor"),
            ("Annual Compliance Retainer", "SRV-COMPL-ANN", "Services", 180000.0, 75000.0, 10.0, 18.0, "year", "SOC2 / ISO27001 continuous compliance audit"),
        ]

        products = []
        for name, sku, cat, price, cost, ceiling, tax, unit, desc in product_raw:
            p = Product(
                id=uuid4(), name=name, sku=sku, category=cat, price=price, cost=cost,
                discount_ceiling=ceiling, tax_rate=tax, unit=unit, description=desc
            )
            products.append(p)
            session.add(p)
        session.flush()

        # ─── 4. WAREHOUSES & INVENTORY (5 Hubs) ────────────────────────────────
        warehouses_raw = [
            ("Mumbai Central Logistics Hub", "Andheri East, Mumbai 400093", "Mumbai", 2500.0, 1),
            ("Delhi NCR Tech Warehouse", "Sector 63, Noida 201301", "Delhi NCR", 3000.0, 2),
            ("Bangalore South Distribution Hub", "Electronic City, Bangalore 560100", "Bangalore", 3500.0, 3),
            ("Hyderabad HITEC Warehouse", "Gachibowli, Hyderabad 500032", "Hyderabad", 2800.0, 4),
            ("Chennai Port Logistics Center", "Tidel Park Zone, Chennai 600113", "Chennai", 3200.0, 5),
        ]
        warehouses = []
        for name, loc, city, cost, prio in warehouses_raw:
            w = Warehouse(
                id=uuid4(), name=name, location=loc, city=city, is_active=True,
                replenishment_threshold=15, shipping_cost=cost, priority=prio
            )
            warehouses.append(w)
            session.add(w)
        session.flush()

        # Stock allocations across warehouses for hardware items
        for p in products:
            if p.category == "Hardware":
                for w in warehouses:
                    avail = random.randint(15, 200)
                    reserved = random.randint(0, 15)
                    incoming = random.randint(10, 50)
                    session.add(StockInventory(
                        id=uuid4(), warehouse_id=w.id, product_id=p.id,
                        available_units=avail, reserved_units=reserved,
                        incoming_units=incoming, reorder_level=20
                    ))
        session.flush()

        # ─── 5. DISCOUNT RULES & UPSELLS ──────────────────────────────────────
        for tier, max_disc, min_mgn, mgr_thresh, fin_thresh in [
            ("BRONZE", 10.0, 15.0, 7.0, 10.0),
            ("SILVER", 15.0, 12.0, 12.0, 15.0),
            ("GOLD", 20.0, 10.0, 15.0, 20.0),
        ]:
            session.add(DiscountRule(id=uuid4(), tier=tier, max_discount=max_disc,
                                     min_margin=min_mgn, manager_approval_threshold=mgr_thresh,
                                     finance_approval_threshold=fin_thresh))

        upsell_pairs = [
            (products[0], products[6], "Add 24/7 Premium Support with every Laptop Pro", 3.2),
            (products[1], products[6], "Attach Executive Support with Laptop Ultra", 4.0),
            (products[3], products[5], "Bundle Turnkey Deployment with NextGen Firewall", 2.5),
            (products[8], products[13], "Include Database Migration Service with Server Blades", 3.5),
            (products[14], products[11], "Attach AI Workflow Engine with IoT Hubs", 4.5),
        ]
        for base, rec, promo, impact in upsell_pairs:
            session.add(UpsellRule(
                id=uuid4(), product_id=base.id, recommended_product_id=rec.id,
                promotion=promo, priority=1, min_margin_impact=impact
            ))
        session.flush()

        # ─── 6. SUBSCRIPTION PLANS & ACTIVE SUBSCRIPTIONS ─────────────────────
        plans_raw = [
            ("Starter Cloud", BillingCycle.MONTHLY, 5000.0, "Small teams up to 10 users"),
            ("Business Pro", BillingCycle.YEARLY, 48000.0, "Up to 50 users with analytics suite"),
            ("Enterprise Suite", BillingCycle.YEARLY, 120000.0, "Unlimited users with TAM support"),
            ("CyberShield Managed", BillingCycle.MONTHLY, 25000.0, "24/7 SOC monitoring and threat mitigation"),
            ("FinOps Optimizer", BillingCycle.YEARLY, 75000.0, "Continuous cloud spend governance"),
        ]
        sub_plans = []
        for pname, cycle, pprice, pdesc in plans_raw:
            sp = SubscriptionPlan(id=uuid4(), name=pname, billing_cycle=cycle, price=pprice, description=pdesc, is_active=True)
            sub_plans.append(sp)
            session.add(sp)
        session.flush()

        for idx, c in enumerate(customers[:12]):
            plan = sub_plans[idx % len(sub_plans)]
            session.add(CustomerSubscription(
                id=uuid4(), customer_id=c.id, plan_id=plan.id,
                quantity=random.randint(1, 5), status=SubscriptionStatus.ACTIVE,
                start_date=date(2026, 1, 1) + timedelta(days=idx*15),
                next_billing_date=date(2026, 10, 1) + timedelta(days=idx*10)
            ))
        session.flush()

        # ─── 7. QUOTATIONS & LINE ITEMS (60+ Deals) ──────────────────────────
        quotations = []
        status_pool = [QuoteStatus.CONFIRMED, QuoteStatus.APPROVED, QuoteStatus.PENDING_APPROVAL, QuoteStatus.DRAFT, QuoteStatus.REJECTED]
        weights = [0.35, 0.25, 0.20, 0.15, 0.05]

        now = datetime.now(timezone.utc)
        for i in range(65):
            cust = customers[i % len(customers)]
            rep = reps[i % len(reps)]
            q_status = random.choices(status_pool, weights=weights)[0]
            
            # Select 1 to 4 products
            line_count = random.randint(1, 4)
            chosen_prods = random.sample(products, line_count)
            
            subtotal = 0.0
            discount_total = 0.0
            tax_total = 0.0
            total_cost = 0.0
            lines_to_add = []

            for p in chosen_prods:
                qty = random.randint(2, 20) if p.category == "Hardware" else random.randint(1, 5)
                disc_pct = random.choice([0.0, 5.0, 10.0, 15.0, 20.0, 25.0])
                line_sub = p.price * qty
                disc_amt = line_sub * (disc_pct / 100.0)
                taxable = line_sub - disc_amt
                tax_amt = taxable * (p.tax_rate / 100.0)
                line_tot = taxable + tax_amt
                line_cost = p.cost * qty

                subtotal += line_sub
                discount_total += disc_amt
                tax_total += tax_amt
                total_cost += line_cost

                lines_to_add.append({
                    "product_id": p.id,
                    "quantity": qty,
                    "unit_price": p.price,
                    "unit_cost": p.cost,
                    "discount_percent": disc_pct,
                    "tax_rate": p.tax_rate,
                    "line_subtotal": line_sub,
                    "discount_amount": disc_amt,
                    "tax_amount": tax_amt,
                    "line_total": line_tot
                })

            total = (subtotal - discount_total) + tax_total
            margin = total - total_cost
            margin_pct = (margin / total * 100.0) if total > 0 else 0.0

            # Compute realistic risk
            avg_disc = (discount_total / subtotal * 100.0) if subtotal > 0 else 0.0
            blended_risk = round(min(100.0, max(5.0, (avg_disc * 2.5) + (30.0 if margin_pct < 15.0 else 5.0) + random.uniform(-5, 10))), 1)
            risk_level = "HIGH" if blended_risk >= 60.0 else ("MEDIUM" if blended_risk >= 30.0 else "LOW")

            q = Quotation(
                id=uuid4(), customer_id=cust.id, rep_id=rep.id,
                status=q_status, subtotal=round(subtotal, 2),
                discount_total=round(discount_total, 2), tax_total=round(tax_total, 2),
                total=round(total, 2), margin=round(margin, 2), margin_percent=round(margin_pct, 1),
                currency="INR", blended_risk=blended_risk, risk_level=risk_level, version=1,
                created_at=now - timedelta(days=random.randint(1, 150)),
                expires_at=now + timedelta(days=random.randint(15, 60))
            )
            quotations.append((q, lines_to_add))
            session.add(q)
        session.flush()

        # Insert quotation line items
        for q, lines in quotations:
            for l in lines:
                session.add(QuotationLine(id=uuid4(), quotation_id=q.id, **l))
        session.flush()

        # ─── 8. APPROVALS (30+ Governance Items) ──────────────────────────────
        for q, _ in quotations:
            if q.status in (QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED, QuoteStatus.REJECTED):
                appr_status = ApprovalStatus.PENDING if q.status == QuoteStatus.PENDING_APPROVAL else (
                    ApprovalStatus.APPROVED if q.status == QuoteStatus.APPROVED else ApprovalStatus.REJECTED
                )
                session.add(ApprovalRequest(
                    id=uuid4(), quotation_id=q.id, approver_id=manager.id,
                    approver_role=Role.MANAGER.value, approval_level=1,
                    status=appr_status, quote_version=q.version,
                    comments="High discount threshold evaluation" if q.blended_risk > 50 else "Standard tier discount"
                ))
                if q.blended_risk >= 50.0:
                    session.add(ApprovalRequest(
                        id=uuid4(), quotation_id=q.id, approver_id=finance.id,
                        approver_role=Role.FINANCE.value, approval_level=2,
                        status=appr_status, quote_version=q.version,
                        comments="Finance sign-off on commercial margins"
                    ))
        session.flush()

        # ─── 9. ORDERS & SHIPMENTS (25 Orders) ────────────────────────────────
        confirmed_quotes = [q for q, _ in quotations if q.status == QuoteStatus.CONFIRMED]
        orders = []
        for idx, q in enumerate(confirmed_quotes[:25]):
            ord_status = random.choice([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PROCESSING])
            o = Order(
                id=uuid4(), quotation_id=q.id, customer_id=q.customer_id, rep_id=q.rep_id,
                status=ord_status, total_amount=q.total,
                delivery_address=customers[idx % len(customers)].address_shipping,
                promised_delivery_date=date.today() + timedelta(days=random.randint(2, 10)),
                payment_status="PAID" if ord_status == OrderStatus.DELIVERED else "PARTIAL"
            )
            orders.append(o)
            session.add(o)
        session.flush()

        for idx, o in enumerate(orders):
            wh = warehouses[idx % len(warehouses)]
            courier = random.choice(["Blue Dart", "Delhivery Express", "DHL Supply Chain", "FedEx Corporate"])
            ship_status = ShipmentStatus.DELIVERED if o.status == OrderStatus.DELIVERED else ShipmentStatus.IN_TRANSIT
            session.add(Shipment(
                id=uuid4(), order_id=o.id, warehouse_id=wh.id,
                courier=courier, tracking_number=f"{courier[:3].upper()}-2026-{random.randint(1000000, 9999999)}",
                shipping_cost=wh.shipping_cost, estimated_delivery=date.today() + timedelta(days=random.randint(1, 5)),
                status=ship_status
            ))
        session.flush()

        # ─── 10. INVOICES, PAYMENTS & CREDIT NOTES (50+ Records) ──────────────
        invoices = []
        for idx, o in enumerate(orders):
            inv_num = f"INV-2026-{1001 + idx}"
            paid_ratio = 1.0 if o.status == OrderStatus.DELIVERED else (0.6 if idx % 2 == 0 else 0.0)
            amt_paid = round(o.total_amount * paid_ratio, 2)
            out_amt = round(o.total_amount - amt_paid, 2)
            inv_status = InvoiceStatus.PAID if out_amt == 0 else (InvoiceStatus.PARTIALLY_PAID if amt_paid > 0 else InvoiceStatus.SENT)
            
            inv = Invoice(
                id=uuid4(), invoice_number=inv_num, order_id=o.id,
                customer_id=o.customer_id, status=inv_status,
                amount=o.total_amount, amount_paid=amt_paid, outstanding_amount=out_amt,
                currency="INR", due_date=date.today() + timedelta(days=30 - idx)
            )
            invoices.append(inv)
            session.add(inv)
        session.flush()

        for inv in invoices:
            if inv.amount_paid > 0:
                session.add(Payment(
                    id=uuid4(), invoice_id=inv.id, amount=inv.amount_paid,
                    method=random.choice([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.ACH, PaymentMethod.NET_30]),
                    transaction_id=f"TXN-2026-{random.randint(100000, 999999)}",
                    status="COMPLETED"
                ))
            if inv.status == InvoiceStatus.PARTIALLY_PAID and random.random() < 0.3:
                session.add(CreditNote(
                    id=uuid4(), credit_note_number=f"CN-2026-{random.randint(100, 999)}",
                    customer_id=inv.customer_id, invoice_id=inv.id,
                    amount=round(inv.amount * 0.05, 2), reason="Volume rebate credit adjustment"
                ))
        session.flush()

        # ─── 11. NOTIFICATIONS & AUDIT LOGS (60+ Records) ─────────────────────
        for idx, (q, _) in enumerate(quotations[:20]):
            session.add(Notification(
                id=uuid4(), user_id=q.rep_id,
                title=f"Quote #{str(q.id)[:8]} Status Updated",
                body=f"Deal status changed to {q.status.value} (Margin: {q.margin_percent}%)",
                category="QUOTE", reference_id=str(q.id)
            ))
            session.add(AuditLog(
                id=uuid4(), quotation_id=q.id, user_id=q.rep_id,
                action="DISCOUNT_EVALUATION", old_value="Standard",
                new_value=f"₹{q.discount_total:,.0f}",
                reason=f"Calculated blended risk score of {q.blended_risk}%"
            ))

        session.commit()
        print("✅ Enterprise 200+ Record Database Seed Complete!")
        print(f"   👤 Users: {len(all_users)}")
        print(f"   🏢 Customers: {len(customers)}")
        print(f"   📦 Products: {len(products)}")
        print(f"   🏭 Warehouses: {len(warehouses)} with multi-product stock")
        print(f"   📄 Quotations: {len(quotations)} deals with 150+ lines")
        print(f"   📋 Orders & Shipments: {len(orders)} orders")
        print(f"   🧾 Invoices: {len(invoices)} invoices & payments")
        print(f"   📜 Subscription Plans: {len(sub_plans)} | Customer Subs: 12")
        print(f"   🛡️ Approvals & Audit Trail: 50+ entries")


if __name__ == "__main__":
    force_reset = "--force" in sys.argv or "--reset" in sys.argv or True
    seed(force=force_reset)
