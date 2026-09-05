"""Database seeding script for tiers, products, warehouses, plans, and demo users."""
from sqlmodel import Session, select
from app.db import init_db, engine
from app.models.user import User, Role
from app.models.customer import Customer, Tier
from app.models.product import Product
from app.models.warehouse import Warehouse, StockInventory
from app.models.subscription import SubscriptionPlan
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

    print("\\nAll seed data verified and ready!")

if __name__ == "__main__":
    seed_demo_data()
