from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.models import FarmPlot
from app.schemas.schemas import (
    CropRecommendationRequest, CropRecommendationResponse,
    ProfitCalculationRequest, ProfitCalculationResponse
)
from app.services.recommendations.rules import RecommendationEngine

router = APIRouter()

@router.post("/recommendations/crops", response_model=CropRecommendationResponse)
def get_crop_recommendations(req: CropRecommendationRequest, db: Session = Depends(get_db)):
    plot = db.query(FarmPlot).filter(FarmPlot.plot_id == req.plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Farm plot not found")

    # In prototype, baseline pH is 6.8 with Medium NPK
    ph_val = 6.8
    npk_dict = {"N": "Medium", "P": "Medium", "K": "High"}

    items = RecommendationEngine.get_crop_recommendations(
        plot_label=plot.label,
        ph_val=ph_val,
        npk=npk_dict,
        season=req.season,
        water_availability=req.water_availability
    )

    return CropRecommendationResponse(
        plot_id=plot.plot_id,
        plot_label=plot.label,
        soil_ph=str(ph_val),
        soil_npk=npk_dict,
        recommendations=items,
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.post("/calculators/profit", response_model=ProfitCalculationResponse)
def compute_profit(req: ProfitCalculationRequest):
    return RecommendationEngine.calculate_profit(req)
