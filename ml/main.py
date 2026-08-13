import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml.routes.crop_routes import router as crop_router
from ml.routes.disease_routes import router as disease_router

app = FastAPI(
    title="AgriSense ML Microservice Engine",
    description="Decoupled FastAPI service for Crop Recommendation ML and Plant Disease Leaf Classification CNN.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_router)
app.include_router(disease_router)

@app.get("/")
def root():
    return {
        "service": "AgriSense ML Microservice Engine",
        "status": "healthy",
        "endpoints": ["/predict/crop", "/predict/disease"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "AgriSense ML Engine"}

if __name__ == "__main__":
    uvicorn.run("ml.main:app", host="0.0.0.0", port=8500, reload=True)
