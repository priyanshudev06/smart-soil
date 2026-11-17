from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.schemas.schemas import BatchSyncPayload
from app.services.device_ingestion.service import IngestionService

router = APIRouter()

@router.post("/sync/batch", status_code=status.HTTP_200_OK)
def sync_offline_batch(payload: BatchSyncPayload, db: Session = Depends(get_db)):
    """
    Synchronizes offline-queued device readings and tests idempotently.
    """
    accepted_messages = []
    duplicate_messages = []

    for item in payload.device_measurements:
        is_new, res = IngestionService.ingest_payload(db, item)
        if is_new:
            accepted_messages.append(item.message_id)
        else:
            duplicate_messages.append(item.message_id)

    return {
        "status": "synchronized",
        "synced_count": len(accepted_messages),
        "accepted_ids": accepted_messages,
        "duplicate_ids": duplicate_messages
    }
