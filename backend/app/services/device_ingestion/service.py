from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import RawMeasurement, ProcessedResult, TestSession, Device
from app.schemas.schemas import MeasurementPayload
from app.services.calibration.engine import CalibrationEngine

class IngestionService:
    @staticmethod
    def ingest_payload(db: Session, payload: MeasurementPayload) -> Tuple[bool, Dict[str, Any]]:
        """
        Idempotently ingest a device measurement payload.
        Returns: (is_new, result_dict)
        """
        # 1. Idempotency check via unique message_id
        existing_raw = db.query(RawMeasurement).filter(RawMeasurement.message_id == payload.message_id).first()
        if existing_raw:
            existing_result = db.query(ProcessedResult).filter(ProcessedResult.test_id == payload.test_id).first()
            return False, {
                "message": "Duplicate reading acknowledged (idempotent no-op)",
                "message_id": existing_raw.message_id,
                "test_id": existing_raw.test_id,
                "parameter": payload.kit.parameter,
                "value_or_class": existing_result.value_or_class if existing_result else "Processed",
                "provenance": existing_result.provenance if existing_result else "Estimated",
                "validation_status": existing_result.validation_status if existing_result else "indicative_only"
            }

        # 2. Update device last seen
        device = db.query(Device).filter(Device.device_id == payload.device_id).first()
        if device:
            device.firmware_version = payload.firmware_version or device.firmware_version
            device.status = "online"
            db.add(device)

        # 3. Process optical calibration
        cal_output = CalibrationEngine.process_reading(
            parameter=payload.kit.parameter,
            sensor_data=payload.sensor.model_dump(),
            temperature_c=payload.temperature_c,
            calibration_version=payload.calibration_version or "ph-kit-agri-cal-1.0",
            repeat_readings=[r.model_dump() for r in (payload.repeat_readings or [])]
        )

        # 4. Save Raw Measurement (Immutable)
        raw_record = RawMeasurement(
            message_id=payload.message_id,
            test_id=payload.test_id,
            raw_channels=payload.sensor.model_dump(),
            repeat_readings=[r.model_dump() for r in (payload.repeat_readings or [])],
            temperature_c=payload.temperature_c,
            gain=payload.sensor.gain,
            integration_ms=payload.sensor.integration_ms,
            led_on=payload.sensor.led_on,
            quality_flags=cal_output.get("quality_flags", [])
        )
        db.add(raw_record)

        # 5. Save Processed Result
        processed_record = ProcessedResult(
            test_id=payload.test_id,
            parameter=cal_output.get("parameter", payload.kit.parameter),
            value_or_class=cal_output.get("value_or_class", "Pending"),
            unit=cal_output.get("unit", ""),
            interval=cal_output.get("interval", ""),
            provenance="Estimated",
            calibration_version=payload.calibration_version or "ph-kit-agri-cal-1.0",
            validation_status="indicative_only",
            is_lab_confirmed=False
        )
        db.add(processed_record)

        # 6. Update Test Session status if session exists
        session = db.query(TestSession).filter(TestSession.test_id == payload.test_id).first()
        if session:
            session.status = "COMPLETED"
            db.add(session)

        db.commit()
        db.refresh(processed_record)

        return True, {
            "message": "Measurement ingested and calibrated successfully",
            "message_id": raw_record.message_id,
            "test_id": processed_record.test_id,
            "parameter": processed_record.parameter,
            "value_or_class": processed_record.value_or_class,
            "unit": processed_record.unit,
            "interval": processed_record.interval,
            "provenance": processed_record.provenance,
            "calibration_version": processed_record.calibration_version,
            "validation_status": processed_record.validation_status,
            "quality_flags": raw_record.quality_flags
        }
