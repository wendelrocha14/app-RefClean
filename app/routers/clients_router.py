from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.client_schema import ClientCreate, ClientResponse
from app.services.client_service import create_client, get_all_clients

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)

# 🔥 Criar cliente
@router.post("/", response_model=ClientResponse)
def create_new_client(client: ClientCreate, db: Session = Depends(get_db)):
    return create_client(db, client)

# 🔥 Listar clientes
@router.get("/", response_model=list[ClientResponse])
def list_clients(db: Session = Depends(get_db)):
    return get_all_clients(db)

# 🔥 Teste opcional
@router.get("/test")
def test_clients():
    return {"message": "Clients router funcionando!"}