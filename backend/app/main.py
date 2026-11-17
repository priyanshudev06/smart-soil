from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.models.models import Farmer, FarmPlot, Device, Kit, TestSession, ProcessedResult, RawMeasurement
from app.api.v1.routes_device import router as device_router
from app.api.v1.routes_tests import router as tests_router
from app.api.v1.routes_farms import router as farms_router
from app.api.v1.routes_recommendations import router as rec_router
from app.api.v1.routes_markets import router as market_router
from app.api.v1.routes_assistant import router as assistant_router
from app.api.v1.routes_sync import router as sync_router

def seed_initial_data():
    """Seeds realistic default records for demo and testing"""
    db = SessionLocal()
    try:
        # Check if farmer exists
        farmer = db.query(Farmer).first()
        if not farmer:
            farmer = Farmer(
                farmer_id="farmer-001-dnyaneshwar",
                name="Dnyaneshwar Shinde",
                phone="9876543210",
                pin="1234",
                role="farmer",
                preferred_language="mr",
                state="Maharashtra",
                district="Pune",
                taluka="Haveli",
                village="Khadakwasla",
                consent_status=True
            )
            db.add(farmer)
            db.commit()

            # Add two realistic plots
            plot1 = FarmPlot(
                plot_id="plot-001-north-field",
                farmer_id=farmer.farmer_id,
                label="North Field (काळी माती - Black Soil)",
                area=2.5,
                area_unit="Acres",
                soil_type="Medium Deep Black Soil",
                irrigation_source="Borewell / Drip Irrigation",
                current_crop="Soybean",
                previous_crop="Wheat"
            )
            plot2 = FarmPlot(
                plot_id="plot-002-south-terrace",
                farmer_id=farmer.farmer_id,
                label="South Terrace (तांबडी माती - Reddish Loam)",
                area=1.8,
                area_unit="Acres",
                soil_type="Reddish Loamy Soil",
                irrigation_source="Well / Canal",
                current_crop="Onion",
                previous_crop="Gram"
            )
            db.add(plot1)
            db.add(plot2)
            db.commit()

            # Seed Hardware Device
            device = Device(
                device_id="soil-reader-001",
                model="SmartSoil ESP32-TCS34725 Spectro-Reader",
                firmware_version="1.0.0",
                status="online",
                battery_level=94,
                assigned_operator="Priyanshu (KVK Field Lead)"
            )
            db.add(device)

            # Seed Test Kit
            kit = Kit(
                kit_id="kit-agri-chem-4in1",
                brand="AgriQuick Diagnostic Rapid Soil Card",
                parameter="4in1",
                chemistry="Bromothymol Blue / Griess-Ilosvay Reagent",
                lot="LOT-2026-NOV-MH",
                expiry="2027-12-31"
            )
            db.add(kit)
            db.commit()

            # Seed an initial completed soil test session with results
            session = TestSession(
                test_id="test-demo-session-001",
                farmer_id=farmer.farmer_id,
                plot_id=plot1.plot_id,
                device_id=device.device_id,
                kit_id=kit.kit_id,
                parameter="pH",
                operator_id="Self",
                operator_notes="Pre-sowing rapid optical screening. Optical scatter within 2%.",
                status="COMPLETED"
            )
            db.add(session)
            db.commit()

            raw_read = RawMeasurement(
                message_id="msg-demo-init-001",
                test_id=session.test_id,
                raw_channels={"r": 1220, "g": 995, "b": 645, "c": 2860},
                repeat_readings=[{"r": 1218, "g": 996, "b": 646, "c": 2860}],
                temperature_c=27.5,
                gain=4,
                integration_ms=154,
                led_on=True,
                quality_flags=["none"]
            )
            db.add(raw_read)

            res1 = ProcessedResult(
                test_id=session.test_id,
                parameter="pH",
                value_or_class="6.8",
                unit="pH",
                interval="[6.5 - 7.1]",
                provenance="Estimated",
                calibration_version="ph-kit-agri-cal-1.0",
                validation_status="indicative_only"
            )
            res2 = ProcessedResult(
                test_id=session.test_id,
                parameter="Nitrogen (N)",
                value_or_class="Medium",
                unit="qualitative class",
                interval="Medium (280 - 560 kg/ha eq.)",
                provenance="Estimated",
                calibration_version="ph-kit-agri-cal-1.0",
                validation_status="indicative_only"
            )
            res3 = ProcessedResult(
                test_id=session.test_id,
                parameter="Phosphorus (P)",
                value_or_class="Medium",
                unit="qualitative class",
                interval="Medium (10 - 25 kg/ha eq.)",
                provenance="Estimated",
                calibration_version="ph-kit-agri-cal-1.0",
                validation_status="indicative_only"
            )
            res4 = ProcessedResult(
                test_id=session.test_id,
                parameter="Potassium (K)",
                value_or_class="High",
                unit="qualitative class",
                interval="High (> 280 kg/ha eq.)",
                provenance="Estimated",
                calibration_version="ph-kit-agri-cal-1.0",
                validation_status="indicative_only"
            )
            db.add_all([res1, res2, res3, res4])
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create SQLite tables & seed
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(device_router, prefix=settings.API_V1_STR, tags=["Device & Ingestion"])
app.include_router(tests_router, prefix=settings.API_V1_STR, tags=["Soil Tests & Reports"])
app.include_router(farms_router, prefix=settings.API_V1_STR, tags=["Farmers & Plots"])
app.include_router(rec_router, prefix=settings.API_V1_STR, tags=["Agronomic Decision Support"])
app.include_router(market_router, prefix=settings.API_V1_STR, tags=["Mandi & Weather"])
app.include_router(assistant_router, prefix=settings.API_V1_STR, tags=["AI Assistant"])
app.include_router(sync_router, prefix=settings.API_V1_STR, tags=["Offline Sync"])

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "SQLite (operational)"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Soil Health & Farming Assistant API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
