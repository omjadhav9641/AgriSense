import numpy as np

# Standard Crop Recommendation feature dataset rules & model logic
# Features: N (0-140), P (5-145), K (5-205), temperature (8-45 C), humidity (14-100 %), pH (3.5-10.0), rainfall (20-300 mm)

CROP_PROFILES = [
    {
        'crop': 'Wheat',
        'optimal_n': 120, 'optimal_p': 60, 'optimal_k': 40,
        'temp_min': 12, 'temp_max': 25, 'ph_min': 6.0, 'ph_max': 7.5,
        'rainfall_min': 50, 'rainfall_max': 100,
        'rationale': 'Thrives in cooler temperature ranges with balanced NPK and moderate irrigation.'
    },
    {
        'crop': 'Rice',
        'optimal_n': 150, 'optimal_p': 60, 'optimal_k': 60,
        'temp_min': 20, 'temp_max': 38, 'ph_min': 5.5, 'ph_max': 7.2,
        'rainfall_min': 150, 'rainfall_max': 300,
        'rationale': 'Requires abundant water supply, high humidity, and high nitrogen availability.'
    },
    {
        'crop': 'Sugarcane',
        'optimal_n': 220, 'optimal_p': 90, 'optimal_k': 110,
        'temp_min': 20, 'temp_max': 40, 'ph_min': 6.0, 'ph_max': 8.0,
        'rainfall_min': 120, 'rainfall_max': 250,
        'rationale': 'Long-duration crop benefiting from high nutrient inputs and high moisture.'
    },
    {
        'crop': 'Sunflowers',
        'optimal_n': 80, 'optimal_p': 60, 'optimal_k': 40,
        'temp_min': 18, 'temp_max': 34, 'ph_min': 6.0, 'ph_max': 7.8,
        'rainfall_min': 40, 'rainfall_max': 110,
        'rationale': 'Drought-tolerant oilseed crop with moderate nutrient demands and broad pH tolerance.'
    },
    {
        'crop': 'Potato',
        'optimal_n': 170, 'optimal_p': 95, 'optimal_k': 140,
        'temp_min': 10, 'temp_max': 24, 'ph_min': 5.2, 'ph_max': 6.5,
        'rainfall_min': 40, 'rainfall_max': 90,
        'rationale': 'Prefers slightly acidic well-drained soil with rich potassium and cool night temperatures.'
    },
    {
        'crop': 'Maize',
        'optimal_n': 120, 'optimal_p': 60, 'optimal_k': 50,
        'temp_min': 18, 'temp_max': 32, 'ph_min': 5.8, 'ph_max': 7.0,
        'rainfall_min': 60, 'rainfall_max': 140,
        'rationale': 'Highly responsive to nitrogen, preferring warm sunny weather and medium moisture.'
    },
    {
        'crop': 'Tomato',
        'optimal_n': 140, 'optimal_p': 80, 'optimal_k': 100,
        'temp_min': 16, 'temp_max': 30, 'ph_min': 6.0, 'ph_max': 6.8,
        'rainfall_min': 40, 'rainfall_max': 100,
        'rationale': 'Requires balanced NPK, steady soil moisture, and moderate warmth.'
    },
    {
        'crop': 'Cotton',
        'optimal_n': 120, 'optimal_p': 60, 'optimal_k': 60,
        'temp_min': 21, 'temp_max': 35, 'ph_min': 6.0, 'ph_max': 8.0,
        'rainfall_min': 50, 'rainfall_max': 110,
        'rationale': 'Thrives in warm climatic conditions with deep fertile soil and sunny days.'
    },
    {
        'crop': 'Barley',
        'optimal_n': 90, 'optimal_p': 40, 'optimal_k': 30,
        'temp_min': 12, 'temp_max': 24, 'ph_min': 6.0, 'ph_max': 7.5,
        'rainfall_min': 30, 'rainfall_max': 75,
        'rationale': 'Hardy cereal crop suited for lower moisture and moderate nutrient levels.'
    }
]

def predict_best_crops(n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float, top_n: int = 5):
    scored_crops = []

    for item in CROP_PROFILES:
        score = 100.0

        # Nutrient affinity penalties
        score -= abs(n - item['optimal_n']) * 0.25
        score -= abs(p - item['optimal_p']) * 0.25
        score -= abs(k - item['optimal_k']) * 0.25

        # Temperature fit
        if temp < item['temp_min']:
            score -= (item['temp_min'] - temp) * 4.0
        elif temp > item['temp_max']:
            score -= (temp - item['temp_max']) * 4.0

        # pH fit
        if ph < item['ph_min']:
            score -= (item['ph_min'] - ph) * 15.0
        elif ph > item['ph_max']:
            score -= (ph - item['ph_max']) * 15.0

        # Rainfall fit
        if rainfall < item['rainfall_min']:
            score -= (item['rainfall_min'] - rainfall) * 0.3
        elif rainfall > item['rainfall_max']:
            score -= (rainfall - item['rainfall_max']) * 0.3

        confidence = round(max(10.0, min(99.4, score)), 1)

        scored_crops.append({
            'crop_name': item['crop'],
            'confidence_score': confidence,
            'fit_category': 'Highly Recommended' if confidence >= 80 else ('Suitable' if confidence >= 60 else 'Conditional'),
            'rationale': item['rationale']
        })

    # Sort descending by confidence
    scored_crops.sort(key=lambda x: x['confidence_score'], reverse=True)
    return scored_crops[:top_n]
