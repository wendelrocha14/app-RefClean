from fastapi import FastAPI, Depends, HTTPException
from app.database import engine, Base, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.models import Service
from fastapi import Body

from app.routers.clients_router import router as clients_router
from app.routers.services_router import router as services_router
from app.routers.quotes_router import router as quotes_router
from app.routers.appointments_router import router as appointments_router

import app.models

app = FastAPI()

# 1. 🔥 CORS PRECISA VIR PRIMEIRO PARA LIBERAR O ACESSO AOS BOTÕES
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# 2. 🔥 SERVE ARQUIVOS ESTÁTICOS
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# 3. 🔥 ROTAS DAS PÁGINAS (HTML)
@app.get("/")
def home():
    return FileResponse("frontend/index.html")

@app.get("/vehicle")
def vehicle_page(): # Mudei o nome da função para não conflitar
    return FileResponse("frontend/vehicle.html")

@app.get("/estofado")
def estofado_page():
    return FileResponse("frontend/estofado.html")

@app.get("/admin")
def admin_page():
    return FileResponse("frontend/admin.html")

@app.get("/admin/home")
def admin_home():
    return FileResponse("frontend/admin_home.html")

# MUDEI AQUI: Esta é a página HTML de serviços
@app.get("/pagina-servicos")
def servicos_page():
    return FileResponse("frontend/servicos.html")

@app.get("/confirmar")
def confirmar_page():
    return FileResponse("frontend/confirmar.html")

@app.get("/ping")
def ping():
    return {"message": "pong"}


# 4. 🔥 ROUTERS DA API (OS DADOS QUE O BOTÃO BUSCA)
app.include_router(clients_router)
app.include_router(services_router) # Verifique se aqui dentro a rota é "/services"
app.include_router(quotes_router)
app.include_router(appointments_router)

# 5. 🔥 ROTA DE DELETE
@app.delete("/services/{service_id}")
async def delete_service(service_id: int, db: Session = Depends(get_db)):
    servico = db.query(Service).filter(Service.id == service_id).first()
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    db.delete(servico)
    db.commit()
    return {"message": f"Serviço {service_id} deletado com sucesso!"}

@app.post("/admin/login")
def admin_login(data: dict = Body(...)):
    senha = data.get("senha")

    if senha != "1234":
        raise HTTPException(status_code=401, detail="Senha inválida")

    return {"message": "Login autorizado"}
@app.get("/admin/financeiro")
def financeiro_page():
    return FileResponse("frontend/financeiro.html")

@app.get("/admin/agenda")
def agenda_page():
    return FileResponse("frontend/agenda.html")

@app.get("/admin/cancelamentos")
def cancelamentos_page():
    return FileResponse("frontend/confirmar.html")
