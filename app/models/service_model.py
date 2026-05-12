from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 🔥 NOVO
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    extra_time_minutes = Column(Integer, default=0)
    price_per_unit = Column(Float, nullable=True)