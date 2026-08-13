from fastapi import APIRouter, UploadFile, File, HTTPException
from ml.services.disease_service import analyze_leaf_image

router = APIRouter()

@router.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be a valid image (JPEG/PNG/WEBP).")

    contents = await file.read()
    result = analyze_leaf_image(contents)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error_message"))

    return result
