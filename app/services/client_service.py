from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.client_model import Client
from app.schemas.client_schema import ClientCreate

def create_client(db: Session, client: ClientCreate):
    """
    Create a new client in the database.
    """
    new_client = Client(
        name=client.name,
        phone=client.phone,
        email=client.email,
        address=client.address,
        city=client.city
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return new_client


def get_client_by_id(db: Session, client_id: int):
    client = db.query(Client).filter(Client.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    return client


def get_all_clients(db: Session):
    return db.query(Client).all()


def update_client(db: Session, client_id: int, client_data: ClientCreate):
    client = db.query(Client).filter(Client.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    client.name = client_data.name
    client.phone = client_data.phone
    client.email = client_data.email
    client.address = client_data.address
    client.city = client_data.city

    db.commit()
    db.refresh(client)

    return client


def delete_client(db: Session, client_id: int):
    client = db.query(Client).filter(Client.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    db.delete(client)
    db.commit()

    return {"message": "Client deleted successfully"}