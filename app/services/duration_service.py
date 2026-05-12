# services/duration_service.py

def calcular_duracao_total(service, quantity=1):
    """
    Calcula a duração total do serviço.

    Regras:
    - duration_minutes → duração base
    - multiplica pela quantidade (se houver)
    - +15 minutos fixos de deslocamento

    Retorna em MINUTOS (int)
    """

    base = service.duration_minutes or 0

    # 🟢 garante que quantity nunca seja None
    quantidade = quantity or 1

    # 🟢 cálculo total
    total_minutos = base * quantidade

    # 🚗 deslocamento fixo
    total_minutos += 15

    return total_minutos