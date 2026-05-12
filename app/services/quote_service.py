from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.quote_model import Quote
from app.models.service_model import Service
from app.models.client_model import Client
from ..schemas.quote_schema import QuoteCreate

def calculate_refclean_price(vehicle_name: str, service_name: str, base_price: float):
    """
    Regra de Negócio Centralizada: Aqui é onde a mágica acontece.
    """
    v_nome = vehicle_name.lower()
    s_nome = service_name.lower()

    # REGRA: PACOTE INTERMEDIÁRIO
    if "intermediário" in s_nome:
        tabela = {"hatch": 450.0, "sedan": 470.0, "suv": 500.0, "4x4": 550.0}
        return tabela.get(v_nome, base_price)

    # REGRA: PACOTE PREMIUM
    if "premium" in s_nome:
        tabela = {"hatch": 600.0, "sedan": 650.0, "suv": 700.0, "4x4": 750.0}
        return tabela.get(v_nome, base_price)

    return base_price

def create_quote(db: Session, quote: QuoteCreate):
    # 1. Verifica o Cliente
    client = db.query(Client).filter(Client.id == quote.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # 2. Busca os serviços selecionados
    services = db.query(Service).filter(Service.id.in_(quote.service_ids)).all()
    if not services:
        raise HTTPException(status_code=404, detail="Services not found")

    total_price = 0.0
    
    # Identifica o veículo e separa serviços de extras
    veiculo = next((s for s in services if s.type == "vehicle"), None)
    servicos_limpeza = [s for s in services if s.type == "service_vehicle"]
    extras = [s for s in services if s.type == "additional"]

    if not veiculo:
        raise HTTPException(status_code=400, detail="Selecione um tipo de veículo primeiro")

    # 3. Lógica de Cálculo
    possui_pacote_fechado = False
    
    for s in servicos_limpeza:
        preco_calculado = calculate_refclean_price(veiculo.name, s.name, s.price)
        
        if "premium" in s.name.lower() or "intermediário" in s.name.lower():
            total_price += preco_calculado
            possui_pacote_fechado = True
        else:
            # Detalhada Pro ou outros: Soma Veículo + Serviço
            total_price += veiculo.price + preco_calculado

    # Extras só somam se não for pacote Premium/Intermediário
    if not possui_pacote_fechado:
        total_price += sum(e.price for e in extras)

    # 4. Salva no Banco
    new_quote = Quote(
        client_id=quote.client_id,
        total_price=total_price
    )

    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)
    return new_quote

# --- FUNÇÕES QUE ESTAVAM FALTANDO (Para resolver o ImportError) ---

def get_quotes(db: Session):
    """Retorna todos os orçamentos."""
    return db.query(Quote).all()

def get_quote_by_id(db: Session, quote_id: int):
    """Busca um orçamento pelo ID."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote

def get_client_quotes(db: Session, client_id: int):
    """Retorna todos os orçamentos de um cliente específico."""
    return db.query(Quote).filter(Quote.client_id == client_id).all()
