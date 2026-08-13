<div align="center">

  <br />
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f69c.svg" alt="AgriSense Tractor Logo" width="120" height="120" />
  <br />

  <h1>🌱 AgriSense</h1>

  <p align="center">
    <b>A comprehensive, intelligent AI-powered precision agriculture platform for modern farmers & Maharashtra agricultural governance.</b>
  </p>

  <p align="center">
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/FASTAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/TAILWIND_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/SQLITE-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
    <a href="https://github.com/omjadhav9641/AgriSense"><img src="https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" /></a>
  </p>

</div>

---

## 📖 About AgriSense

**AgriSense** is a production-grade, state-of-the-art precision agriculture and governance control platform tailored for modern farmers, agronomists, and agricultural administrators. Designed with a priority focus on **Maharashtra agricultural zones** (Ahilyanagar, Nashik, Pune, Solapur, Nagpur, Marathwada, Kolhapur), AgriSense combines **Rule-Based Deep Agronomy**, **FastAPI Machine Learning Inference**, **Computer Vision Leaf Pathology Diagnostics**, a **Direct Produce Marketplace**, and an **Agri E-Store** with atomic stock transaction handling.

---

## 🖼️ Application Showcase & UI Previews

### 1. AgriSense Hero Dashboard Portal
![AgriSense Hero Portal](docs/screenshots/01_agrisense_hero_portal.png)

### 2. Live Microclimate Weather & Soil Health Index
![Live Weather & Soil Health](docs/screenshots/02_live_weather_soil_health.png)

### 3. Plant Disease AI Leaf Detection (Computer Vision Pathology)
![Plant Disease AI Leaf Detection](docs/screenshots/03_plant_disease_ai.png)

### 4. Direct Farmer-to-Buyer Produce Marketplace
![Direct Produce Marketplace](docs/screenshots/04_produce_marketplace.png)

### 5. Quick AI Crop Recommendation Microservice
![Quick AI Crop Recommendation](docs/screenshots/05_quick_ai_recommendation.png)
### 6 Soil Health & Crop Recommendation Report
![Soil Health & Crop Recommendation Report](docs/screenshots/06_report.png)
---

## 🏛️ System Architecture & Technology Stack

AgriSense is engineered as a decoupled, asynchronous, 3-tier microservice architecture:

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│              React 18 + Vite Frontend (Port 5173)                │
│  Claymorphic UI System • TanStack React Query • Lucide Icons     │
│  Recharts Data Viz • Leaflet Map Engine • Axios Interceptors     │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ REST API (JSON / Bearer JWT)
┌─────────────────────────────────▼────────────────────────────────┐
│                       BUSINESS / API LAYER                       │
│           Django REST Framework (Port 8000 / WSGI/ASGI)          │
│   Authentication (JWT) • Role Management (Farmer/Admin/Manager) │
│   Farms & Soil Health Engine • Marketplace & Inquiry Manager     │
│   E-Store Orders & Inventory Audit • Government Schemes Engine   │
└──────────────┬──────────────────────────────────┬────────────────┘
               │ DB Queries (ORM)                 │ HTTP Internal Proxy
┌──────────────▼─────────────┐          ┌─────────▼────────────────┐
│      DATABASE LAYER        │          │   ML ENGINE MICROSERVICE │
│   MySQL 8.0 (Production)   │          │   Python FastAPI (Port 8500)│
│  SQLite (Zero-Config Dev)  │          │ Crop Match • Disease CNN │
└────────────────────────────┘          └──────────────────────────┘
```

### Stack Breakdown
- **Frontend Layer (`frontend/`):** React 18, Vite, TypeScript, Tailwind CSS (Claymorphic Design Tokens), TanStack React Query v5, Recharts, Lucide Icons, Leaflet Maps.
- **Backend Core (`backend/`):** Python 3.10+, Django 5.x, Django REST Framework, SimpleJWT Auth, xhtml2pdf Engine, Django-Q2 Async Worker.
- **ML Engine Microservice (`ml/`):** Python FastAPI service running independently on port 8500. Exposes `/predict/crop` and `/predict/disease` high-speed endpoints.
- **Data Persistence:** MySQL database with soft-delete audit trail capability (`is_deleted` flags) across all major entities.

---

## 🌾 Comprehensive Feature Modules

### 1. Interactive Dashboard & Open-Meteo Microclimate Weather Engine
- **Live Local Microclimate:** Fetches real-time temperature, humidity, wind speed, and 5-day weather forecasts via Open-Meteo API.
- **Location Selector:** Quick switching between major agricultural hubs including **Ahilyanagar, Pune, Nashik, Nagpur, Solapur, Mumbai, and Jalandhar**.
- **Soil Health Index Gauge:** Real-time visual indicator of parcel nutrient balance (Optimal, Warning, Deficient).
- **Claymorphic Visual Design:** Modern 3D layered soft-depth cards using curated earthy palettes (Forest Green `#2E6F40`, Terracotta `#C86D3B`, Deep Clay `#2C2825`).

