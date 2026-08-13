from datetime import datetime
from crops.models import Crop
from farms.services import evaluate_parameter_status

def get_current_season(month: int = None) -> str:
    if month is None:
        month = datetime.now().month
    if month in [6, 7, 8, 9, 10]:
        return 'Kharif'
    elif month in [11, 12, 1, 2, 3]:
        return 'Rabi'
    elif month in [4, 5]:
        return 'Zaid'
    return 'All Season'

def evaluate_crop_recommendation(soil_data, current_month: int = None, weather_data: dict = None) -> dict:
    if current_month is None:
        current_month = datetime.now().month

    current_season = get_current_season(current_month)
    crops = Crop.objects.filter(is_deleted=False)
    
    evaluated_crops = []

    for crop in crops:
        # 1. Base Score calculation (0.0 to 10.0)
        score = 10.0

        # pH Check
        if soil_data.ph < crop.optimal_ph_min:
            diff = crop.optimal_ph_min - soil_data.ph
            score -= min(3.5, diff * 1.8)
        elif soil_data.ph > crop.optimal_ph_max:
            diff = soil_data.ph - crop.optimal_ph_max
            score -= min(3.5, diff * 1.8)

        # Season Alignment Check
        if crop.season != 'All Season' and crop.season != current_season:
            score -= 2.0

        # Available soil nutrients estimation (conversion from PPM to approx available kg/acre)
        n_avail = soil_data.nitrogen * 0.90
        p_avail = soil_data.phosphorus * 1.00
        k_avail = soil_data.potassium * 0.85

        # Deficits
        n_def = max(0.0, crop.target_nitrogen - n_avail)
        p_def = max(0.0, crop.target_phosphorus - p_avail)
        k_def = max(0.0, crop.target_potassium - k_avail)

        total_target = crop.target_nitrogen + crop.target_phosphorus + crop.target_potassium
        total_def = n_def + p_def + k_def

        if total_target > 0:
            def_ratio = total_def / total_target
            score -= min(4.0, def_ratio * 4.5)

        # Weather adjustment if provided
        if weather_data:
            if weather_data.get('frost_alert', False) and crop.frost_sensitive:
                score -= 2.0
            if weather_data.get('heavy_rain', False) and crop.water_requirement == 'Low':
                score -= 1.0

        final_score = round(max(0.0, min(10.0, score)), 1)

        # Category bucketing
        if final_score >= 7.0:
            category = "Suitable"
        elif final_score >= 4.0:
            category = "Conditionally Suitable"
        else:
            category = "Requires Intervention"

        # Basis sentence
        if total_def > (total_target * 0.3):
            basis = "Moderate to severe nutrient deficiency - requires targeted fertilization"
        elif soil_data.ph < crop.optimal_ph_min or soil_data.ph > crop.optimal_ph_max:
            basis = "Soil pH slightly non-ideal - requires pH correction"
        else:
            basis = "Optimal soil health & season alignment with minimal nutrient deficit"

        # 2. Fertilizer Advisory per Crop
        severity_ratio = (total_def / total_target) if total_target > 0 else 0
        multiplier = 1.25 if severity_ratio > 0.4 else 1.10

        rec_n_kg = round(n_def * multiplier, 1)
        rec_p_kg = round(p_def * multiplier, 1)
        rec_k_kg = round(k_def * multiplier, 1)

        # Commercial product dosages
        urea_kg = round(rec_n_kg / 0.46, 1) if rec_n_kg > 0 else 0.0
        ssp_kg = round(rec_p_kg / 0.16, 1) if rec_p_kg > 0 else 0.0
        mop_kg = round(rec_k_kg / 0.60, 1) if rec_k_kg > 0 else 0.0

        dosage_table = [
            {
                'nutrient': 'Nitrogen (N)',
                'recommended_dosage': f"{rec_n_kg} kg/acre",
                'remarks': 'Split application (50% Basal + 50% Top Dressing)' if rec_n_kg > 0 else 'Sufficient in soil'
            },
            {
                'nutrient': 'Phosphorus (P)',
                'recommended_dosage': f"{rec_p_kg} kg/acre",
                'remarks': 'Basal application at planting' if rec_p_kg > 0 else 'Sufficient in soil'
            },
            {
                'nutrient': 'Potassium (K)',
                'recommended_dosage': f"{rec_k_kg} kg/acre",
                'remarks': 'As per crop stage / split application' if rec_k_kg > 0 else 'Sufficient in soil'
            }
        ]

        recommended_products = []
        if urea_kg > 0:
            recommended_products.append(f"Urea (46% N): {urea_kg} kg/acre")
        if ssp_kg > 0:
            recommended_products.append(f"Single Super Phosphate - SSP (16% P2O5): {ssp_kg} kg/acre")
        if mop_kg > 0:
            recommended_products.append(f"Muriate of Potash - MOP (60% K2O): {mop_kg} kg/acre")

        if not recommended_products:
            recommended_products.append("No additional chemical fertilizer required. Maintain organic compost.")

        analysis_line = (
            f"Raw soil N: {soil_data.nitrogen} ppm, P: {soil_data.phosphorus} ppm, K: {soil_data.potassium} ppm "
            f"vs {crop.name} target N: {crop.target_nitrogen} kg/acre, P: {crop.target_phosphorus} kg/acre, K: {crop.target_potassium} kg/acre. "
            f"Deficiencies addressed with severity-based buffering ({multiplier:.2f}x multiplier)."
        )

        evaluated_crops.append({
            'crop_id': crop.id,
            'crop_name': crop.name,
            'season': crop.season,
            'image_url': crop.image_url,
            'score': final_score,
            'category': category,
            'basis': basis,
            'dosage_table': dosage_table,
            'recommended_products': recommended_products,
            'analysis': analysis_line
        })

    # Sort crops by score descending
    evaluated_crops.sort(key=lambda x: x['score'], reverse=True)

    top_crop = evaluated_crops[0] if evaluated_crops else None

    # Soil Parameter Analysis section
    soil_analysis_table = [
        {
            'parameter': 'Soil pH',
            'observed_value': f"{soil_data.ph:.2f}",
            'status': evaluate_parameter_status('Soil pH', soil_data.ph)['status'],
            'ideal_range': evaluate_parameter_status('Soil pH', soil_data.ph)['ideal_range']
        },
        {
            'parameter': 'Nitrogen (N)',
            'observed_value': f"{soil_data.nitrogen:.1f} ppm",
            'status': evaluate_parameter_status('Nitrogen', soil_data.nitrogen)['status'],
            'ideal_range': evaluate_parameter_status('Nitrogen', soil_data.nitrogen)['ideal_range']
        },
        {
            'parameter': 'Phosphorus (P)',
            'observed_value': f"{soil_data.phosphorus:.1f} ppm",
            'status': evaluate_parameter_status('Phosphorus', soil_data.phosphorus)['status'],
            'ideal_range': evaluate_parameter_status('Phosphorus', soil_data.phosphorus)['ideal_range']
        },
        {
            'parameter': 'Potassium (K)',
            'observed_value': f"{soil_data.potassium:.1f} ppm",
            'status': evaluate_parameter_status('Potassium', soil_data.potassium)['status'],
            'ideal_range': evaluate_parameter_status('Potassium', soil_data.potassium)['ideal_range']
        },
        {
            'parameter': 'Organic Carbon',
            'observed_value': f"{soil_data.organic_carbon:.2f} %",
            'status': evaluate_parameter_status('Organic Carbon', soil_data.organic_carbon)['status'],
            'ideal_range': evaluate_parameter_status('Organic Carbon', soil_data.organic_carbon)['ideal_range']
        },
        {
            'parameter': 'Moisture',
            'observed_value': f"{soil_data.moisture:.1f} %",
            'status': evaluate_parameter_status('Moisture', soil_data.moisture)['status'],
            'ideal_range': evaluate_parameter_status('Moisture', soil_data.moisture)['ideal_range']
        },
    ]

    # Soil health narrative interpretation
    narratives = []
    ph_stat = evaluate_parameter_status('Soil pH', soil_data.ph)['status']
    if ph_stat == 'Optimal':
        narratives.append("Soil pH is in the optimal range (6.0 - 7.5), ensuring good nutrient availability.")
    elif ph_stat == 'Low':
        narratives.append(f"Soil pH ({soil_data.ph:.2f}) is acidic. Agricultural lime application is advised to restore equilibrium.")
    else:
        narratives.append(f"Soil pH ({soil_data.ph:.2f}) is alkaline. Gypsum or elemental sulfur application is recommended.")

    n_stat = evaluate_parameter_status('Nitrogen', soil_data.nitrogen)['status']
    if n_stat == 'Low':
        narratives.append(f"Nitrogen level ({soil_data.nitrogen:.1f} ppm) is low. Urea or organic manure split application recommended.")
    else:
        narratives.append(f"Nitrogen level ({soil_data.nitrogen:.1f} ppm) is {n_stat.lower()}. Maintain standard basal dosing.")

    return {
        'lab_reference': soil_data.lab_reference,
        'sample_date': str(soil_data.sample_date),
        'farmer_name': soil_data.land.owner.username,
        'land_id': soil_data.land.land_id,
        'land_name': soil_data.land.name,
        'acreage': str(soil_data.land.acreage),
        'location': soil_data.land.location_name,
        'soil_type': soil_data.land.soil_type,
        'soil_analysis_table': soil_analysis_table,
        'soil_narratives': narratives,
        'top_recommended_crop': top_crop,
        'all_evaluated_crops': evaluated_crops,
    }
