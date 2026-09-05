"""Database seeding script for tiers, products, warehouses, plans, and demo users."""
import random
from datetime import datetime, timedelta

from sqlmodel import Session, select
from app.db import init_db, engine
from app.models.user import User, Role
from app.models.customer import Customer, Tier
from app.models.product import Product
from app.models.warehouse import Warehouse, StockInventory
from app.models.subscription import SubscriptionPlan
from app.models.quotation import Quotation, QuotationLine, QuoteStatus
from app.services.pricing_policy import blended_risk, LineInput
from app.core.security import get_password_hash

def seed_demo_data():
    init_db()
    
    with Session(engine) as session:
        # 1. Seed Customer
        existing_cust = session.exec(select(Customer)).first()
        if not existing_cust:
            acme = Customer(name="Acme Corporation", tier=Tier.SILVER)
            megacorp = Customer(name="MegaCorp Global", tier=Tier.GOLD)
            startup = Customer(name="BioTech Labs", tier=Tier.BRONZE)
            session.add_all([acme, megacorp, startup])
            session.commit()
            session.refresh(acme)
            print("Seeded Customers.")
        else:
            acme = existing_cust

        # 2. Seed Users
        existing_users = session.exec(select(User)).all()
        if not existing_users:
            default_pwd = get_password_hash("password123")
            demo_users = [
                User(name="Alex Rep", email="rep@dealflow360.com", password_hash=default_pwd, role=Role.REP),
                User(name="Maria Manager", email="manager@dealflow360.com", password_hash=default_pwd, role=Role.MANAGER),
                User(name="Felix Finance", email="finance@dealflow360.com", password_hash=default_pwd, role=Role.FINANCE),
                User(name="Acme Buyer", email="buyer@acmecorp.com", password_hash=default_pwd, role=Role.CUSTOMER, customer_id=acme.id),
                User(name="System Admin", email="admin@dealflow360.com", password_hash=default_pwd, role=Role.ADMIN),
            ]
            session.add_all(demo_users)
            session.commit()
            print("Seeded 5 Demo Users (Password: password123).")

        # 3. Seed Products
        existing_products = session.exec(select(Product)).first()
        if not existing_products:
            products = [
                Product(name="Enterprise Edge Router X1", category="Hardware", price=1200.0, cost=650.0, discount_ceiling=15.0),
                Product(name="Core Switch 48-Port PoE+", category="Hardware", price=2400.0, cost=1300.0, discount_ceiling=15.0),
                Product(name="24/7 Mission-Critical Support Pack", category="Services", price=1500.0, cost=300.0, discount_ceiling=25.0),
                Product(name="DealFlow SaaS Platform License (User/Mo)", category="Subscription", price=65.0, cost=10.0, discount_ceiling=20.0),
            ]
            session.add_all(products)
            session.commit()
            print("Seeded Demo Products.")

        # 4. Seed Warehouses & Inventory
        existing_wh = session.exec(select(Warehouse)).first()
        if not existing_wh:
            wh_chicago = Warehouse(name="Chicago Central Hub", location="Chicago, IL")
            wh_austin = Warehouse(name="Austin West Facility", location="Austin, TX")
            session.add_all([wh_chicago, wh_austin])
            session.commit()
            session.refresh(wh_chicago)
            session.refresh(wh_austin)

            # Add inventory for Edge Router
            router = session.exec(select(Product).where(Product.category == "Hardware")).first()
            if router:
                inv1 = StockInventory(warehouse_id=wh_chicago.id, product_id=router.id, available_units=45)
                inv2 = StockInventory(warehouse_id=wh_austin.id, product_id=router.id, available_units=15)
                session.add_all([inv1, inv2])
                session.commit()
            print("Seeded Warehouses and Inventory.")

        # 5. Seed Subscription Plans
        existing_plan = session.exec(select(SubscriptionPlan)).first()
        if not existing_plan:
            plan = SubscriptionPlan(name="DealFlow Cloud Enterprise", monthly_rate=850.0, annual_rate=9200.0, billing_frequency="monthly")
            session.add(plan)
            session.commit()
            print("Seeded Subscription Plans.")

    # 6. Seed realistic historical + current deal data (ML signal).
    seed_history()

    print("\\nAll seed data verified and ready!")

