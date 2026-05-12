from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    address: str
    city: str


class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[EmailStr]
    address: str
    city: str
    created_at: datetime

    class Config:
      from_attributes = True