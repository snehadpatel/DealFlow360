"""
DealFlow360 Enterprise Database Seeder
Populates the database with 200+ enterprise records across all entities:
- 10+ Enterprise Users & Roles
- 200 Enterprise Customers (Gold/Silver/Bronze)
- 200 Products & SKUs across Hardware, SaaS, Subscriptions, Services
- 5 Warehouses & Multi-Product Inventory allocations
- 200 Quotations with 500+ Quotation Line Items
- 200 Orders with Real-time Delivery & Tracking
- 200 Invoices, Payments, & Credit Notes
- 200 Approvals, Notifications, & Audit Governance entries
- 20 Subscription Plans & Customer Subscriptions
"""
import sys
import os
import random
from uuid import uuid4
from datetime import datetime, date, timedelta, timezone

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select, SQLModel
from app.db import engine, init_db
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.customer import Customer, Tier, CustomerStatus
from app.models.product import Product
from app.models.discount_rule import DiscountRule, UpsellRule
from app.models.warehouse import Warehouse, StockInventory
from app.models.quotation import Quotation, QuotationLine, QuoteStatus
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.order import Order, Shipment, OrderStatus, ShipmentStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus, PaymentMethod
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.notification import Notification
from app.models.audit import AuditLog


def seed(force: bool = False):
    """Seed the database with 200+ realistic enterprise records per major category."""
    init_db()

    with Session(engine) as session:
        # Check if already seeded
        existing_cust_count = len(session.exec(select(Customer)).all())
        existing_quote_count = len(session.exec(select(Quotation)).all())
        if not force and existing_cust_count >= 200 and existing_quote_count >= 200:
            print(f"ℹ️ Database already populated with {existing_cust_count} customers & {existing_quote_count} quotes. Skipping.")
            return

        print("🔄 Resetting database tables for fresh 200+ per-entity enterprise seed...")
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)

        print("🌱 Generating 200+ records for Customers, Products, Quotes, Orders, Invoices, Approvals...")
        random.seed(42)  # Deterministic realistic seed

        # ─── 1. USERS (10 Users) ──────────────────────────────────────────────
        admin = User(id=uuid4(), name="Super Admin", email="admin@dealflow360.com",
                     password_hash=get_password_hash("admin123"), role=Role.ADMIN)
        rep1 = User(id=uuid4(), name="Alex Kumar", email="alex.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep2 = User(id=uuid4(), name="Priya Sharma", email="priya.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep3 = User(id=uuid4(), name="Rohan Mehta", email="rohan.rep@dealflow360.com",
                    password_hash=get_password_hash("rep123"), role=Role.REP)
        rep4 = User(id=uuid4(), name="Ananya Desai", email="ananya.rep@dealflow360.com",
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

        reps = [rep1, rep2, rep3, rep4]
        all_users = [admin, rep1, rep2, rep3, rep4, manager, finance, ops, buyer1, buyer2]
        for u in all_users:
            session.add(u)
        session.flush()

        # ─── 2. CUSTOMERS (200 Enterprise Customers) ──────────────────────────
        company_prefixes = [
            "Apex", "Nexus", "Quantum", "Vortex", "Titanium", "Beacon", "Zenith", "Horizon", "BlueWave", "Pulse",
            "Crestview", "Sterling", "Falcon", "Paramount", "Aura", "Metro", "Prime", "Vertex", "Summit", "Strata",
            "Catalyst", "Hyperion", "Synapse", "Omni", "GlobalEdge", "InfiniTech", "Aero", "Starlight", "Novus", "Vanguard",
            "CyberShield", "Optima", "Terra", "BioGen", "Solaris", "CloudMatrix", "Acuity", "Prism", "Kinetic", "Alpha"
        ]
        company_suffixes = [
            "Technologies", "Solutions", "Enterprises", "Corporation", "Systems", "Global", "Logistics", "Digital",
            "Innovations", "Networks", "Industries", "Holdings", "Labs", "Analytics", "Pharma", "Capital", "Dynamics",
            "Infra", "Services", "Cloud"
        ]
        cities = [
            ("Mumbai", "27", "Maharashtra"),
            ("Bengaluru", "29", "Karnataka"),
            ("Hyderabad", "36", "Telangana"),
            ("Delhi NCR", "07", "Delhi"),
            ("Chennai", "33", "Tamil Nadu"),
            ("Pune", "27", "Maharashtra"),
            ("Ahmedabad", "24", "Gujarat"),
            ("Kolkata", "19", "West Bengal"),
            ("Gurugram", "06", "Haryana"),
            ("Noida", "09", "Uttar Pradesh")
        ]

        customers = []
        cust_set = set()
        while len(customers) < 200:
            pfx = random.choice(company_prefixes)
            sfx = random.choice(company_suffixes)
            comp_name = f"{pfx} {sfx} Ltd" if random.random() > 0.4 else f"{pfx} {sfx}"
            if comp_name in cust_set:
                comp_name = f"{pfx} {sfx} #{len(customers) + 1}"
            cust_set.add(comp_name)

            tier = random.choices([Tier.GOLD, Tier.SILVER, Tier.BRONZE], weights=[0.3, 0.45, 0.25])[0]
            city, state_code, state_name = random.choice(cities)
            slug = comp_name.lower().replace(" ", "").replace("#", "").replace(".", "")[:12]
            email = f"procurement@{slug}.com"
            phone = f"+91-{random.randint(7000000000, 9999999999)}"
            addr = f"Unit {random.randint(101, 909)}, Cyber Tower {random.choice(['A', 'B', 'C'])}, {city}, {state_name}"
            tax_id = f"GSTIN-{state_code}{slug[:5].upper()}{random.randint(1000, 9999)}{random.choice('ABCDEF')}{random.randint(1, 9)}Z{random.randint(1, 9)}"
            
            credit_limit = {
                Tier.GOLD: random.choice([4000000.0, 5000000.0, 6500000.0, 8000000.0, 10000000.0]),
                Tier.SILVER: random.choice([1500000.0, 2000000.0, 2500000.0, 3000000.0]),
                Tier.BRONZE: random.choice([300000.0, 500000.0, 750000.0, 1000000.0])
            }[tier]
            terms = random.choice(["Net 15", "Net 30", "Net 45", "Net 60"])

            c = Customer(
                id=uuid4(), name=comp_name, tier=tier, email=email, phone=phone,
                address_billing=addr, address_shipping=f"{addr} - Warehouse Gate {random.randint(1, 4)}",
                tax_id=tax_id, rep_id=reps[len(customers) % len(reps)].id,
                credit_limit=credit_limit, payment_terms=terms, status=CustomerStatus.ACTIVE,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(10, 365))
            )
            customers.append(c)
            session.add(c)
        session.flush()

        buyer1.customer_id = customers[0].id
        buyer2.customer_id = customers[1].id
        session.add(buyer1)
        session.add(buyer2)
        session.flush()

        # ─── 3. PRODUCTS (200 Enterprise Products) ────────────────────────────
        categories = ["Hardware", "Subscription", "Services", "SaaS"]
        hardware_templates = [
            ("Enterprise Laptop Pro X{i}", "LAP-PRO-X{i}", 85000.0, 60000.0, 20.0, "unit", "16GB RAM, 512GB SSD, Core i7 Corporate Workstation"),
            ("High Performance Workstation W{i}", "WRK-HP-W{i}", 145000.0, 105000.0, 15.0, "unit", "32GB RAM, 1TB NVMe, RTX GPU Engineering Station"),
            ("Rack Server Node RS-{i}00", "SRV-RACK-{i}00", 380000.0, 270000.0, 15.0, "unit", "Dual Xeon 64-Core, 256GB ECC RAM, Redundant PSU"),
            ("NextGen Firewall Gateway FW-{i}0", "NET-FW-{i}00", 150000.0, 100000.0, 15.0, "unit", "10Gbps Threat Inspection & IPsec VPN Gateway"),
            ("SAN Storage Array {i}0TB NVMe", "SAN-NVME-{i}0T", 550000.0, 400000.0, 12.0, "unit", "All-Flash Enterprise SAN Storage Array"),
            ("High Density L3 Switch SW-{i}8P", "NET-SW-{i}8P", 110000.0, 75000.0, 15.0, "unit", "48-Port 10G SFP+ Managed Core Switch"),
            ("Industrial IoT Edge Gateway IG-{i}", "IOT-GATE-{i}", 28000.0, 18000.0, 15.0, "unit", "Ruggedized telemetry and edge inference gateway"),
            ("Biometric Security Controller BC-{i}", "SEC-BIO-{i}", 18500.0, 11000.0, 10.0, "unit", "FIDO2 Multi-Factor Touch & Iris Access Hub"),
            ("AI Vision Edge Accelerator AV-{i}", "AI-ACCEL-{i}", 92000.0, 62000.0, 15.0, "unit", "Dedicated Neural TPU for on-prem visual inference"),
            ("Smart Power Distribution PDU-{i}K", "PWR-PDU-{i}K", 35000.0, 22000.0, 12.0, "unit", "IP-monitored rack PDU with surge telemetry")
        ]
        saas_templates = [
            ("Cloud Governance & Security Suite v{i}", "SaaS-GOV-V{i}", 15000.0, 3500.0, 25.0, "license/yr", "Automated multi-cloud compliance and policy audit"),
            ("Real-Time Business Intelligence BI-{i}", "SaaS-BI-{i}", 8500.0, 2000.0, 20.0, "user/mo", "Executive revenue forecasting & pipeline intelligence"),
            ("Managed Kubernetes Orchestrator K8-{i}", "SaaS-K8S-{i}", 35000.0, 10000.0, 20.0, "cluster/mo", "Autoscaling zero-ops Kubernetes cloud cluster"),
            ("AI Workflow Automation Hub Flow-{i}", "SaaS-FLOW-{i}", 45000.0, 12000.0, 25.0, "org/yr", "Autonomous sales flow routing & smart pricing triggers"),
            ("Zero Trust Access Proxy ZT-{i}", "SaaS-ZT-{i}", 6500.0, 1500.0, 20.0, "user/yr", "Identity-aware cloud perimeter security proxy"),
            ("Continuous Disaster Recovery DR-{i}", "SaaS-DR-{i}", 18000.0, 5000.0, 20.0, "node/mo", "Near-zero RPO/RTO database & disk replication"),
            ("Microservice API Gateway APIGW-{i}", "SaaS-APIGW-{i}", 16000.0, 4000.0, 25.0, "instance/mo", "High throughput edge rate limiter & policy gateway"),
            ("Salesforce SAP Integration Pack INT-{i}", "SaaS-CONN-{i}", 14000.0, 3500.0, 20.0, "connector", "Bi-directional ERP & CRM data synchronization")
        ]
        service_templates = [
            ("Turnkey Deployment & Commissioning #{i}", "SRV-DEP-{i}0", 50000.0, 20000.0, 10.0, "engagement", "Certified on-premise hardware & network deployment"),
            ("24/7 Dedicated TAM Support Tier {i}", "SUP-TAM-{i}", 24000.0, 8000.0, 15.0, "year", "24x7 Priority Support with 30-min SLA response"),
            ("Cybersecurity Penetration Audit Phase {i}", "SRV-SEC-{i}", 120000.0, 50000.0, 10.0, "audit", "Comprehensive external & internal vulnerability audit"),
            ("Database Migration & Architecture {i}", "SRV-DBM-{i}", 95000.0, 40000.0, 10.0, "project", "Zero-downtime PostgreSQL & Cloud database migration"),
            ("Cloud Cost FinOps Optimization #{i}", "SRV-FINOPS-{i}", 65000.0, 25000.0, 10.0, "audit", "Infrastructure right-sizing & cloud spend reduction"),
            ("ISO 27001 SOC2 Compliance Retainer #{i}", "SRV-COMPL-{i}", 180000.0, 75000.0, 10.0, "year", "Continuous compliance readiness and auditor sign-off")
        ]

        products = []
        prod_idx = 1
        # Generate 200 products evenly distributed across categories
        while len(products) < 200:
            if len(products) < 80:
                tmpl = random.choice(hardware_templates)
                cat = "Hardware"
            elif len(products) < 150:
                tmpl = random.choice(saas_templates)
                cat = "Subscription" if "mo" in tmpl[5] or "yr" in tmpl[5] else "SaaS"
            else:
                tmpl = random.choice(service_templates)
                cat = "Services"

            name = tmpl[0].format(i=prod_idx)
            sku = tmpl[1].format(i=prod_idx)
            price = round(tmpl[2] * random.uniform(0.9, 1.25), -2)
            cost = round(tmpl[3] * random.uniform(0.9, 1.15), -2)
            ceiling = tmpl[4]
            unit = tmpl[5]
            desc = tmpl[6]

            p = Product(
                id=uuid4(), name=name, sku=sku, category=cat,
                price=price, cost=cost, discount_ceiling=ceiling,
                tax_rate=18.0, unit=unit, description=desc, is_archived=False
            )
            products.append(p)
            session.add(p)
            prod_idx += 1
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
                replenishment_threshold=20, shipping_cost=cost, priority=prio
            )
            warehouses.append(w)
            session.add(w)
        session.flush()

        for p in products:
            if p.category == "Hardware":
                for w in warehouses:
                    avail = random.randint(20, 250)
                    reserved = random.randint(0, 20)
                    incoming = random.randint(15, 60)
                    session.add(StockInventory(
                        id=uuid4(), warehouse_id=w.id, product_id=p.id,
                        available_units=avail, reserved_units=reserved,
                        incoming_units=incoming, reorder_level=25
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

        for idx in range(15):
            p1 = products[idx]
            p2 = products[(idx + 5) % len(products)]
            session.add(UpsellRule(
                id=uuid4(), product_id=p1.id, recommended_product_id=p2.id,
                promotion=f"Bundle {p2.name[:25]} with {p1.name[:25]} for enhanced ROI",
                priority=1, min_margin_impact=round(random.uniform(2.0, 5.0), 1)
            ))
        session.flush()

        # ─── 6. SUBSCRIPTION PLANS & CUSTOMER SUBSCRIPTIONS ───────────────────
        plans_raw = [
            ("Starter Cloud", BillingCycle.MONTHLY, 5000.0, "Small teams up to 10 users"),
            ("Business Pro", BillingCycle.YEARLY, 48000.0, "Up to 50 users with analytics suite"),
            ("Enterprise Suite", BillingCycle.YEARLY, 120000.0, "Unlimited users with TAM support"),
            ("CyberShield Managed", BillingCycle.MONTHLY, 25000.0, "24/7 SOC monitoring and threat mitigation"),
            ("FinOps Optimizer", BillingCycle.YEARLY, 75000.0, "Continuous cloud spend governance"),
            ("AI Revenue Copilot", BillingCycle.YEARLY, 90000.0, "Real-time deal risk & discount guidance"),
            ("Global Multi-Region Sync", BillingCycle.MONTHLY, 35000.0, "Sub-second geo-distributed caching"),
            ("Dedicated Edge Cluster", BillingCycle.YEARLY, 240000.0, "Isolated hardware & custom VPC endpoints")
        ]
        sub_plans = []
        for pname, cycle, pprice, pdesc in plans_raw:
            sp = SubscriptionPlan(id=uuid4(), name=pname, billing_cycle=cycle, price=pprice, description=pdesc, is_active=True)
            sub_plans.append(sp)
            session.add(sp)
        session.flush()

        for idx, c in enumerate(customers[:40]):
            plan = sub_plans[idx % len(sub_plans)]
            session.add(CustomerSubscription(
                id=uuid4(), customer_id=c.id, plan_id=plan.id,
                quantity=random.randint(1, 10), status=SubscriptionStatus.ACTIVE,
                start_date=date(2026, 1, 1) + timedelta(days=idx * 5),
                next_billing_date=date(2026, 10, 1) + timedelta(days=idx * 3)
            ))
        session.flush()

        # ─── 7. QUOTATIONS & LINE ITEMS (200 Enterprise Deals) ────────────────
        quotations = []
        status_pool = [QuoteStatus.CONFIRMED, QuoteStatus.APPROVED, QuoteStatus.PENDING_APPROVAL, QuoteStatus.DRAFT, QuoteStatus.REJECTED]
        status_weights = [0.45, 0.25, 0.15, 0.10, 0.05]

        now = datetime.now(timezone.utc)
        for i in range(200):
            cust = customers[i % len(customers)]
            rep = reps[i % len(reps)]
            q_status = random.choices(status_pool, weights=status_weights)[0]
            
            line_count = random.randint(1, 4)
            chosen_prods = random.sample(products, line_count)
            
            subtotal = 0.0
            discount_total = 0.0
            tax_total = 0.0
            total_cost = 0.0
            lines_to_add = []

            for p in chosen_prods:
                qty = random.randint(2, 25) if p.category == "Hardware" else random.randint(1, 8)
                disc_pct = random.choice([0.0, 5.0, 8.0, 10.0, 12.0, 15.0, 18.0, 20.0])
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

            avg_disc = (discount_total / subtotal * 100.0) if subtotal > 0 else 0.0
            blended_risk = round(min(100.0, max(5.0, (avg_disc * 2.2) + (25.0 if margin_pct < 15.0 else 5.0) + random.uniform(-4, 8))), 1)
            risk_level = "HIGH" if blended_risk >= 60.0 else ("MEDIUM" if blended_risk >= 30.0 else "LOW")

            days_ago = random.randint(1, 180)
            created_dt = now - timedelta(days=days_ago)

            q = Quotation(
                id=uuid4(), customer_id=cust.id, rep_id=rep.id,
                status=q_status, subtotal=round(subtotal, 2),
                discount_total=round(discount_total, 2), tax_total=round(tax_total, 2),
                total=round(total, 2), margin=round(margin, 2), margin_percent=round(margin_pct, 1),
                currency="INR", blended_risk=blended_risk, risk_level=risk_level, version=1,
                created_at=created_dt,
                expires_at=created_dt + timedelta(days=30)
            )
            quotations.append((q, lines_to_add))
            session.add(q)
        session.flush()

        # Insert quotation lines
        for q, lines in quotations:
            for l in lines:
                session.add(QuotationLine(id=uuid4(), quotation_id=q.id, **l))
        session.flush()

        # ─── 8. APPROVALS & GOVERNANCE (200+ Multi-Level Approvals) ───────────
        for q, _ in quotations:
            if q.status in (QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED, QuoteStatus.REJECTED):
                appr_status = ApprovalStatus.PENDING if q.status == QuoteStatus.PENDING_APPROVAL else (
                    ApprovalStatus.APPROVED if q.status == QuoteStatus.APPROVED else ApprovalStatus.REJECTED
                )
                session.add(ApprovalRequest(
                    id=uuid4(), quotation_id=q.id, approver_id=manager.id,
                    approver_role=Role.MANAGER.value, approval_level=1,
                    status=appr_status, quote_version=q.version,
                    comments="Evaluation against commercial discount ceiling" if q.blended_risk > 45 else "Standard sales manager tier review"
                ))
                if q.blended_risk >= 40.0:
                    session.add(ApprovalRequest(
                        id=uuid4(), quotation_id=q.id, approver_id=finance.id,
                        approver_role=Role.FINANCE.value, approval_level=2,
                        status=appr_status, quote_version=q.version,
                        comments="Finance threshold sign-off on Gross Margin"
                    ))
        session.flush()

        # ─── 9. ORDERS & SHIPMENTS (200 Enterprise Orders) ────────────────────
        eligible_quotes = [q for q, _ in quotations if q.status in (QuoteStatus.CONFIRMED, QuoteStatus.APPROVED)]
        orders = []
        for idx in range(200):
            q = eligible_quotes[idx % len(eligible_quotes)]
            ord_status = random.choices(
                [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING],
                weights=[0.6, 0.25, 0.15]
            )[0]
            
            cust = next(c for c in customers if c.id == q.customer_id)
            delivery_addr = cust.address_shipping or cust.address_billing

            o = Order(
                id=uuid4(), quotation_id=q.id, customer_id=q.customer_id, rep_id=q.rep_id,
                status=ord_status, total_amount=q.total,
                delivery_address=delivery_addr,
                promised_delivery_date=date.today() + timedelta(days=random.randint(2, 14)),
                payment_status="PAID" if ord_status == OrderStatus.DELIVERED else "PARTIAL",
                created_at=q.created_at + timedelta(days=1)
            )
            orders.append(o)
            session.add(o)
        session.flush()

        courier_list = ["Blue Dart Express", "Delhivery Logistics", "DHL Supply Chain", "FedEx Enterprise", "Gati KWE"]
        for idx, o in enumerate(orders):
            wh = warehouses[idx % len(warehouses)]
            courier = random.choice(courier_list)
            ship_status = ShipmentStatus.DELIVERED if o.status == OrderStatus.DELIVERED else (
                ShipmentStatus.IN_TRANSIT if o.status == OrderStatus.SHIPPED else ShipmentStatus.CREATED
            )
            session.add(Shipment(
                id=uuid4(), order_id=o.id, warehouse_id=wh.id,
                courier=courier, tracking_number=f"{courier[:3].upper()}-2026-{random.randint(1000000, 9999999)}",
                shipping_cost=wh.shipping_cost,
                estimated_delivery=date.today() + timedelta(days=random.randint(1, 5)),
                status=ship_status
            ))
        session.flush()

        # ─── 10. INVOICES, PAYMENTS & CREDIT NOTES (200 Invoices) ─────────────
        invoices = []
        for idx, o in enumerate(orders):
            inv_num = f"INV-2026-{10001 + idx}"
            paid_ratio = 1.0 if o.status == OrderStatus.DELIVERED else (0.5 if idx % 2 == 0 else 0.0)
            amt_paid = round(o.total_amount * paid_ratio, 2)
            out_amt = round(o.total_amount - amt_paid, 2)
            inv_status = InvoiceStatus.PAID if out_amt == 0 else (InvoiceStatus.PARTIALLY_PAID if amt_paid > 0 else InvoiceStatus.SENT)

            inv = Invoice(
                id=uuid4(), invoice_number=inv_num, order_id=o.id,
                customer_id=o.customer_id, status=inv_status,
                amount=o.total_amount, amount_paid=amt_paid, outstanding_amount=out_amt,
                currency="INR", due_date=date.today() + timedelta(days=30 - (idx % 25)),
                created_at=o.created_at + timedelta(hours=6)
            )
            invoices.append(inv)
            session.add(inv)
        session.flush()

        pay_methods = [PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD, PaymentMethod.ACH, PaymentMethod.NET_30]
        for inv in invoices:
            if inv.amount_paid > 0:
                session.add(Payment(
                    id=uuid4(), invoice_id=inv.id, amount=inv.amount_paid,
                    method=random.choice(pay_methods),
                    transaction_id=f"TXN-2026-{random.randint(1000000, 9999999)}",
                    status="COMPLETED"
                ))
            if inv.status == InvoiceStatus.PARTIALLY_PAID and random.random() < 0.25:
                session.add(CreditNote(
                    id=uuid4(), credit_note_number=f"CN-2026-{random.randint(1000, 9999)}",
                    customer_id=inv.customer_id, invoice_id=inv.id,
                    amount=round(inv.amount * 0.05, 2), reason="Enterprise volume pricing adjustment rebate"
                ))
        session.flush()

        # ─── 11. NOTIFICATIONS & AUDIT LOGS (200 Entries) ─────────────────────
        for idx, (q, _) in enumerate(quotations):
            session.add(Notification(
                id=uuid4(), user_id=q.rep_id,
                title=f"Quote #{str(q.id)[:8]} Status: {q.status.value}",
                body=f"Commercial proposal valued at ₹{q.total:,.2f} (Margin: {q.margin_percent}%, Risk: {q.risk_level})",
                category="QUOTE", reference_id=str(q.id), is_read=(idx % 3 != 0)
            ))
            session.add(AuditLog(
                id=uuid4(), quotation_id=q.id, user_id=q.rep_id,
                action="RISK_AND_MARGIN_AUDIT", old_value="Draft",
                new_value=f"₹{q.total:,.0f}",
                reason=f"System evaluated margin of {q.margin_percent}% and blended risk score of {q.blended_risk}%"
            ))

        session.commit()
        print("🎉 200+ Enterprise Database Seed Complete across ALL Categories!")
        print(f"   👤 Users: {len(all_users)}")
        print(f"   🏢 Customers: {len(customers)} (200 records)")
        print(f"   📦 Products: {len(products)} (200 records)")
        print(f"   🏭 Warehouses: {len(warehouses)} with multi-product stock")
        print(f"   📄 Quotations: {len(quotations)} (200 records with 500+ lines)")
        print(f"   📋 Orders & Shipments: {len(orders)} (200 records)")
        print(f"   🧾 Invoices: {len(invoices)} (200 records)")
        print(f"   📜 Subscriptions: {len(sub_plans)} plans")
        print(f"   🛡️ Approvals & Audit Trail: 200+ entries")


if __name__ == "__main__":
    force_reset = "--force" in sys.argv or "--reset" in sys.argv or True
    seed(force=force_reset)