# --- Historical data for the glass-box AI layer ------------------------------
# Reuses Quotation/QuotationLine (status=CONFIRMED, backdated) as "order
# history": confirmed baskets feed co-purchase mining, and per-rep line
# discounts feed the anomaly baseline. Deterministic (random.seed) so the demo
# is identical every run. Idempotent: bails if any Quotation already exists.

# Extra products so association rules are non-trivial (name, category, price, cost, ceiling).
_EXTRA_PRODUCTS = [
    ("Cat6 Cable Bundle (50-pack)", "Hardware", 180.0, 40.0, 15.0),
    ("42U Server Rack Kit", "Hardware", 900.0, 520.0, 15.0),
    ("Onboarding & Deployment Services", "Services", 2000.0, 350.0, 25.0),
    ("Extended Warranty 3yr", "Services", 700.0, 120.0, 20.0),
]

# Keyword -> canonical product key, for matching seeded products by name.
_PRODUCT_KEYS = {
    "Edge Router": "router",
    "Core Switch": "switch",
    "Support Pack": "support",
    "SaaS Platform": "saas",
    "Cat6 Cable": "cat6",
    "Rack Kit": "rack",
    "Onboarding": "onboarding",
    "Extended Warranty": "warranty",
}

# Baked co-purchase patterns: anchor -> [(partner_key, attach_probability)].
# High-margin consequents (support/saas/onboarding/warranty/cat6) win ranking.
_COPURCHASE = {
    "router": [("support", 0.80), ("cat6", 0.70)],
    "switch": [("rack", 0.65), ("cat6", 0.50)],
    "saas": [("onboarding", 0.60), ("support", 0.40)],
    "support": [("warranty", 0.50)],
}
# Weighted anchor selection (hardware/platform anchor most deals).
_ANCHORS = (["router"] * 5 + ["switch"] * 4 + ["saas"] * 3 + ["support"] * 2 + ["onboarding"] * 1)

# Per-rep discount behaviour (email -> (mean, stdev)); drives the anomaly baseline.
_REP_PROFILE = {
    "rep@dealflow360.com": (11.0, 3.0),   # Alex — moderate
    "rita@dealflow360.com": (6.0, 2.0),   # Rita — disciplined
    "sam@dealflow360.com": (9.0, 3.0),    # Sam — normally fine (baseline for the hero anomaly)
}


def _rep_discount(mean: float, stdev: float) -> float:
    """A clamped, one-decimal discount draw for a rep's normal behaviour."""
    return round(min(22.0, max(0.0, random.gauss(mean, stdev))), 1)


