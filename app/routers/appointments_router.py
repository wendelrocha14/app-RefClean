from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import SessionLocal
from fastapi import Header
from app.models.appointment_model import Appointment
from app.schemas.appointment_schema import AppointmentCreate, AppointmentResponse
from app.services.appointment_service import (
    create_appointment,
    get_all_appointments,
    get_available_slots, 
    delete_appointment
)

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Criar novo agendamento
@router.post("/", response_model=AppointmentResponse)
def create_new_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        return create_appointment(db, appointment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Listar todos os agendamentos
@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(db: Session = Depends(get_db)):
    return get_all_appointments(db)

# Rota de Horários Disponíveis - AJUSTADO PARA PADRÃO SEMÂNTICO
@router.get("/available")
def available_slots(
    date: str,
    service: str = "",
    db: Session = Depends(get_db)
):
    try:
        data_consulta = datetime.strptime(date, "%Y-%m-%d")

        result = get_available_slots(db, data_consulta, service)

        # 🔥 ALTERAÇÃO AQUI: Mudado de 'ocupados' para 'disponiveis'
        if isinstance(result, list):
            return {
                "disponiveis": result,
                "bloqueado_dia": len(result) == 0
            }

        return result

    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    except Exception as e:
        print(f"Erro interno: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar horários")

@router.delete("/admin/agendamentos/{id}")
def cancelar_agendamento(
    id: int,
    db: Session = Depends(get_db),
    x_admin: str = Header(None, alias="x-admin")
):
    if x_admin != "1234":
        raise HTTPException(status_code=403, detail="Não autorizado")

    return delete_appointment(db, id)

@router.get("/admin/agendamentos")
def listar_agendamentos(
    db: Session = Depends(get_db),
    x_admin: str = Header(None, alias="x-admin")
):
    if x_admin != "1234":
        raise HTTPException(status_code=403, detail="Não autorizado")

    hoje = datetime.now()
    limite = hoje + timedelta(days=30)

    agendamentos = db.query(Appointment).filter(
        Appointment.scheduled_date >= hoje,
        Appointment.scheduled_date <= limite
    ).all()

    return agendamentos


@router.get("/admin/financeiro")
def financeiro(
    mes: int = None,
    db: Session = Depends(get_db),
    x_admin: str = Header(None, alias="x-admin")
):

    if x_admin != "1234":
        raise HTTPException(status_code=403, detail="Não autorizado")

    if mes is None:
        mes = datetime.now().month

    agendamentos = db.query(Appointment).all()

    total = 0
    quantidade = 0

    for a in agendamentos:
        if a.scheduled_date.month == mes:
            valor = float(getattr(a, 'valor_total', 0) or getattr(a, 'total_price', 0))
            total += valor
            quantidade += 1

    return {
        "total_mes": float(total),
        "quantidade_servicos": quantidade
    }