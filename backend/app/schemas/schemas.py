from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Device & Ingestion Schemas (PRD Section 6.3) ---

class SensorChannels(BaseModel):
    r: int = Field(..., ge=0, le=65535, description="Red channel raw count")
    g: int = Field(..., ge=0, le=65535, description="Green channel raw count")
    b: int = Field(..., ge=0, le=65535, description="Blue channel raw count")
    c: int = Field(..., ge=0, le=65535, description="Clear channel raw count")

class SensorConfig(SensorChannels):
    model: str = "TCS34725"
    gain: int = 4
    integration_ms: int = 154
    led_on: bool = True

class KitInfo(BaseModel):
    kit_id: str
    lot: Optional[str] = "default-lot"
    parameter: str # pH, N, P, K, 4in1

class QualityFlags(BaseModel):
    reference_tile_check: Optional[str] = "pass"
    ambient_subtraction: Optional[str] = "pass"
    device_flag: Optional[str] = "none"

class MeasurementPayload(BaseModel):
    schema_version: str = "1.0"
    message_id: str
    device_id: str
    firmware_version: Optional[str] = "1.0.0"
    test_id: str
    kit: KitInfo
    captured_at: Optional[str] = None
    temperature_c: float = 27.5
    sensor: SensorConfig
    repeat_readings: Optional[List[SensorChannels]] = []
    quality: Optional[QualityFlags] = None
    calibration_version: Optional[str] = "ph-kit-agri-cal-1.0"

# --- Test Session Schemas ---

class TestSessionCreate(BaseModel):
    farmer_id: str
    plot_id: str
    device_id: Optional[str] = "soil-reader-001"
    kit_id: Optional[str] = "kit-agri-chem-4in1"
    parameter: str = "pH"
    operator_id: Optional[str] = "Self"
    operator_notes: Optional[str] = None

class ProcessedResultOut(BaseModel):
    result_id: str
    test_id: str
    parameter: str
    value_or_class: str
    unit: str
    interval: str
    provenance: str
    calibration_version: str
    validation_status: str
    is_lab_confirmed: bool

    class Config:
        from_attributes = True

class TestSessionOut(BaseModel):
    test_id: str
    farmer_id: str
    plot_id: str
    device_id: Optional[str]
    kit_id: Optional[str]
    parameter: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    operator_notes: Optional[str]
    processed_results: List[ProcessedResultOut] = []

    class Config:
        from_attributes = True

# --- Farmer & Plot Schemas ---

class PlotCreate(BaseModel):
    label: str
    area: float
    area_unit: str = "Acres"
    soil_type: str = "Black Soil (Regur)"
    irrigation_source: str = "Drip / Borewell"
    current_crop: Optional[str] = "Soybean"
    previous_crop: Optional[str] = "Wheat"

class PlotOut(PlotCreate):
    plot_id: str
    farmer_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FarmerCreate(BaseModel):
    name: str
    phone: str
    pin: Optional[str] = "1234"
    role: Optional[str] = "farmer"
    preferred_language: Optional[str] = "mr"
    district: Optional[str] = "Pune"
    village: Optional[str] = "Khadakwasla"

class FarmerOut(FarmerCreate):
    farmer_id: str
    consent_status: bool
    created_at: datetime
    plots: List[PlotOut] = []

    class Config:
        from_attributes = True

# --- Decision Support & Calculator Schemas ---

class CropRecommendationRequest(BaseModel):
    plot_id: str
    season: str = "Kharif" # Kharif, Rabi, Zaid
    water_availability: str = "Medium" # High, Medium, Low / Rainfed

class CropSuitabilityItem(BaseModel):
    crop_name: str
    crop_name_mr: str
    crop_name_hi: str
    suitability_score: int # 0 - 100
    category: str # "Highly Suitable", "Moderately Suitable", "Marginal"
    soil_compatibility: str
    season_duration: str
    water_needs: str
    estimated_yield_per_acre: str
    estimated_profit_range: str
    reasons: List[str]
    assumptions: str
    source: str

class CropRecommendationResponse(BaseModel):
    plot_id: str
    plot_label: str
    soil_ph: str
    soil_npk: Dict[str, str]
    recommendations: List[CropSuitabilityItem]
    generated_at: str

class ProfitCalculationRequest(BaseModel):
    crop_name: str
    land_area_acres: float
    expected_yield_quintal_per_acre: float
    mandi_modal_price_per_quintal: float
    seed_cost_per_acre: float
    fertilizer_manure_cost_per_acre: float
    labor_machinery_cost_per_acre: float
    irrigation_other_cost_per_acre: float

class ProfitCalculationResponse(BaseModel):
    total_yield_quintal: float
    gross_revenue: float
    total_input_cost: float
    net_profit: float
    break_even_yield_per_acre: float
    return_on_investment_pct: float
    assumptions_note: str

# --- Assistant & Sync Schemas ---

class AssistantQuery(BaseModel):
    farmer_id: Optional[str] = None
    plot_id: Optional[str] = None
    language: str = "mr" # mr, hi, en
    query: str

class AssistantResponse(BaseModel):
    response: str
    sources_cited: List[str]
    disclaimer: str
    provenance: str = "Generated (Grounded in ICAR/KVK references)"

class BatchSyncPayload(BaseModel):
    device_measurements: List[MeasurementPayload] = []
    created_tests: List[TestSessionCreate] = []
