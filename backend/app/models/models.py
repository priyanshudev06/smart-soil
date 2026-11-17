import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Farmer(Base):
    __tablename__ = "farmers"

    farmer_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    pin = Column(String(10), default="1234") # demo/PIN auth
    role = Column(String(30), default="farmer") # farmer, operator, agronomist, admin
    preferred_language = Column(String(10), default="mr") # mr, hi, en
    state = Column(String(50), default="Maharashtra")
    district = Column(String(50), default="Pune")
    taluka = Column(String(50), default="Haveli")
    village = Column(String(50), default="Khadakwasla")
    consent_status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    plots = relationship("FarmPlot", back_populates="farmer", cascade="all, delete-orphan")
    test_sessions = relationship("TestSession", back_populates="farmer")

class FarmPlot(Base):
    __tablename__ = "farm_plots"

    plot_id = Column(String(36), primary_key=True, default=generate_uuid)
    farmer_id = Column(String(36), ForeignKey("farmers.farmer_id"), nullable=False, index=True)
    label = Column(String(100), nullable=False) # e.g. "North Field - Plot 1"
    area = Column(Float, nullable=False, default=1.5)
    area_unit = Column(String(20), default="Acres")
    soil_type = Column(String(50), default="Black Soil (Regur)")
    irrigation_source = Column(String(50), default="Drip / Borewell") # Rainfed, Canal, Drip, Well
    current_crop = Column(String(50), default="Soybean")
    previous_crop = Column(String(50), default="Wheat")
    created_at = Column(DateTime, default=utc_now)

    farmer = relationship("Farmer", back_populates="plots")
    test_sessions = relationship("TestSession", back_populates="plot")

class Device(Base):
    __tablename__ = "devices"

    device_id = Column(String(50), primary_key=True) # e.g. "soil-reader-001"
    model = Column(String(50), default="SmartSoil-ESP32-TCS34725")
    firmware_version = Column(String(30), default="1.0.0")
    status = Column(String(20), default="online") # online, offline, measuring
    battery_level = Column(Integer, default=92)
    assigned_operator = Column(String(100), default="Ramesh Patil")
    last_seen_at = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    test_sessions = relationship("TestSession", back_populates="device")

class Kit(Base):
    __tablename__ = "kits"

    kit_id = Column(String(50), primary_key=True) # e.g. "kit-agri-chem-4in1"
    brand = Column(String(100), default="AgriQuick Colorimetric")
    parameter = Column(String(20), nullable=False) # pH, N, P, K, 4in1
    chemistry = Column(String(100), default="Bromothymol Blue / Griess reagent")
    lot = Column(String(50), default="LOT-2026-NOV")
    expiry = Column(String(50), default="2027-12-31")
    instructions = Column(Text, default="Add 5g soil to 20ml distilled water, shake 2 min, apply 2 drops indicator to strip, wait 60s, insert strip in tray.")
    created_at = Column(DateTime, default=utc_now)

    test_sessions = relationship("TestSession", back_populates="kit")

class TestSession(Base):
    __tablename__ = "test_sessions"

    test_id = Column(String(36), primary_key=True, default=generate_uuid)
    farmer_id = Column(String(36), ForeignKey("farmers.farmer_id"), nullable=False, index=True)
    plot_id = Column(String(36), ForeignKey("farm_plots.plot_id"), nullable=False, index=True)
    device_id = Column(String(50), ForeignKey("devices.device_id"), nullable=True)
    kit_id = Column(String(50), ForeignKey("kits.kit_id"), nullable=True)
    parameter = Column(String(20), nullable=False, default="pH") # pH, N, P, K, 4in1
    operator_id = Column(String(100), default="Self")
    operator_notes = Column(Text, nullable=True)
    status = Column(String(20), default="COMPLETED") # IN_PROGRESS, COMPLETED, FAILED
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, default=utc_now)

    farmer = relationship("Farmer", back_populates="test_sessions")
    plot = relationship("FarmPlot", back_populates="test_sessions")
    device = relationship("Device", back_populates="test_sessions")
    kit = relationship("Kit", back_populates="test_sessions")
    
    raw_measurements = relationship("RawMeasurement", back_populates="test_session", cascade="all, delete-orphan")
    processed_results = relationship("ProcessedResult", back_populates="test_session", cascade="all, delete-orphan")

