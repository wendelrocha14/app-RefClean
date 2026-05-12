from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    # 👤 Cliente
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    # Ajustado para 'address' para receber o endereço completo (Rua, Bairro, Número)
    address = Column(String, nullable=False)
    city = Column(String, default="Campo Vicente")

    # 🛠️ Serviço
    # Adicionei service_name para facilitar a busca de "Premium" na lógica de horários
    service_name = Column(String, nullable=True) 
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    service = relationship("Service")

    quantity = Column(Integer, default=1)
    valor_total = Column(Float, default=0)
    status = Column(String, default="pendente")

    # 🕒 Agendamento
    scheduled_date = Column(DateTime, nullable=False)
    # Mantive start e end para você calcular a duração (Serviço + 30min) no backend
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    # 📊 Controle
    created_at = Column(DateTime, default=datetime.utcnow)
    reminder_sent = Column(Boolean, default=False)
