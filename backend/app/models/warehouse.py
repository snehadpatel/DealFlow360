from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class Warehouse(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    location: str

class StockInventory(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    warehouse_id: UUID = Field(foreign_key="warehouse.id")
    product_id: UUID = Field(foreign_key="product.id")
    available_units: int = Field(default=0)