### 2. Land Parcel & 12-Parameter Lab Soil Health Engine
- **Interactive Map Pinning:** Leaflet map picker allowing farmers to pin land parcel boundaries and retrieve exact latitude/longitude coordinates.
- **Laboratory Ground Truth Compliance:** Analyzes 12 soil parameters (Nitrogen, Phosphorus, Potassium, Soil pH, EC, Organic Carbon, Sulphur, Zinc, Iron, Copper, Manganese, Boron).
- **Fertilizer Dosage Calculation:** Rule-based buffering logic calculating exact kg/acre dosing for Urea, DAP, MOP, Single Super Phosphate, and Zinc Sulphate.
- **Automated PDF Export:** Generates downloadable, lab-compliant PDF Soil Health Reports matching reference standard `#000002`.

### 3. Quick AI Crop Recommendation Microservice
- **Exploratory ML Inference:** Powered by the FastAPI microservice on port 8500.
- **Atmospheric Auto-Fill:** Auto-populates live ambient temperature and relative humidity directly from Open-Meteo weather data for selected land parcels.
- **Ranked Suitability Output:** Generates ranked crop predictions (e.g. **Wheat 99.4% Match, Maize 97.5%, Cotton 95%, Sunflowers 90%, Barley 80%**) with detailed agronomic rationales.

### 4. Plant Disease Leaf Pathology Diagnosis (AI Computer Vision)
- **Leaf Photo Upload:** Computer vision model analyzing uploaded crop leaf photographs for common pathology infections (e.g., *Wheat Yellow Rust*, *Tomato Early Blight*, *Paddy Blast*).
- **Pathology Diagnostics:** Returns model confidence score, severity level (**HIGH**, **MEDIUM**, **LOW**), observed symptoms, chemical/biological treatment protocols, and preventive cultural practices.
- **Diagnosis History Tracking:** Saves pathology check records linked to specific farmer land parcels for long-term farm health history.

### 5. Direct Farmer-to-Buyer Produce Marketplace (Maharashtra Focus)
- **Direct Mandi Trading:** Peer-to-peer produce marketplace connecting farmers directly with bulk buyers, food processors, and wholesale merchants without middleman fees.
- **Maharashtra APMC Mandis:** Pre-configured default listings across **Ahilyanagar APMC, Nashik APMC, Lasalgaon Onion Market, Pune APMC, Nagpur Orange Zone, and Solapur Pomegranate Mandi**.
- **Inquiry & Offer System:** Interactive modal enabling buyers to submit custom price offers and pickup inquiries directly to listing sellers with instant status alerts.

### 6. Agri E-Store & Atomic Order Fulfillment
- **Catalog Procurement:** Browse certified seeds, NPK fertilizers, organic pesticides, micro-irrigation kits, and modern farm equipment.
- **Smart Image Sanitization Utility:** Centralized `getCleanImageUrl` helper converting Unsplash webpages to direct CDN links with crop-specific fallback images.
- **Atomic Checkout & Inventory Decrement:** Transactional DB order placement (`place_order_atomic`) that locks inventory rows, validates stock levels, atomically decrements stock, and triggers async order confirmations.
- **Celebratory Order Success View:** Clean confirmation screen featuring unique Order Numbers (e.g. `#AGR-465E3643`), itemized receipts, and delivery tracking windows (3-4 business days).

