# AgriSense API & ML Microservice Endpoint Documentation

## Architectural Overview
AgriSense runs as a three-tier decoupled architecture:
- **React Frontend:** `http://localhost:5173`
- **Django REST Framework Backend:** `http://localhost:8000/api`
- **FastAPI ML Microservice:** `http://localhost:8500`

---

## 1. FastAPI ML Engine Microservice (`http://localhost:8500`)

### `GET /health`
Returns service status.

### `POST /predict/crop`
Infers top matching crops from N, P, K, temperature, humidity, pH, and rainfall.

**Request Body (JSON):**
```json
{
  "nitrogen": 120.0,
  "phosphorus": 60.0,
  "potassium": 40.0,
  "temperature": 24.5,
  "humidity": 65.0,
  "ph": 6.5,
  "rainfall": 85.0,
  "top_n": 5
}
```

### `POST /predict/disease`
Classifies leaf disease from multipart photo upload.

**Request:** `multipart/form-data` with `file` (image file).

**Response:**
```json
{
  "status": "success",
  "disease_name": "Tomato Early Blight (Alternaria solani)",
  "severity": "Medium",
  "crop_affected": "Tomato",
  "confidence_score": 88.5,
  "symptoms": "Concentric dark brown rings on lower leaves...",
  "treatment_guidance": [
    "Apply copper-based fungicide or Chlorothalonil.",
    "Remove infected lower leaves."
  ],
  "preventive_measures": "Practice 3-year crop rotation."
}
```

---

## 2. Django REST Framework Endpoints (`http://localhost:8000/api`)

### Authentication & Users (`/api/auth/`)
- `POST /api/auth/register/` - Register new CustomUser (farmer, agronomist, manager, admin)
- `POST /api/auth/token/` - Obtain JWT access and refresh token pair
- `POST /api/auth/token/refresh/` - Refresh access token

### Land & Soil Health (`/api/farms/`)
- `GET/POST /api/farms/lands/` - List & create farmer land parcels
- `GET/POST /api/farms/soil/` - List & create soil health sample records
- `DELETE /api/farms/lands/{id}/` - Soft-delete land parcel

### Recommendation & Reports (`/api/recommendations/`)
- `GET /api/recommendations/evaluate/{soil_id}/` - Run deep rule-based evaluation (Section 5 Ground Truth compliance)
- `POST /api/recommendations/quick-ai/` - Quick ML crop recommendation proxying to FastAPI ML Engine

### Leaf Disease Detection (`/api/disease/`)
- `POST /api/disease/diagnose/` - Upload leaf photo, receive AI diagnosis & save to farm history
- `GET /api/disease/history/` - View past leaf pathology records for authenticated user

### Farmer Produce Marketplace (`/api/marketplace/`)
- `GET/POST /api/marketplace/listings/` - Browse & post crop produce sales
- `DELETE /api/marketplace/listings/{id}/` - Delete produce listing
- `POST /api/marketplace/listings/{id}/inquire/` - Send buyer contact & offer to seller

### E-Commerce Store & Checkout (`/api/inventory/`, `/api/orders/`)
- `GET /api/inventory/products/` - List fertilizers, seeds, pesticides with high-res images
- `POST /api/orders/` - Atomic multi-item checkout & stock reduction

### Government Schemes (`/api/schemes/`)
- `GET /api/schemes/` - Searchable portal directory & eligibility filter

---

## Datasets & ML Baseline Notes
- **Crop Model:** Scikit-learn Random Forest trained on standard 7-feature N/P/K/climate dataset.
- **Disease Model:** Pillow & vision feature extraction baseline trained against solanaceous & cereal leaf pathology sets.
