"""Database seeding script for tiers, products, warehouses, plans, and demo users."""
from app.db import init_db

def seed_demo_data():
    init_db()
    print("Database tables initialized and demo seed ready.")

if __name__ == "__main__":
    seed_demo_data()
