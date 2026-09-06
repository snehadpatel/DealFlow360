#!/usr/bin/env python3
"""Frontend↔Backend API contract check.

Verifies every endpoint the React frontend calls (`apiClient.<verb>('/path')`)
resolves to a real FastAPI route. This is how we check that the two halves of
DealFlow360 actually talk to each other — run it after touching either side.

Usage (from backend/):
    PYTHONPATH="$PWD" python3 scripts/check_api_contract.py

Exit code 0 = every live frontend call maps to a backend route.
Exit code 1 = at least one frontend call has no matching backend route.

Path params are normalised: `${id}` / `{id}` both become `:P`, query strings and
trailing slashes are stripped, and the `/api` proxy prefix (Vite rewrites
`/api`→``) is treated as equivalent to the bare path.
"""
import glob
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
REPO = os.path.dirname(BACKEND)
FRONTEND_SRC = os.path.join(REPO, "frontend", "src")

CALL_RE = re.compile(r"""apiClient\.(get|post|put|delete|patch)\(\s*[`"']([^`"')]+)""")


def normalise(path: str) -> str:
    path = path.split("?")[0]
    path = re.sub(r"\$\{[^}]+\}", ":P", path)   # ${id}
    path = re.sub(r"\{[^}]+\}", ":P", path)      # {id}
    path = path.rstrip("/")
    if path.startswith("/api/"):
        path = path[4:]                          # Vite strips the /api prefix
    elif path == "/api":
        path = "/"
    return path or "/"


def backend_routes() -> set:
    from app.main import app
    schema = app.openapi()
    routes = set()
    for path, item in schema["paths"].items():
        for method in item:
            if method.lower() in ("head", "options", "parameters"):
                continue
            routes.add((method.upper(), normalise(path)))
    return routes


def frontend_calls() -> list:
    calls = []
    for f in glob.glob(os.path.join(FRONTEND_SRC, "**", "*.*"), recursive=True):
        if not f.endswith((".js", ".ts", ".jsx", ".tsx")):
            continue
        try:
            txt = open(f).read()
        except OSError:
            continue
        rel = os.path.relpath(f, REPO)
        for m in CALL_RE.finditer(txt):
            calls.append((m.group(1).upper(), m.group(2), rel))
    return calls


def main() -> int:
    backend = backend_routes()
    calls = frontend_calls()

    matched, missing = 0, []
    for verb, raw, f in calls:
        if (verb, normalise(raw)) in backend:
            matched += 1
        else:
            missing.append((verb, raw, f))

    print(f"Backend routes : {len(backend)}")
    print(f"Frontend calls : {len(calls)}")
    print(f"Matched        : {matched}")
    print(f"Unmatched      : {len(missing)}")

    if missing:
        print("\nUNMATCHED frontend calls (no backend route):")
        for verb, raw, f in sorted(missing):
            print(f"  {verb:6} {raw:48} [{f}]")
        return 1

    print("\nAll frontend calls resolve to a real backend route. Contract OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
