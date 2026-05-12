from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    name: str
    phone: str
    address: str  # Mudamos de 'street' para 'address' para receber o bloco completo
    city: Optional[str] = "Nova Hartz"
    scheduled_date: datetime  
    quantity: Optional[int] = 1
    service_id: Optional[int] = 1
    service_name: Optional[str] = ""
    valor_total: float # Adicionado aqui para o FastAPI aceitar o preço vindo do front

class AppointmentResponse(BaseModel):
    id: int
    name: str
    phone: str
    address: Optional[str]
    city: str
    service_name: Optional[str]
    valor_total: float 
    scheduled_date: datetime
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    quantity: Optional[int]
    created_at: datetime
    service_id: Optional[int]

    class Config:
        from_attributes = True
