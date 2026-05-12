from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base

from sqlalchemy.orm import relationship
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)

    address = Column(String, nullable=False)
    city = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)
   

    #continuaar daqui