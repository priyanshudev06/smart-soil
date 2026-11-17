from fastapi import APIRouter, Query
from app.services.external_data.service import ExternalDataService

router = APIRouter()

@router.get("/markets/prices")
def get_mandi_prices(district: str = Query("Pune", description="District for APMC mandi rates")):
    prices = ExternalDataService.get_mandi_prices(district=district)
    return {
        "status": "success",
        "district": district,
        "source": "AGMARKNET (Directorate of Marketing & Inspection, GoI)",
        "items": prices
    }

@router.get("/weather/forecast")
def get_weather(district: str = Query("Pune", description="District name")):
    forecast = ExternalDataService.get_weather_forecast(district=district)
    return {
        "status": "success",
        "district": district,
        "source": "IMD Gramin Krishi Mausam Sewa",
        "forecast": forecast
    }
