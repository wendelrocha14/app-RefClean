from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# Importando os novos schemas de cálculo
from app.schemas.service_schema import (
    ServiceCreate, 
    ServiceResponse, 
    ServiceCalculateRequest, 
    ServiceCalculateResponse
)
# Importando a nova função de cálculo
from app.services.service_service import (
    create_service,
    get_all_services,
    get_service_by_id,
    update_service,
    calculate_service_total
)

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceResponse)
def create_new_service(service: ServiceCreate, db: Session = Depends(get_db)):
    return create_service(db, service)

@router.get("/", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return get_all_services(db)

# 🔥 ROTA DE CÁLCULO SEGURO AJUSTADA
@router.post("/calculate", response_model=ServiceCalculateResponse)
def calculate_price(request: ServiceCalculateRequest, db: Session = Depends(get_db)):
    """
    Endpoint para validar o preço total no back-end.
    """
    return calculate_service_total(
        db, 
        vehicle_name=request.vehicle_name, 
        service_name=request.service_name,
        quantity=request.quantity, # 👈 AGORA O BACK-END LÊ A QUANTIDADE
        extra_names=request.extra_names
    )

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    return get_service_by_id(db, service_id)

@router.put("/{service_id}", response_model=ServiceResponse)
def update_existing_service(service_id: int, service: ServiceCreate, db: Session = Depends(get_db)):
    """
    Rota para o ADM atualizar preços e nomes dos serviços.
    """
    return update_service(db, service_id, service)
