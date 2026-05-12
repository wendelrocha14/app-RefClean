from pydantic import BaseModel
from datetime import datetime


class QuoteCreate(BaseModel):
    client_id: int
    service_id: int
    estimated_price: float


class QuoteResponse(BaseModel):
    id: int
    client_id: int
    service_id: int
    estimated_price: float
    created_at: datetime

    class Config:
        from_attributes = True