"""
DealFlow360 Enterprise Database Seeder
Populates EVERY database table with 200+ enterprise records:
- user: 200 records
- customer: 200 records
- product: 200 records
- warehouse: 200 records
- stockinventory: 400+ records
- quotation: 200 records
- quotationline: 500+ records
- quotationversion: 200 records
- approvalrequest: 200 records
- order: 200 records
- orderline: 500+ records
- shipment: 200 records
- backorder: 200 records
- invoice: 200 records
- payment: 200 records
- creditnote: 200 records
- subscriptionplan: 200 records
- customersubscription: 200 records
- discountrule: 200 records
- upsellrule: 200 records
- pricelist: 200 records
- pricelistitem: 500+ records
- negotiation: 200 records
- negotiationmessage: 400+ records
- portalnegotiation: 200 records
- notification: 200 records
- auditlog: 300+ records
"""
import sys
import os
import json
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
from app.models.quotation import Quotation, QuotationLine, QuotationVersion, QuoteStatus, RiskLevel
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.order import Order, OrderLine, Shipment, Backorder, OrderStatus, ShipmentStatus, PaymentStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus, PaymentMethod
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.price_list import PriceList, PriceListItem
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.portal import PortalNegotiation
from app.models.notification import Notification
from app.models.audit import AuditLog


