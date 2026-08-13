from fastapi import APIRouter
from pydantic import BaseModel, Field
from ml.services.crop_service import predict_best_crops

router = APIRouter()

class CropPredictRequest(BaseModel):
    nitrogen: float = Field(..., example=120.0)
    phosphorus: float = Field(..., example=60.0)
    potassium: float = Field(..., example=40.0)
    temperature: float = Field(..., example=24.5)
    humidity: float = Field(..., example=65.0)
    ph: float = Field(..., example=6.5)
    rainfall: float = Field(..., example=85.0)
    top_n: int = Field(default=5, example=5)

@router.post("/predict/crop")
def predict_crop(req: CropPredictRequest):
    predictions = predict_best_crops(
        n=req.nitrogen,
        p=req.phosphorus,
        k=req.potassium,
        temp=req.temperature,
        humidity=req.humidity,
        ph=req.ph,
        rainfall=req.rainfall,
        top_n=req.top_n
    )
    return {
        "status": "success",
        "inputs": req.dict(),
        "predictions": predictions
    }
