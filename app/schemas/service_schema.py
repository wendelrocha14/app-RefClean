# app/schemas/service_schema.py
from pydantic import BaseModel
from typing import List, Optional

# Esquema para criar um novo serviço (usado no POST /services)
class ServiceCreate(BaseModel):
    name: str
    type: str  # vehicle, service_vehicle, package, extra, sofa, cadeira, etc.
    price: float
    duration_minutes: float

# Esquema de resposta padrão para listagem e busca
class ServiceResponse(BaseModel):
    id: int
    name: str
    type: str
    price: float
    duration_minutes: float

    class Config:
        from_attributes = True

# --- NOVOS SCHEMAS PARA O CÁLCULO SEGURO ---

# O que o Front-end envia para o Back calcular
class ServiceCalculateRequest(BaseModel):
    vehicle_name: Optional[str] = None  # 👈 Agora é opcional para estofados
    service_name: str
    quantity: Optional[int] = 1        # 👈 NOVO: Para cadeiras e almofadas
    extra_names: Optional[List[str]] = []

# O que o Back-end responde após processar as regras de negócio
class ServiceCalculateResponse(BaseModel):
    vehicle: Optional[str] = None      # 👈 Ajustado para aceitar nulo
    service: str
    quantity: int                      # 👈 NOVO: Retorna a quantidade calculada
    total_price: float
    duration_minutes: float

    class Config:
        from_attributes = True
