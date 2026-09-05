import json
from sqlalchemy import event, inspect
from sqlmodel import Session
from app.models.audit import AuditLog
from app.core.context import current_user_id, client_ip

def _get_identity(mapper, connection, target):
    if target.__class__.__name__ == 'AuditLog':
        return None
    # Don't audit QuotationVersion either since it's an audit itself
    if target.__class__.__name__ == 'QuotationVersion':
        return None
    return {
        "entity_type": target.__class__.__name__,
        "entity_id": str(getattr(target, 'id', '')),
    }

def _log_change(mapper, connection, target, action: str, old_val: dict = None, new_val: dict = None):
    identity = _get_identity(mapper, connection, target)
    if not identity:
        return
        
    user_id = current_user_id.get()
    ip = client_ip.get()
    
    # We run an insert on the connection directly to avoid recursion
    audit_table = AuditLog.__table__
    
    # SQLAlchemy passes the db connection directly. We use it to insert.
    old_str = json.dumps(old_val, default=str) if old_val else None
    new_str = json.dumps(new_val, default=str) if new_val else None
    
    # Include quotation_id if applicable (for backward compatibility)
    quotation_id = None
    if identity["entity_type"] == "Quotation":
        quotation_id = target.id
    elif hasattr(target, "quotation_id"):
        quotation_id = getattr(target, "quotation_id", None)
        
    import uuid
    log_id = uuid.uuid4()
    
    connection.execute(
        audit_table.insert().values(
            id=log_id,
            user_id=user_id,
            quotation_id=quotation_id,
            action=action,
            entity_type=identity["entity_type"],
            entity_id=identity["entity_id"],
            old_value=old_str,
            new_value=new_str,
            ip_address=ip,
            details=f"System auto-audit: {action}"
        )
    )

def _get_state_dict(state, is_deleted=False):
    d = {}
    for attr in state.mapper.column_attrs:
        val = getattr(state.obj(), attr.key)
        d[attr.key] = val
    return d

def _get_changes(state):
    old = {}
    new = {}
    for attr in state.mapper.column_attrs:
        hist = state.attrs[attr.key].history
        if hist.has_changes():
            if hist.deleted:
                old[attr.key] = hist.deleted[0]
            if hist.added:
                new[attr.key] = hist.added[0]
    return old, new

def setup_audit_listeners(Base):
    @event.listens_for(Base, 'after_insert', propagate=True)
    def receive_after_insert(mapper, connection, target):
        state = inspect(target)
        new_val = _get_state_dict(state)
        _log_change(mapper, connection, target, "CREATE", old_val=None, new_val=new_val)

    @event.listens_for(Base, 'after_update', propagate=True)
    def receive_after_update(mapper, connection, target):
        state = inspect(target)
        old, new = _get_changes(state)
        if old or new:
            _log_change(mapper, connection, target, "UPDATE", old_val=old, new_val=new)

    @event.listens_for(Base, 'after_delete', propagate=True)
    def receive_after_delete(mapper, connection, target):
        state = inspect(target)
        old_val = _get_state_dict(state, is_deleted=True)
        _log_change(mapper, connection, target, "DELETE", old_val=old_val, new_val=None)
