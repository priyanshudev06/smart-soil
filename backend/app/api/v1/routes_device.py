from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Device
from app.schemas.schemas import MeasurementPayload
from app.services.device_ingestion.service import IngestionService

router = APIRouter()

@router.post("/device/measurements", status_code=status.HTTP_201_CREATED)
def receive_measurement(payload: MeasurementPayload, db: Session = Depends(get_db)):
    """
    Ingest raw optical spectral readings from ESP32 or BLE web bridge.
    Idempotent by unique message_id.
    """
    is_new, result = IngestionService.ingest_payload(db, payload)
    return result

@router.get("/devices/{device_id}")
def get_device_status(device_id: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {
        "device_id": device.device_id,
        "model": device.model,
        "firmware_version": device.firmware_version,
        "status": device.status,
        "battery_level": device.battery_level,
        "assigned_operator": device.assigned_operator,
        "last_seen_at": device.last_seen_at
    }

@router.get("/devices")
def list_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    return devices
