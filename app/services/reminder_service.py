from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.appointment_model import Appointment


def check_reminders(db: Session):
    now = datetime.now()
    target_time = now + timedelta(minutes=1)

    # margem de erro de alguns minutos
    start = target_time - timedelta(minutes=2)
    end = target_time + timedelta(minutes=2)

    appointments = db.query(Appointment).filter(
        Appointment.start_time >= start,
        Appointment.start_time <= end,
        Appointment.reminder_sent == False
    ).all()

    for appt in appointments:
        appt.reminder_sent = True

    db.commit()