### 7. Government Schemes & Subsidy Portal (Maharashtra Priority)
- **Comprehensive Database (20+ Active Schemes):** Filterable portal containing central and Maharashtra state-specific government schemes:
  - **MahaDBT Farmer Subsidy Portal:** 80% direct subsidy for drip/sprinkler irrigation, shade nets, and machinery in Maharashtra.
  - **PoCRA (Nanaji Deshmukh Krishi Sanjivani):** Climate-resilient financial aid up to ₹1 Lakh across 5,142 drought-prone Maharashtra villages.
  - **Mukhyamantri Solar Krishi Vahini 2.0 (MSKVY):** Guaranteed 12-hour daytime solar power supply for agricultural pumps.
  - **Maharashtra Kanda Chawl Storage Subsidy:** 50% capital grant for building scientific onion storage structures in Ahilyanagar, Nashik, Pune & Solapur.
  - **Gopinath Munde Shetkari Apghat Bima:** ₹2 Lakh 100% state-funded accident insurance for all registered landholding farmers in Maharashtra.
  - **PM-KISAN, PMFBY, KCC Concessional Loans, PMKSY Drip, PM-KUSUM Solar Pumps, SMAM Machinery, PKVY Organic Grants, AIF Infrastructure Fund, Soil Health Card, Kisan Call Center (1800-180-1551)**.
- **Interactive Guidance Modal:** Displays required application documents (Aadhaar, Khatauni Land Records, Bank Passbook) and direct links to official government portals.

### 8. Custom Admin & Governance Control Center (`/admin-panel`)
- **Real-Time Analytics:** Visualized E-Commerce Revenue, Total Orders, Active Farmers, Land Parcels, and Crop Catalog Distribution.
- **Full Inventory & Produce CRUD:** Add, edit, or delete store products and marketplace listings with live image preview banners.
- **Farmer & Land Management:** Audit farmer accounts, review registered land parcels, and execute soft-delete recovery operations.

---

## ⚡ Quickstart & Deployment Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MySQL Server (Optional, defaults to SQLite for dev)

---

### Option 1: Quickstart via Manual Microservices

#### 1. Launch FastAPI ML Microservice (Port 8500)
```bash
cd ml
pip install -r requirements.txt
python -m uvicorn ml.main:app --port 8500 --reload
```

#### 2. Launch Django REST Backend (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_agrisense
python manage.py runserver 8000
```

#### 3. Launch React 18 + Vite Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

### Option 2: Docker Compose (Production Environment)

```bash
docker-compose up --build -d
```

- **Frontend Application:** `http://localhost:5173`
- **Django REST Backend API:** `http://localhost:8000`
- **FastAPI ML Microservice:** `http://localhost:8500`

---

## 🔑 Demo Access Credentials

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer** | `om` | `farmer123` | Farm Parcels, Soil Reports, Disease AI, Marketplace Sales, E-Store Shopping, Govt Schemes |
| **Admin** | `admin` | `admin123` | Governance Dashboard, E-Store CRUD, Marketplace Moderation, User Audit, Soil Analytics |

---

## 🔌 API Endpoint Reference

| Service | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login/` | Obtain JWT Access & Refresh Tokens |
| **Auth** | `POST` | `/api/auth/register/` | Register new Farmer or Agronomist account |
| **Farms** | `GET / POST` | `/api/farms/parcels/` | List or register land parcels with map coordinates |
| **Farms** | `POST` | `/api/farms/parcels/{id}/add_soil_record/` | Record 12-parameter lab soil test results |
| **Farms** | `GET` | `/api/farms/parcels/{id}/generate_pdf/` | Download laboratory-standard PDF report |
| **ML Engine**| `POST` | `http://localhost:8500/predict/crop` | FastAPI microservice NPK crop suitability inference |
| **ML Engine**| `POST` | `http://localhost:8500/predict/disease` | FastAPI microservice computer vision leaf disease diagnosis |
| **Market** | `GET / POST` | `/api/marketplace/listings/` | Browse or publish harvested produce listings |
| **Market** | `POST` | `/api/marketplace/listings/{id}/inquire/` | Submit price offer inquiry to listing farmer |
| **Store** | `GET` | `/api/inventory/products/` | Catalog products filtered by category |
| **Orders** | `POST` | `/api/orders/` | Atomic order checkout with real-time stock decrement |
| **Schemes** | `GET` | `/api/schemes/` | Searchable government schemes filtered by state & category |
| **Admin** | `GET` | `/api/admin-panel/analytics/` | Retrieve platform analytics & revenue stats |

---

## 🎨 Design Philosophy & Visual Styling

AgriSense adheres to a modern **Claymorphic** aesthetic, avoiding flat generic enterprise designs in favor of soft-depth layered clay styling, rounded card contours (`2xl`), rich agricultural tokens (`#2E6F40`, `#C86D3B`, `#FAF8F5`), micro-animations, and dynamic data visualizers.

---

## 📜 License & Compliance

AgriSense is open-source software released under the [MIT License](LICENSE).
