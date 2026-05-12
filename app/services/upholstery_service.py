# app/services/upholstery_service.py

import unicodedata
from app.schemas.appointment_schema import AppointmentCreate


def normalize(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("ASCII").lower()


def calcular_servico_estofado(data: dict):
    """
    Calcula duração e preço de estofados
    """
    service = normalize(data.get("service_name", ""))
    quantidade = max(1, data.get("quantity", 1))
    
    

    # 🛋️ Serviços com preço e duração
    SERVICOS = {
        "sofa 2 lugares": {"duracao": 2, "preco": 120},
        "sofa 2 lugares retratil": {"duracao": 2.5, "preco": 150},
        "sofa 3 lugares": {"duracao": 3, "preco": 180},
        "sofa 3 lugares retratil": {"duracao": 3.5, "preco": 220},
        "colchao casal": {"duracao": 2, "preco": 130},
        "colchao solteiro": {"duracao": 1.5, "preco": 100},
        "poltrona": {"duracao": 1.5, "preco": 90}
    }

    total_preco = 0
    total_duracao = 0

    # 🪑 Itens por quantidade
    if "cadeira" in service:
        total_preco = 30 * quantidade
        total_duracao = (20 * quantidade) / 60

    elif "almofada" in service:
        total_preco = 15 * quantidade
        total_duracao = (20 * quantidade) / 60

    # 🛋️ Serviços fixos
    elif service in SERVICOS:
        total_preco = SERVICOS[service]["preco"]
        total_duracao = SERVICOS[service]["duracao"]

    else:
        raise ValueError("Serviço de estofado inválido")

    return {
        "preco": total_preco,
        "duracao": total_duracao,
        "bloqueia_dia": False  # estofado NÃO bloqueia dia inteiro
    }