"""Baseline schema for DealFlow360.

Adopts Alembic onto the existing SQLModel (model-first) project. Rather than
hand-transcribing every column, this baseline builds the schema directly from
``SQLModel.metadata`` so it can never drift from the models. Once applied, the
database matches the models exactly and subsequent changes can be produced with
``alembic revision --autogenerate -m "<change>"``.

Tables created: user, customer, product, quotation, quotationline,
quotationversion, approvalrequest, auditlog, warehouse, stockinventory,
portalnegotiation, subscriptionplan.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-09-05
"""
from typing import Sequence, Union

from alembic import op
from sqlmodel import SQLModel

import app.models  # noqa: F401  (registers every table on SQLModel.metadata)

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    SQLModel.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    SQLModel.metadata.drop_all(bind=op.get_bind())