def seed_history():
    """Seed extra reps/products and ~120 backdated deals + current stalled/anomalous deals."""
    random.seed(42)
    with Session(engine) as session:
        # (a) Extra REP users (Rita, Sam) so per-rep baselines exist.
        for name, email in [("Rita Rep", "rita@dealflow360.com"), ("Sam Rep", "sam@dealflow360.com")]:
            if not session.exec(select(User).where(User.email == email)).first():
                session.add(User(name=name, email=email,
                                 password_hash=get_password_hash("password123"), role=Role.REP))
        session.commit()

        # (b) Extra products so baskets are rich (only if catalogue is still small).
        if len(session.exec(select(Product)).all()) < 8:
            session.add_all([Product(name=n, category=c, price=p, cost=co, discount_ceiling=dc)
                             for (n, c, p, co, dc) in _EXTRA_PRODUCTS])
            session.commit()

        # Idempotency: if deals already exist we've fully run before.
        if session.exec(select(Quotation)).first():
            return

        # Resolve products into a key -> Product map.
        products = session.exec(select(Product)).all()
        by_key = {}
        for p in products:
            for needle, key in _PRODUCT_KEYS.items():
                if needle in p.name:
                    by_key[key] = p
        all_keys = list(by_key.keys())

        customers = session.exec(select(Customer)).all()
        reps = {u.email: u for u in session.exec(select(User).where(User.role == Role.REP)).all()}
        now = datetime.utcnow()

        def build_lines(basket_keys, mean, stdev):
            lines, line_inputs = [], []
            for key in basket_keys:
                prod = by_key[key]
                qty = random.randint(1, 3)
                disc = _rep_discount(mean, stdev)
                lines.append((prod, qty, disc))
                line_inputs.append(LineInput(list_price=prod.price, cost=prod.cost,
                                             category_ceiling=prod.discount_ceiling,
                                             discount_percent=disc, qty=qty, product_id=str(prod.id)))
            return lines, line_inputs

        def persist_quote(rep, customer, status, lines, line_inputs, created, updated):
            risk = blended_risk(line_inputs, customer.tier.value)
            quote = Quotation(customer_id=customer.id, rep_id=rep.id, status=status,
                              blended_risk=risk.total_overage_pp, created_at=created, updated_at=updated)
            session.add(quote)
            session.commit()
            session.refresh(quote)
            for (prod, qty, disc) in lines:
                total = round(qty * prod.price * (1 - disc / 100.0), 2)
                session.add(QuotationLine(quotation_id=quote.id, product_id=prod.id, quantity=qty,
                                          unit_price=prod.price, discount_percent=disc, line_total=total))
            session.commit()
            return quote

        # (c) ~120 CONFIRMED historical deals, ~40 per rep, backdated over ~180 days.
        confirmed = 0
        for email, (mean, stdev) in _REP_PROFILE.items():
            rep = reps.get(email)
            if not rep:
                continue
            for _ in range(40):
                # Build a co-purchase basket around a weighted anchor.
                anchor = random.choice(_ANCHORS)
                basket = [anchor] if anchor in by_key else []
                for partner, prob in _COPURCHASE.get(anchor, []):
                    if partner in by_key and random.random() < prob and partner not in basket:
                        basket.append(partner)
                while len(basket) < 2:
                    k = random.choice(all_keys)
                    if k not in basket:
                        basket.append(k)
                basket = basket[:4]

                customer = random.choice(customers)
                created = now - timedelta(days=random.randint(5, 180), hours=random.randint(0, 23))
                lines, line_inputs = build_lines(basket, mean, stdev)
                persist_quote(rep, customer, QuoteStatus.CONFIRMED, lines, line_inputs, created, created)
                confirmed += 1

        # (d) Current "hero" deals for the dashboard: stalled and/or anomalous.
        gold = next((c for c in customers if c.tier == Tier.GOLD), customers[0])
        acme = next((c for c in customers if "Acme" in c.name), customers[0])
        sam = reps.get("sam@dealflow360.com")
        alex = reps.get("rep@dealflow360.com")
        rita = reps.get("rita@dealflow360.com")

        # Sam: PENDING + stalled 15 days + a deeply anomalous 32% router discount
        # (Sam's confirmed baseline is ~9%, so this line screams anomaly).
        if sam:
            r, s = by_key["router"], by_key["support"]
            lines = [(r, 4, 32.0), (s, 4, 30.0)]
            li = [LineInput(r.price, r.cost, r.discount_ceiling, 32.0, 4, str(r.id)),
                  LineInput(s.price, s.cost, s.discount_ceiling, 30.0, 4, str(s.id))]
            persist_quote(sam, gold, QuoteStatus.PENDING_APPROVAL, lines, li,
                          now - timedelta(days=15), now - timedelta(days=15))

        # Alex: DRAFT stalled 20 days, normal discounts (stalled but not anomalous).
        if alex:
            sw, rk = by_key["switch"], by_key["rack"]
            lines = [(sw, 2, 11.0), (rk, 2, 9.0)]
            li = [LineInput(sw.price, sw.cost, sw.discount_ceiling, 11.0, 2, str(sw.id)),
                  LineInput(rk.price, rk.cost, rk.discount_ceiling, 9.0, 2, str(rk.id))]
            persist_quote(alex, acme, QuoteStatus.DRAFT, lines, li,
                          now - timedelta(days=20), now - timedelta(days=20))

        # Rita: PENDING stalled 12 days, disciplined discounts.
        if rita:
            sa, on = by_key["saas"], by_key["onboarding"]
            lines = [(sa, 25, 6.0), (on, 1, 7.0)]
            li = [LineInput(sa.price, sa.cost, sa.discount_ceiling, 6.0, 25, str(sa.id)),
                  LineInput(on.price, on.cost, on.discount_ceiling, 7.0, 1, str(on.id))]
            persist_quote(rita, acme, QuoteStatus.PENDING_APPROVAL, lines, li,
                          now - timedelta(days=12), now - timedelta(days=12))

        print(f"Seeded {confirmed} CONFIRMED historical deals + 3 current deals (1 anomalous, 3 stalled).")


if __name__ == "__main__":
    seed_demo_data()
