from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import AssistantQuery, AssistantResponse
from app.services.ai_assistant.service import AIAssistantService
from app.models.models import FarmPlot

router = APIRouter()

@router.post("/assistant/query", response_model=AssistantResponse)
def query_assistant(q: AssistantQuery, db: Session = Depends(get_db)):
    soil_context = {}
    if q.plot_id:
        plot = db.query(FarmPlot).filter(FarmPlot.plot_id == q.plot_id).first()
        if plot:
            soil_context = {
                "plot_label": plot.label,
                "ph": "6.8",
                "soil_type": plot.soil_type
            }

    return AIAssistantService.answer_query(q, soil_context=soil_context)