def seed(force: bool = False):
    """Seed every table in the database with 200+ realistic enterprise records."""
    init_db()

    with Session(engine) as session:
        print("🔄 Resetting database tables for 200+ records in EVERY table...")
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)

        print("🌱 Seeding 200+ records across all 27 database tables...")
        random.seed(42)
        now = datetime.now(timezone.utc)

        # ─── 1. USERS (200 Users) ─────────────────────────────────────────────
        first_names = ["Alex", "Priya", "Rohan", "Ananya", "Vikram", "Neha", "Rahul", "Pooja", "Arjun", "Kavita",
                       "Siddharth", "Meera", "Aditya", "Tanvi", "Karan", "Shreya", "Deepak", "Ritu", "Amit", "Sneha"]
        last_names = ["Kumar", "Sharma", "Mehta", "Desai", "Patel", "Singh", "Verma", "Reddy", "Nair", "Chopra",
                      "Joshi", "Bose", "Iyer", "Rao", "Gupta", "Malhotra", "Kapoor", "Bhat", "Saxena", "Sen"]

        # Precalculate hashes once for blazing speed
        admin_hash = get_password_hash("admin123")
        rep_hash = get_password_hash("rep123")
        cust_hash = get_password_hash("cust123")
        mgr_hash = get_password_hash("mgr123")
        fin_hash = get_password_hash("fin123")
        ops_hash = get_password_hash("ops123")

        users = []
        # Core standard logins
        admin = User(id=uuid4(), name="Super Admin", email="admin@dealflow360.com",
                     password_hash=admin_hash, role=Role.ADMIN)
        manager = User(id=uuid4(), name="Maria Manager", email="maria.manager@dealflow360.com",
                       password_hash=mgr_hash, role=Role.MANAGER)
        finance = User(id=uuid4(), name="Felix Finance", email="felix.finance@dealflow360.com",
                       password_hash=fin_hash, role=Role.FINANCE)
        ops = User(id=uuid4(), name="Ops Team Lead", email="ops@dealflow360.com",
                   password_hash=ops_hash, role=Role.OPERATIONS)
        buyer1 = User(id=uuid4(), name="ABC Corp Buyer", email="buyer@abccorp.com",
                      password_hash=cust_hash, role=Role.CUSTOMER)
        buyer2 = User(id=uuid4(), name="TechVision Lead", email="procurement@techvision.in",
                      password_hash=cust_hash, role=Role.CUSTOMER)
        
        users.extend([admin, manager, finance, ops, buyer1, buyer2])

        roles_pool = [Role.REP, Role.CUSTOMER, Role.MANAGER, Role.FINANCE, Role.OPERATIONS]
        role_weights = [0.45, 0.35, 0.08, 0.06, 0.06]

        while len(users) < 200:
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            email_candidate = f"{fn.lower()}.{ln.lower()}.{len(users)+1}@dealflow360.com"
            role = random.choices(roles_pool, weights=role_weights)[0]
            phash = rep_hash if role == Role.REP else (cust_hash if role == Role.CUSTOMER else admin_hash)
            u = User(
                id=uuid4(), name=f"{fn} {ln}", email=email_candidate,
                password_hash=phash, role=role, is_active=True
            )
            users.append(u)

        for u in users:
            session.add(u)
        session.flush()

        reps = [u for u in users if u.role == Role.REP]
        if not reps:
            reps = [users[1]]

        # ─── 2. CUSTOMERS (200 Customers) ─────────────────────────────────────
        company_prefixes = [
            "Apex", "Nexus", "Quantum", "Vortex", "Titanium", "Beacon", "Zenith", "Horizon", "BlueWave", "Pulse",
            "Crestview", "Sterling", "Falcon", "Paramount", "Aura", "Metro", "Prime", "Vertex", "Summit", "Strata",
            "Catalyst", "Hyperion", "Synapse", "Omni", "GlobalEdge", "InfiniTech", "Aero", "Starlight", "Novus", "Vanguard"
        ]
        company_suffixes = [
            "Technologies", "Solutions", "Enterprises", "Corporation", "Systems", "Global", "Logistics", "Digital",
            "Innovations", "Networks", "Industries", "Holdings", "Labs", "Analytics", "Pharma", "Capital", "Dynamics"
        ]
        cities = [
            ("Mumbai", "27", "Maharashtra"), ("Bengaluru", "29", "Karnataka"), ("Hyderabad", "36", "Telangana"),
            ("Delhi NCR", "07", "Delhi"), ("Chennai", "33", "Tamil Nadu"), ("Pune", "27", "Maharashtra"),
            ("Ahmedabad", "24", "Gujarat"), ("Kolkata", "19", "West Bengal"), ("Gurugram", "06", "Haryana")
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
            slug = comp_name.lower().replace(" ", "").replace("#", "").replace(".", "")[:10]
            email = f"procure@{slug}.com"
            phone = f"+91-{random.randint(7000000000, 9999999999)}"
            addr = f"Tower {random.randint(1, 9)}, Suite {random.randint(100, 800)}, {city}, {state_name}"
            tax_id = f"GSTIN-{state_code}{slug[:5].upper()}{random.randint(1000, 9999)}Z{random.randint(1, 9)}"
            
            credit_limit = {
                Tier.GOLD: random.choice([5000000.0, 7500000.0, 10000000.0]),
                Tier.SILVER: random.choice([2000000.0, 3000000.0, 4000000.0]),
                Tier.BRONZE: random.choice([500000.0, 800000.0, 1200000.0])
            }[tier]

            c = Customer(
                id=uuid4(), name=comp_name, tier=tier, email=email, phone=phone,
                address_billing=addr, address_shipping=f"{addr} - Shipping Bay",
                tax_id=tax_id, rep_id=reps[len(customers) % len(reps)].id,
                credit_limit=credit_limit, payment_terms=random.choice(["Net 15", "Net 30", "Net 45", "Net 60"]),
                status=CustomerStatus.ACTIVE,
                created_at=now - timedelta(days=random.randint(10, 365))
            )
            customers.append(c)
            session.add(c)
        session.flush()

        buyer1.customer_id = customers[0].id
        buyer2.customer_id = customers[1].id
        session.add(buyer1)
        session.add(buyer2)
        session.flush()

        # ─── 3. PRODUCTS (200 Products) ───────────────────────────────────────
        categories = ["Hardware", "Subscription", "Services", "SaaS"]
        products = []
        prod_idx = 1
        while len(products) < 200:
            cat = categories[len(products) % len(categories)]
            if cat == "Hardware":
                base_names = ["Enterprise Workstation", "Rack Server", "NextGen Firewall", "NVMe SAN Storage", "Core Switch", "IoT Edge Hub"]
                price = random.choice([35000.0, 85000.0, 145000.0, 220000.0, 450000.0])
                cost = price * random.uniform(0.65, 0.78)
                unit = "unit"
                ceiling = 15.0
            elif cat == "Subscription":
                base_names = ["Cloud Governance", "Real-Time BI Analytics", "Managed K8s Cluster", "AI Workflow Engine", "Disaster Recovery"]
                price = random.choice([12000.0, 24000.0, 36000.0, 48000.0, 72000.0])
                cost = price * random.uniform(0.20, 0.35)
                unit = "license/yr"
                ceiling = 25.0
            elif cat == "SaaS":
                base_names = ["API Rate Gateway", "Zero Trust Identity", "CRM Connector Suite", "Telemetry Ingestion", "Revenue AI Copilot"]
                price = random.choice([6500.0, 14000.0, 18000.0, 25000.0, 32000.0])
                cost = price * random.uniform(0.18, 0.30)
                unit = "user/mo"
                ceiling = 20.0
            else:
                base_names = ["Turnkey Deployment", "24/7 TAM Support", "Security Pen Test Audit", "DB Migration Service", "FinOps Spend Audit"]
                price = random.choice([50000.0, 75000.0, 95000.0, 120000.0, 180000.0])
                cost = price * random.uniform(0.40, 0.55)
                unit = "project"
                ceiling = 10.0

            bname = random.choice(base_names)
            p = Product(
                id=uuid4(), name=f"{bname} v{prod_idx}", sku=f"{cat[:3].upper()}-{prod_idx:04d}",
                category=cat, price=round(price, 2), cost=round(cost, 2),
                discount_ceiling=ceiling, tax_rate=18.0, unit=unit,
                description=f"Enterprise grade {cat.lower()} module {prod_idx}", is_archived=False
            )
            products.append(p)
            session.add(p)
            prod_idx += 1
        session.flush()

        # ─── 4. WAREHOUSES (200 Logistics & Fulfillment Hubs) ─────────────────
        warehouses = []
        hub_cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata", "Noida", "Gurugram", "Jaipur", "Kochi", "Chandigarh", "Indore"]
        while len(warehouses) < 200:
            cname = hub_cities[len(warehouses) % len(hub_cities)]
            w = Warehouse(
                id=uuid4(), name=f"{cname} Enterprise Logistics Node #{len(warehouses) + 1}",
                location=f"Logistics Zone {len(warehouses) + 1}, {cname}",
                city=cname, is_active=True, replenishment_threshold=20,
                shipping_cost=random.choice([1500.0, 2200.0, 2800.0, 3500.0]),
                priority=(len(warehouses) % 10) + 1
            )
            warehouses.append(w)
            session.add(w)
        session.flush()

        # Stock Inventory (400+ allocations)
        for i in range(400):
            p = products[i % len(products)]
            w = warehouses[i % len(warehouses)]
            session.add(StockInventory(
                id=uuid4(), warehouse_id=w.id, product_id=p.id,
                available_units=random.randint(20, 300),
                reserved_units=random.randint(0, 25),
                incoming_units=random.randint(10, 80),
                reorder_level=20
            ))
        session.flush()

        # ─── 5. DISCOUNT RULES & UPSELL RULES (200 Rules Each) ────────────────
        for i in range(200):
            t = random.choice(["BRONZE", "SILVER", "GOLD"])
            session.add(DiscountRule(
                id=uuid4(), tier=t, max_discount=random.choice([10.0, 15.0, 20.0, 25.0]),
                min_margin=random.choice([10.0, 12.0, 15.0, 18.0]),
                manager_approval_threshold=random.choice([8.0, 10.0, 12.0]),
                finance_approval_threshold=random.choice([15.0, 18.0, 20.0])
            ))
            p1 = products[i % len(products)]
            p2 = products[(i + 7) % len(products)]
            session.add(UpsellRule(
                id=uuid4(), product_id=p1.id, recommended_product_id=p2.id,
                promotion=f"Cross-sell {p2.name[:25]} with {p1.name[:25]} for enhanced margin",
                priority=(i % 5) + 1, min_margin_impact=round(random.uniform(2.0, 6.0), 1)
            ))
        session.flush()

        # ─── 6. SUBSCRIPTION PLANS & CUSTOMER SUBSCRIPTIONS (200 Each) ────────
        sub_plans = []
        while len(sub_plans) < 200:
            cycle = random.choice([BillingCycle.MONTHLY, BillingCycle.YEARLY])
            plan_name = f"Enterprise Cloud Tier #{len(sub_plans) + 1} ({cycle.value})"
            price = 45000.0 if cycle == BillingCycle.YEARLY else 5000.0
            sp = SubscriptionPlan(
                id=uuid4(), name=plan_name, billing_cycle=cycle,
                price=price + (len(sub_plans) * 500),
                description=f"Automated SaaS & Cloud SLA tier #{len(sub_plans) + 1}",
                is_active=True
            )
            sub_plans.append(sp)
            session.add(sp)
        session.flush()

        for i in range(200):
            c = customers[i % len(customers)]
            sp = sub_plans[i % len(sub_plans)]
            session.add(CustomerSubscription(
                id=uuid4(), customer_id=c.id, plan_id=sp.id,
                quantity=random.randint(1, 10), status=SubscriptionStatus.ACTIVE,
                start_date=date(2026, 1, 1) + timedelta(days=i),
                next_billing_date=date(2026, 10, 1) + timedelta(days=i % 30)
            ))
        session.flush()

        # ─── 7. PRICE LISTS & PRICE LIST ITEMS (200 Price Lists, 500+ Items) ──
        price_lists = []
        for i in range(200):
            tier = random.choice(["BRONZE", "SILVER", "GOLD", None])
            pl = PriceList(
                id=uuid4(), name=f"Enterprise Tariff Card 2026-Q{(i%4)+1} #{i+1}",
                tier=tier, currency="INR", effective_from=date(2026, 1, 1),
                expires_at=date(2026, 12, 31), is_active=True
            )
            price_lists.append(pl)
            session.add(pl)
        session.flush()

        for i in range(500):
            pl = price_lists[i % len(price_lists)]
            p = products[i % len(products)]
            session.add(PriceListItem(
                id=uuid4(), price_list_id=pl.id, product_id=p.id,
                price=round(p.price * random.uniform(0.85, 0.98), 2)
            ))
        session.flush()

        # ─── 8. QUOTATIONS, LINES, & VERSIONS (200 Quotes, 500+ Lines, 200 Versions)
        quotations = []
        status_pool = [QuoteStatus.CONFIRMED, QuoteStatus.APPROVED, QuoteStatus.PENDING_APPROVAL, QuoteStatus.DRAFT, QuoteStatus.REJECTED]
        status_weights = [0.45, 0.25, 0.15, 0.10, 0.05]

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
                qty = random.randint(2, 20)
                disc_pct = random.choice([0.0, 5.0, 8.0, 10.0, 15.0, 18.0])
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
                created_at=created_dt, expires_at=created_dt + timedelta(days=30)
            )
            quotations.append((q, lines_to_add))
            session.add(q)
        session.flush()

        for q, lines in quotations:
            for l in lines:
                session.add(QuotationLine(id=uuid4(), quotation_id=q.id, **l))
            # Create QuotationVersion snapshot
            session.add(QuotationVersion(
                id=uuid4(), quotation_id=q.id, version=1, status=q.status.value,
                subtotal=q.subtotal, discount_total=q.discount_total, tax_total=q.tax_total,
                total=q.total, margin=q.margin, blended_risk=q.blended_risk, risk_level=q.risk_level,
                snapshot=json.dumps({"lines_count": len(lines), "total": q.total}),
                reason="Initial baseline quotation generation", created_by=q.rep_id, created_at=q.created_at
            ))
        session.flush()

        # ─── 9. APPROVAL REQUESTS (200 Approval Requests) ─────────────────────
        for i in range(200):
            q, _ = quotations[i % len(quotations)]
            appr_status = ApprovalStatus.PENDING if i % 3 == 0 else (ApprovalStatus.APPROVED if i % 3 == 1 else ApprovalStatus.REJECTED)
            session.add(ApprovalRequest(
                id=uuid4(), quotation_id=q.id, approver_id=manager.id if i % 2 == 0 else finance.id,
                approver_role=Role.MANAGER.value if i % 2 == 0 else Role.FINANCE.value,
                approval_level=1 if i % 2 == 0 else 2,
                status=appr_status, quote_version=q.version,
                comments=f"Governance sign-off for deal #{str(q.id)[:8]} with margin {q.margin_percent}%"
            ))
        session.flush()

        # ─── 10. ORDERS, ORDER LINES, SHIPMENTS & BACKORDERS (200 Each) ───────
        orders = []
        for i in range(200):
            q, lines = quotations[i % len(quotations)]
            ord_status = random.choices(
                [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING],
                weights=[0.6, 0.25, 0.15]
            )[0]
            cust = next(c for c in customers if c.id == q.customer_id)

            o = Order(
                id=uuid4(), quotation_id=q.id, customer_id=q.customer_id, rep_id=q.rep_id,
                status=ord_status, payment_status=PaymentStatus.PAID if ord_status == OrderStatus.DELIVERED else PaymentStatus.PARTIAL,
                total_amount=q.total, delivery_address=cust.address_shipping or cust.address_billing,
                promised_delivery_date=date.today() + timedelta(days=random.randint(2, 14)),
                created_at=q.created_at + timedelta(days=1)
            )
            orders.append((o, lines))
            session.add(o)
        session.flush()

        courier_list = ["Blue Dart Express", "Delhivery Logistics", "DHL Supply Chain", "FedEx Enterprise", "Gati KWE"]
        for idx, (o, lines) in enumerate(orders):
            wh = warehouses[idx % len(warehouses)]
            # Add order lines
            for l in lines:
                session.add(OrderLine(
                    id=uuid4(), order_id=o.id, product_id=l["product_id"],
                    warehouse_id=wh.id, quantity=l["quantity"],
                    unit_price=l["unit_price"], line_total=l["line_total"]
                ))
            # Add shipment
            courier = random.choice(courier_list)
            ship_status = ShipmentStatus.DELIVERED if o.status == OrderStatus.DELIVERED else (
                ShipmentStatus.IN_TRANSIT if o.status == OrderStatus.SHIPPED else ShipmentStatus.CREATED
            )
            session.add(Shipment(
                id=uuid4(), order_id=o.id, warehouse_id=wh.id,
                courier=courier, tracking_number=f"{courier[:3].upper()}-2026-{random.randint(1000000, 9999999)}",
                shipping_cost=wh.shipping_cost, estimated_delivery=date.today() + timedelta(days=random.randint(1, 5)),
                status=ship_status
            ))
            # Add backorder
            p_back = products[idx % len(products)]
            session.add(Backorder(
                id=uuid4(), order_id=o.id, product_id=p_back.id,
                required_qty=random.randint(10, 50), available_qty=random.randint(0, 5),
                backorder_qty=random.randint(5, 45),
                expected_restock_date=date.today() + timedelta(days=random.randint(3, 20)),
                is_resolved=(idx % 2 == 0)
            ))
        session.flush()

        # ─── 11. INVOICES, PAYMENTS & CREDIT NOTES (200 Each) ─────────────────
        invoices = []
        for idx, (o, _) in enumerate(orders):
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
        for idx, inv in enumerate(invoices):
            session.add(Payment(
                id=uuid4(), invoice_id=inv.id,
                amount=inv.amount_paid if inv.amount_paid > 0 else round(inv.amount * 0.25, 2),
                method=random.choice(pay_methods),
                transaction_id=f"TXN-2026-{random.randint(1000000, 9999999)}",
                status="COMPLETED"
            ))
            session.add(CreditNote(
                id=uuid4(), credit_note_number=f"CN-2026-{1000 + idx}",
                customer_id=inv.customer_id, invoice_id=inv.id,
                amount=round(inv.amount * 0.05, 2),
                reason="Enterprise SLA & volume incentive commercial credit adjustment"
            ))
        session.flush()

        # ─── 12. NEGOTIATIONS, MESSAGES & PORTAL NEGOTIATIONS (200 Each) ──────
        for idx in range(200):
            q, _ = quotations[idx % len(quotations)]
            neg = Negotiation(
                id=uuid4(), quotation_id=q.id, customer_id=q.customer_id, rep_id=q.rep_id,
                status=random.choice([NegotiationStatus.OPEN, NegotiationStatus.ACCEPTED, NegotiationStatus.COUNTER_OFFERED]),
                requested_discount=round(random.uniform(10.0, 20.0), 1),
                counter_discount=round(random.uniform(5.0, 12.0), 1),
                final_discount=round(random.uniform(5.0, 10.0), 1)
            )
            session.add(neg)
            session.flush()

            session.add(NegotiationMessage(
                id=uuid4(), negotiation_id=neg.id, sender_id=buyer1.id,
                sender_role=SenderRole.CUSTOMER,
                message=f"Can we get a volume discount on this enterprise deployment package for quote #{str(q.id)[:8]}?",
                discount_proposed=neg.requested_discount
            ))
            session.add(NegotiationMessage(
                id=uuid4(), negotiation_id=neg.id, sender_id=q.rep_id,
                sender_role=SenderRole.REP,
                message=f"We can offer {neg.counter_discount}% provided payment terms are Net 30 with 24/7 TAM support.",
                discount_proposed=neg.counter_discount
            ))

            session.add(PortalNegotiation(
                id=uuid4(), quotation_id=q.id,
                customer_note=f"Customer submitted commercial counter proposal via customer portal for #{str(q.id)[:8]}",
                counter_discount=neg.counter_discount
            ))
        session.flush()

        # ─── 13. NOTIFICATIONS & AUDIT LOGS (200 Notifications, 300+ Logs) ────
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
            if idx < 100:
                session.add(AuditLog(
                    id=uuid4(), quotation_id=q.id, user_id=manager.id,
                    action="GOVERNANCE_RULE_EVAL", old_value="Pending",
                    new_value=q.status.value,
                    reason="Automated policy check on discount ceilings and gross margin thresholds"
                ))

        session.commit()
        print("🎉 Successfully seeded 200+ records in EVERY table across the entire database!")


if __name__ == "__main__":
    force_reset = "--force" in sys.argv or "--reset" in sys.argv or True
    seed(force=force_reset)
