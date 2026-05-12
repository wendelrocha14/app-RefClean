from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from datetime import datetime

from app.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(Integer, ForeignKey("clients.id"))

    service_id = Column(Integer, ForeignKey("services.id"))

    total_price = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)