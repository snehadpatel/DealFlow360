from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

from sqlalchemy import event

engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False, "timeout": 30}

engine = create_engine(settings.DATABASE_URL, **engine_args)

if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.close()

def init_db():
    from app.core.audit_listener import setup_audit_listeners
    # Ensure all models are registered with SQLModel.metadata
    import app.models.user
    import app.models.customer
    import app.models.product
    import app.models.warehouse
    import app.models.quotation
    import app.models.approval
    import app.models.order
    import app.models.invoice
    import app.models.subscription  # noqa: F401 (registers SubscriptionPlan, CustomerSubscription, BillingSchedule)
    import app.models.discount_rule
    import app.models.price_list
    import app.models.negotiation
    import app.models.portal
    import app.models.notification
    import app.models.audit
    setup_audit_listeners(SQLModel)
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
