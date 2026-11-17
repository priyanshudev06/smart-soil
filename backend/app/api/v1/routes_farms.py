from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Farmer, FarmPlot
from app.schemas.schemas import FarmerCreate, FarmerOut, PlotCreate, PlotOut

router = APIRouter()

@router.get("/farmers", response_model=List[FarmerOut])
def list_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return farmers

@router.post("/farmers", response_model=FarmerOut, status_code=status.HTTP_201_CREATED)
def create_farmer(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    existing = db.query(Farmer).filter(Farmer.phone == farmer_in.phone).first()
    if existing:
        return existing

    farmer = Farmer(
        name=farmer_in.name,
        phone=farmer_in.phone,
        pin=farmer_in.pin or "1234",
        role=farmer_in.role or "farmer",
        preferred_language=farmer_in.preferred_language or "mr",
        district=farmer_in.district or "Pune",
        village=farmer_in.village or "Khadakwasla"
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/farmers/{farmer_id}", response_model=FarmerOut)
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer

@router.get("/farms/{farmer_id}/plots", response_model=List[PlotOut])
def list_farmer_plots(farmer_id: str, db: Session = Depends(get_db)):
    plots = db.query(FarmPlot).filter(FarmPlot.farmer_id == farmer_id).all()
    return plots

@router.post("/farms/{farmer_id}/plots", response_model=PlotOut, status_code=status.HTTP_201_CREATED)
def add_plot(farmer_id: str, plot_in: PlotCreate, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    plot = FarmPlot(
        farmer_id=farmer_id,
        label=plot_in.label,
        area=plot_in.area,
        area_unit=plot_in.area_unit,
        soil_type=plot_in.soil_type,
        irrigation_source=plot_in.irrigation_source,
        current_crop=plot_in.current_crop,
        previous_crop=plot_in.previous_crop
    )
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return plot
