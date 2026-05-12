
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.quote_schema import QuoteCreate, QuoteResponse
from app.services.quote_service import create_quote, get_quotes

router = APIRouter(
    prefix="/quotes",
    tags=["Quotes"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=QuoteResponse)
def create_new_quote(quote: QuoteCreate, db: Session = Depends(get_db)):
    return create_quote(db, quote)


@router.get("/", response_model=list[QuoteResponse])
def list_quotes(db: Session = Depends(get_db)):
    return get_quotes(db)
