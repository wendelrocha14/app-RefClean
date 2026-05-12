from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.service_model import Service
from app.services.duration_service import calcular_duracao_total


def calcular_servico_veiculo(db: Session, data: dict):
    """
    Calcula preço e duração baseado nas seleções do usuário.
    
    Regras:
    - Veículo é obrigatório (base do preço)
    - Combo soma ao valor (ex: premium +50)
    - Adicionais somam
    - Duração soma tudo (importante para agenda)
    """

    veiculo_id = data.get("veiculo_id")
    combo_id = data.get("combo_id")
    adicionais_ids = data.get("adicionais_ids", [])

    # 🔴 VALIDAÇÃO
    if not veiculo_id:
        raise HTTPException(status_code=400, detail="Veículo é obrigatório")

    # 🚗 VEÍCULO (base)
    veiculo = db.query(Service).filter(
        Service.id == veiculo_id,
        Service.type == "vehicle"
    ).first()

    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    total_preco = veiculo.price
    total_duracao = calcular_duracao_total(veiculo)

    # 📦 COMBO (SOMA)
    if combo_id:
        combo = db.query(Service).filter(
            Service.id == combo_id,
            Service.type == "combo"
        ).first()

        if not combo:
            raise HTTPException(status_code=404, detail="Combo não encontrado")

        total_preco += combo.price
        total_duracao += calcular_duracao_total(combo)

    # ➕ ADICIONAIS
    for adicional_id in adicionais_ids:
        adicional = db.query(Service).filter(
            Service.id == adicional_id,
            Service.type == "additional"
        ).first()

        if not adicional:
            raise HTTPException(
                status_code=404,
                detail=f"Adicional {adicional_id} não encontrado"
            )

        total_preco += adicional.price
        total_duracao += calcular_duracao_total(adicional)

    return {
        "preco": total_preco,
        "duracao": total_duracao,  # 🔥 ESSENCIAL pra agenda
        "bloqueia_dia": False
    }