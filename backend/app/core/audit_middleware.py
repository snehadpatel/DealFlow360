"""Pure ASGI middleware that captures the request actor + client IP into
ContextVars so the SQLAlchemy audit listener can record *who* and *from where*.

Why pure ASGI (not BaseHTTPMiddleware or a dependency): most endpoints in this
app are sync `def`, which FastAPI runs via `run_in_threadpool`. anyio wraps each
threadpool dispatch in its own `copy_context()`, so ContextVars set inside a sync
dependency (or a BaseHTTPMiddleware, which also runs in a separate context) are
discarded before the ORM flush that the audit listener hooks. A pure ASGI
middleware sets the vars in the same outer context the endpoint executes within,
so the flush sees them. We reset() per request so nothing leaks across reused
threadpool threads.
"""
from uuid import UUID

from jose import jwt

from app.core.config import settings
from app.core.context import current_user_id, client_ip


def _extract_ip(scope) -> str | None:
    # Prefer the first hop of X-Forwarded-For when behind a proxy.
    for name, value in scope.get("headers", []):
        if name == b"x-forwarded-for":
            forwarded = value.decode("latin-1").split(",")[0].strip()
            if forwarded:
                return forwarded
    client = scope.get("client")
    if client:
        return client[0]
    return None


def _extract_user_id(scope) -> UUID | None:
    for name, value in scope.get("headers", []):
        if name == b"authorization":
            header = value.decode("latin-1")
            if header.lower().startswith("bearer "):
                token = header[7:].strip()
                try:
                    payload = jwt.decode(
                        token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
                    )
                    subject = payload.get("sub")
                    if subject:
                        return UUID(str(subject))
                except Exception:
                    # Invalid/expired token — auth is still enforced by
                    # get_current_user; we just skip actor capture here.
                    return None
            return None
    return None


class AuditContextMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        ip_token = client_ip.set(_extract_ip(scope))
        user_token = current_user_id.set(_extract_user_id(scope))
        try:
            await self.app(scope, receive, send)
        finally:
            current_user_id.reset(user_token)
            client_ip.reset(ip_token)
