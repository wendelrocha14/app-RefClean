from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta, time

from app.models.appointment_model import Appointment
from app.schemas.appointment_schema import AppointmentCreate
from app.services.duration_service import calcular_duracao_total
from app.models.service_model import Service
from app.config import ADMIN_ADDRESS


def create_appointment(db: Session, appointment: AppointmentCreate):

    start_time = appointment.scheduled_date
    weekday = start_time.weekday()

    # 🔒 DOMINGO BLOQUEADO
    if weekday == 6:
        raise HTTPException(
            status_code=400,
            detail="Domingo não possui agendamentos"
        )

    # 🔒 SEGUNDA A SEXTA SOMENTE 18:00
    if weekday < 5:
        if start_time.hour != 18 or start_time.minute != 0:
            raise HTTPException(
                status_code=400,
                detail="Segunda a sexta apenas às 18:00"
            )

    # 🔥 BUSCA SERVIÇO
    service = db.query(Service).filter(
        Service.id == appointment.service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado"
        )

    # 🔥 IDENTIFICA REF CLEAN
    is_at_refclean = (
        service.type == "combo"
        or service.type == "veiculo"
        or "premium" in service.name.lower()
        or "intermediário" in service.name.lower()
    )

    # 🔥 ENDEREÇO
    if is_at_refclean:
        full_address = "Campo Vicente, Bellmont, N: 1414"
    else:
        full_address = (
            appointment.address
            or "Endereço não informado"
        )

    quantity = appointment.quantity or 1

    # 🔥 VALOR
    valor_total_final = (
        appointment.valor_total
        if appointment.valor_total > 0
        else (service.price * quantity)
    )

    # 🔥 DURAÇÃO
    duracao_base = calcular_duracao_total(
        service,
        quantity
    )

    deslocamento = 0 if is_at_refclean else 30

    duracao_total = duracao_base + deslocamento

    end_time = start_time + timedelta(
        minutes=duracao_total
    )

    # 🔥 AGENDAMENTOS DO DIA
    agendamentos_dia = db.query(Appointment).filter(
        Appointment.scheduled_date >= start_time.replace(
            hour=0,
            minute=0,
            second=0
        ),
        Appointment.scheduled_date <= start_time.replace(
            hour=23,
            minute=59,
            second=59
        )
    ).all()

    # 🔒 REGRAS PREMIUM / INTERMEDIÁRIO
    if weekday == 5:

        is_premium_novo = (
            "premium" in service.name.lower()
            or "intermediário" in service.name.lower()
        )

        for ag in agendamentos_dia:

            # Já existe premium
            if (
                ag.service_name
                and (
                    "premium" in ag.service_name.lower()
                    or "intermediário" in ag.service_name.lower()
                )
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Sábado indisponível: Já existe um Premium agendado"
                )

            # Novo premium exige sábado livre
            if is_premium_novo and len(agendamentos_dia) > 0:
                raise HTTPException(
                    status_code=400,
                    detail="O serviço Premium exige o dia livre"
                )

    # 🔥 CONFLITO DE HORÁRIO
    for ag in agendamentos_dia:

        deslocamento_existente = 0 if (
            ag.service_name
            and (
                "premium" in ag.service_name.lower()
                or "intermediário" in ag.service_name.lower()
            )
        ) else 30

        # horário real liberado
        ag_end_real = ag.end_time + timedelta(
            minutes=deslocamento_existente
        )

        # conflito
        if (
            start_time < ag_end_real
            and end_time > ag.start_time
        ):
            raise HTTPException(
                status_code=400,
                detail="Este horário já está ocupado ou em conflito"
            )

    # 🔥 CRIA AGENDAMENTO
    new_appointment = Appointment(
        name=appointment.name,
        phone=appointment.phone,
        address=full_address,
        city=appointment.city or "Nova Hartz",
        service_id=service.id,
        service_name=service.name,
        quantity=quantity,
        valor_total=valor_total_final,
        scheduled_date=start_time,
        start_time=start_time,
        end_time=end_time
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


def get_all_appointments(db: Session):
    return db.query(Appointment).all()


def get_available_slots(
    db: Session,
    date_obj: datetime,
    service_query: str,
    quantity: int = 1
):

    weekday = date_obj.weekday()

    # 🔒 DOMINGO
    if weekday == 6:
        return []

    # 🔥 SÁBADO
    elif weekday == 5:

        horarios = []

        for h in range(7, 17):
            horarios.append(time(h, 0))
            horarios.append(time(h, 30))

        horarios = [
            h for h in horarios
            if h >= time(7, 30)
        ]

    # 🔥 SEGUNDA A SEXTA
    else:
        horarios = [time(18, 0)]

    # 🔥 BUSCA SERVIÇO
    service = db.query(Service).filter(
        Service.name.ilike(f"%{service_query}%")
    ).first()

    if not service and service_query.isdigit():

        service = db.query(Service).filter(
            Service.id == int(service_query)
        ).first()

    if not service:
        return [
            h.strftime("%H:%M")
            for h in horarios
        ]

    # 🔥 PREMIUM
    is_premium = (
        "premium" in service.name.lower()
        or "intermediário" in service.name.lower()
    )

    # premium só sábado
    if is_premium and weekday != 5:
        return []

    # 🔥 AGENDAMENTOS DO DIA
    agendamentos = db.query(Appointment).filter(
        Appointment.scheduled_date >= date_obj.replace(
            hour=0,
            minute=0,
            second=0
        ),
        Appointment.scheduled_date <= date_obj.replace(
            hour=23,
            minute=59,
            second=59
        )
    ).all()

    # 🔥 BLOQUEIO PREMIUM SÁBADO
    if weekday == 5:

        for ag in agendamentos:

            # já existe premium
            if (
                ag.service_name
                and (
                    "premium" in ag.service_name.lower()
                    or "intermediário" in ag.service_name.lower()
                )
            ):
                return []

            # novo premium exige sábado livre
            if is_premium and len(agendamentos) > 0:
                return []

    horarios_disponiveis = []

    # 🔥 DURAÇÃO NOVO SERVIÇO
    duracao_base = calcular_duracao_total(
        service,
        quantity
    )

    deslocamento = 0 if (
        service.type in ["combo", "veiculo"]
        or is_premium
    ) else 30

    duracao_total = duracao_base + deslocamento

    # 🔥 VERIFICA HORÁRIOS
    for horario in horarios:

        start = datetime.combine(
            date_obj.date(),
            horario
        )

        end_test = start + timedelta(
            minutes=duracao_total
        )

        conflito = False

        for ag in agendamentos:

            deslocamento_existente = 0 if (
                ag.service_name
                and (
                    "premium" in ag.service_name.lower()
                    or "intermediário" in ag.service_name.lower()
                )
            ) else 30

            # horário real que libera
            ag_end_real = ag.end_time + timedelta(
                minutes=deslocamento_existente
            )

            # conflito real
            if (
                start < ag_end_real
                and end_test > ag.start_time
            ):
                conflito = True
                break

        if not conflito:
            horarios_disponiveis.append(
                horario.strftime("%H:%M")
            )

    return horarios_disponiveis


def delete_appointment(
    db: Session,
    appointment_id: int
):

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado"
        )

    db.delete(appointment)
    db.commit()

    return {
        "message": "Agendamento cancelado com sucesso"
    }