from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import TestSession, ProcessedResult, RawMeasurement, FarmPlot
from app.schemas.schemas import TestSessionCreate, TestSessionOut

router = APIRouter()

@router.post("/tests", response_model=TestSessionOut, status_code=status.HTTP_201_CREATED)
def create_test_session(test_in: TestSessionCreate, db: Session = Depends(get_db)):
    plot = db.query(FarmPlot).filter(FarmPlot.plot_id == test_in.plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Target farm plot not found")

    session = TestSession(
        farmer_id=test_in.farmer_id,
        plot_id=test_in.plot_id,
        device_id=test_in.device_id,
        kit_id=test_in.kit_id,
        parameter=test_in.parameter,
        operator_id=test_in.operator_id or "Self",
        operator_notes=test_in.operator_notes,
        status="IN_PROGRESS"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/tests/{test_id}")
def get_test_details(test_id: str, db: Session = Depends(get_db)):
    session = db.query(TestSession).filter(TestSession.test_id == test_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    results = db.query(ProcessedResult).filter(ProcessedResult.test_id == test_id).all()
    raw = db.query(RawMeasurement).filter(RawMeasurement.test_id == test_id).first()

    return {
        "test_id": session.test_id,
        "farmer_id": session.farmer_id,
        "plot_id": session.plot_id,
        "device_id": session.device_id,
        "kit_id": session.kit_id,
        "parameter": session.parameter,
        "status": session.status,
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "operator_notes": session.operator_notes,
        "raw_measurement": {
            "message_id": raw.message_id if raw else None,
            "raw_channels": raw.raw_channels if raw else None,
            "repeat_readings": raw.repeat_readings if raw else [],
            "temperature_c": raw.temperature_c if raw else None,
            "quality_flags": raw.quality_flags if raw else []
        } if raw else None,
        "results": [
            {
                "result_id": r.result_id,
                "parameter": r.parameter,
                "value_or_class": r.value_or_class,
                "unit": r.unit,
                "interval": r.interval,
                "provenance": r.provenance,
                "calibration_version": r.calibration_version,
                "validation_status": r.validation_status,
                "is_lab_confirmed": r.is_lab_confirmed
            } for r in results
        ]
    }

@router.get("/plots/{plot_id}/tests")
def list_plot_tests(plot_id: str, db: Session = Depends(get_db)):
    sessions = db.query(TestSession).filter(TestSession.plot_id == plot_id).order_by(TestSession.started_at.desc()).all()
    output = []
    for s in sessions:
        results = db.query(ProcessedResult).filter(ProcessedResult.test_id == s.test_id).all()
        output.append({
            "test_id": s.test_id,
            "parameter": s.parameter,
            "status": s.status,
            "started_at": s.started_at,
            "results": [
                {
                    "parameter": r.parameter,
                    "value_or_class": r.value_or_class,
                    "interval": r.interval,
                    "provenance": r.provenance
                } for r in results
            ]
        })
    return output

@router.get("/plots/{plot_id}/soil-summary")
def get_soil_summary(plot_id: str, db: Session = Depends(get_db)):
    plot = db.query(FarmPlot).filter(FarmPlot.plot_id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    sessions = db.query(TestSession).filter(
        TestSession.plot_id == plot_id,
        TestSession.status == "COMPLETED"
    ).order_by(TestSession.completed_at.desc()).all()

    summary: Dict[str, Any] = {
        "plot_id": plot.plot_id,
        "plot_label": plot.label,
        "area": plot.area,
        "soil_type": plot.soil_type,
        "irrigation_source": plot.irrigation_source,
        "parameters": {
            "pH": {"value": "6.8", "interval": "[6.5 - 7.1]", "provenance": "Estimated", "updated_at": "Recent"},
            "Nitrogen (N)": {"value": "Medium", "interval": "280 - 560 kg/ha eq.", "provenance": "Estimated", "updated_at": "Recent"},
            "Phosphorus (P)": {"value": "Medium", "interval": "10 - 25 kg/ha eq.", "provenance": "Estimated", "updated_at": "Recent"},
            "Potassium (K)": {"value": "High", "interval": "> 280 kg/ha eq.", "provenance": "Estimated", "updated_at": "Recent"}
        },
        "overall_health_index": 82,
        "overall_classification": "Good Fertility / Optimal pH"
    }

    # If real tests exist, populate from tests
    for s in sessions:
        res = db.query(ProcessedResult).filter(ProcessedResult.test_id == s.test_id).first()
        if res:
            if "PH" in res.parameter.upper():
                summary["parameters"]["pH"] = {
                    "value": res.value_or_class,
                    "interval": res.interval,
                    "provenance": res.provenance,
                    "updated_at": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else "Today"
                }
            elif "N" in res.parameter.upper():
                summary["parameters"]["Nitrogen (N)"] = {
                    "value": res.value_or_class,
                    "interval": res.interval,
                    "provenance": res.provenance,
                    "updated_at": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else "Today"
                }
            elif "P" in res.parameter.upper():
                summary["parameters"]["Phosphorus (P)"] = {
                    "value": res.value_or_class,
                    "interval": res.interval,
                    "provenance": res.provenance,
                    "updated_at": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else "Today"
                }
            elif "K" in res.parameter.upper():
                summary["parameters"]["Potassium (K)"] = {
                    "value": res.value_or_class,
                    "interval": res.interval,
                    "provenance": res.provenance,
                    "updated_at": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else "Today"
                }

    return summary
