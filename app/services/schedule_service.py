from datetime import datetime, timedelta

# 🕘 Horário de trabalho
HORA_INICIO = 8
HORA_FIM = 18

TEMPO_DESLOCAMENTO = 0.25  # 15 minutos em horas


def gerar_horarios_disponiveis(
    agendamentos: list,
    duracao_servico: float,
    tem_deslocamento: bool,
    data: datetime
):
    """
    Retorna lista de horários disponíveis no dia
    """

    horarios = []

    # segurança
    if not data:
        data = datetime.now()

    inicio_dia = data.replace(hour=HORA_INICIO, minute=0, second=0, microsecond=0)
    fim_dia = data.replace(hour=HORA_FIM, minute=0, second=0, microsecond=0)

    tempo_extra = TEMPO_DESLOCAMENTO if tem_deslocamento else 0
    duracao_total = timedelta(hours=duracao_servico + tempo_extra)

    horario_atual = inicio_dia

    while horario_atual + duracao_total <= fim_dia:

        conflito = False

        for ag in agendamentos:
            inicio_existente = ag.get("inicio")
            fim_existente = ag.get("fim")

            # ⚠️ ignora dados inválidos
            if not inicio_existente or not fim_existente:
                continue

            # verifica sobreposição
            if not (
                horario_atual + duracao_total <= inicio_existente
                or horario_atual >= fim_existente
            ):
                conflito = True
                break

        if not conflito:
            horarios.append(horario_atual.strftime("%H:%M"))

        # pula de 30 em 30 minutos
        horario_atual += timedelta(minutes=30)

    return horarios


def verificar_disponibilidade(
    agendamentos: list,
    duracao: float,
    bloqueia_dia: bool,
    tem_deslocamento: bool,
    data: datetime
):
    """
    Verifica se pode agendar ou se o dia está bloqueado
    """

    # 🚨 Se algum já bloqueou o dia
    for ag in agendamentos:
        if ag.get("bloqueia_dia"):
            return {
                "disponivel": False,
                "motivo": "Dia já bloqueado por outro serviço"
            }

    # 🚨 Se o novo serviço bloqueia o dia
    if bloqueia_dia:
        return {
            "disponivel": True,
            "bloquear_dia": True
        }

    # 🧠 Se for serviço normal → retorna horários livres
    horarios = gerar_horarios_disponiveis(
        agendamentos,
        duracao,
        tem_deslocamento,
        data
    )

    if not horarios:
        return {
            "disponivel": False,
            "motivo": "Sem horários disponíveis"
        }

    return {
        "disponivel": True,
        "horarios": horarios
    }