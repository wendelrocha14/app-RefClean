# app/services/service_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional

from app.models.service_model import Service
from app.schemas.service_schema import ServiceCreate

# --- FUNÇÕES DE CÁLCULO E REGRA DE NEGÓCIO ---

def calculate_service_total(db: Session, vehicle_name: Optional[str], service_name: str, quantity: int = 1, extra_names: List[str] = []):
    """
    Calcula o valor total seguindo as regras do Wendel:
    - Veículos (Pacotes): Preço dinâmico por tipo de veículo.
    - Cadeiras/Almofadas: Preço unitário x quantidade + desconto de 10% (6+ cadeiras).
    - Geral: Soma base do banco.
    """
    
    # 1. TABELA DE PACOTES (VEÍCULOS)
    PRECOS_PACOTES = {
        "Pacote Intermediário": {"Hatch": 450.0, "Sedan": 470.0, "SUV": 500.0, "4x4": 550.0},
        "Pacote Premium": {"Hatch": 600.0, "Sedan": 650.0, "SUV": 700.0, "4x4": 750.0}
    }

    # 2. Busca o serviço principal no banco
    main_service_db = db.query(Service).filter(Service.name == service_name).first()

    if not main_service_db:
        raise HTTPException(status_code=404, detail=f"Serviço '{service_name}' não encontrado no banco.")

    total = 0.0

    # --- APLICAÇÃO DAS REGRAS ---

    # REGRA A: PACOTES VEÍCULOS
    if service_name in PRECOS_PACOTES:
        total = PRECOS_PACOTES[service_name].get(vehicle_name, main_service_db.price)
    
    # REGRA B: CADEIRAS (DESCONTO 10% PARA 6 OU MAIS)
    elif "Cadeira" in service_name:
        total = (main_service_db.price * quantity)
        if quantity >= 6:
            total = total * 0.9
            
    # REGRA C: DETALHADA PRO (SOMA VEÍCULO + SERVIÇO + EXTRAS)
    elif service_name == "Detalhada Pro":
        vehicle_db = db.query(Service).filter(Service.name == vehicle_name, Service.type == "vehicle").first()
        base_v = vehicle_db.price if vehicle_db else 0
        total = base_v + main_service_db.price
        if extra_names:
            extras_db = db.query(Service).filter(Service.name.in_(extra_names)).all()
            total += sum([e.price for e in extras_db])

    # REGRA D: DEMAIS ESTOFADOS E SERVIÇOS (Preço Unitário x Quantidade)
    else:
        total = main_service_db.price * quantity

    return {
        "vehicle": vehicle_name,
        "service": service_name,
        "quantity": quantity,
        "total_price": round(total, 2),
        "duration_minutes": main_service_db.duration_minutes * quantity
    }


# --- FUNÇÕES DE CRUD (MANTIDAS EXATAMENTE IGUAIS) ---

def create_service(db: Session, service: ServiceCreate):
    new_service = Service(
        name=service.name,
        type=service.type,
        duration_minutes=service.duration_minutes,
        price=service.price
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

def get_service_by_id(db: Session, service_id: int):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return service

def get_all_services(db: Session):
    return db.query(Service).all()

def update_service(db: Session, service_id: int, service_data: ServiceCreate):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    service.name = service_data.name
    service.type = service_data.type
    service.duration_minutes = service_data.duration_minutes
    service.price = service_data.price

    db.commit()
    db.refresh(service)
    return service

def delete_service(db: Session, service_id: int):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    db.delete(service)
    db.commit()
    return {"message": "Serviço deletado com sucesso"}