class RawMeasurement(Base):
    __tablename__ = "raw_measurements"

    message_id = Column(String(64), primary_key=True) # Hardware generated or UUID
    test_id = Column(String(36), ForeignKey("test_sessions.test_id"), nullable=False, index=True)
    raw_channels = Column(JSON, nullable=False) # {"r": 1200, "g": 980, "b": 650, "c": 2850}
    repeat_readings = Column(JSON, nullable=True) # [{"r": 1198, "g": 981, "b": 652, "c": 2848}]
    temperature_c = Column(Float, default=27.5)
    gain = Column(Integer, default=4)
    integration_ms = Column(Integer, default=154)
    led_on = Column(Boolean, default=True)
    quality_flags = Column(JSON, default=list) # ["none"] or ["optical_scatter_high"]
    received_at = Column(DateTime, default=utc_now)

    test_session = relationship("TestSession", back_populates="raw_measurements")

class ProcessedResult(Base):
    __tablename__ = "processed_results"

    result_id = Column(String(36), primary_key=True, default=generate_uuid)
    test_id = Column(String(36), ForeignKey("test_sessions.test_id"), nullable=False, index=True)
    parameter = Column(String(20), nullable=False) # pH, N, P, K
    value_or_class = Column(String(50), nullable=False) # "6.5" or "Medium"
    unit = Column(String(20), default="") # "pH", "class"
    interval = Column(String(50), default="") # "[6.2 - 6.8]" or "Medium (250-400 kg/ha equivalent)"
    provenance = Column(String(20), default="Estimated") # Measured, Estimated, Retrieved, Generated
    calibration_version = Column(String(50), default="ph-kit-agri-cal-1.0")
    validation_status = Column(String(30), default="indicative_only") # indicative_only, lab_verified
    is_lab_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    test_session = relationship("TestSession", back_populates="processed_results")

class Recommendation(Base):
    __tablename__ = "recommendations"

    rec_id = Column(String(36), primary_key=True, default=generate_uuid)
    plot_id = Column(String(36), ForeignKey("farm_plots.plot_id"), nullable=False, index=True)
    rec_type = Column(String(30), nullable=False) # crop_suitability, soil_improvement, fertilizer_warning
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    assumptions = Column(JSON, default=dict)
    sources = Column(JSON, default=list) # ["ICAR-IISS Bhopal", "KVK Pune Package of Practices"]
    rule_version = Column(String(30), default="icar-maharashtra-v1")
    created_at = Column(DateTime, default=utc_now)

class MarketPrice(Base):
    __tablename__ = "market_prices"

    price_id = Column(String(36), primary_key=True, default=generate_uuid)
    commodity = Column(String(50), nullable=False)
    market = Column(String(50), nullable=False)
    district = Column(String(50), default="Pune")
    state = Column(String(50), default="Maharashtra")
    min_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    unit = Column(String(20), default="₹/Quintal")
    observed_date = Column(String(20), default=lambda: datetime.now().strftime("%Y-%m-%d"))
    source = Column(String(50), default="AGMARKNET (agmarknet.gov.in)")
    freshness = Column(String(20), default="verified_current")
    updated_at = Column(DateTime, default=utc_now)

class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    forecast_id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(50), default="Pune")
    day_name = Column(String(20), nullable=False)
    date_str = Column(String(20), nullable=False)
    temp_max = Column(Float, nullable=False)
    temp_min = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)
    rainfall_probability = Column(Integer, nullable=False)
    condition = Column(String(50), default="Sunny / Partly Cloudy")
    advisory = Column(Text, default="Good conditions for soil sampling and intercultural operations.")
    source = Column(String(50), default="IMD Gramin Krishi Mausam Sewa")
    updated_at = Column(DateTime, default=utc_now)
