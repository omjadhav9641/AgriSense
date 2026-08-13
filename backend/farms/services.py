def evaluate_parameter_status(param_name: str, value: float) -> dict:
    """
    Evaluates soil parameter value against standard ideal ranges.
    Returns dict: {'status': str, 'ideal_range': str}
    """
    param = param_name.lower()
    val = float(value)

    if 'ph' in param:
        ideal_range = "6.0 - 7.5"
        if val < 6.0:
            status = "Low"
        elif val <= 7.5:
            status = "Optimal"
        else:
            status = "High"

    elif 'nitrogen' in param or param == 'n':
        ideal_range = "280 - 560 ppm"
        if val < 280:
            status = "Low"
        elif val <= 560:
            status = "Sufficient"
        else:
            status = "High"

    elif 'phosphorus' in param or param == 'p':
        ideal_range = "18 - 25 ppm"
        if val < 11:
            status = "Low"
        elif val < 18:
            status = "Medium"
        elif val <= 25:
            status = "Sufficient"
        else:
            status = "High"

    elif 'potassium' in param or param == 'k':
        ideal_range = "160 - 280 ppm"
        if val < 110:
            status = "Low"
        elif val < 160:
            status = "Medium"
        elif val <= 280:
            status = "Sufficient"
        else:
            status = "High"

    elif 'carbon' in param or 'organic' in param:
        ideal_range = "0.5 - 0.75 %"
        if val < 0.5:
            status = "Low"
        elif val <= 0.75:
            status = "Optimal"
        else:
            status = "High"

    elif 'moisture' in param:
        ideal_range = "15 - 30 %"
        if val < 15:
            status = "Low"
        elif val <= 30:
            status = "Optimal"
        else:
            status = "High"

    else:
        ideal_range = "N/A"
        status = "Optimal"

    return {
        'status': status,
        'ideal_range': ideal_range
    }


def calculate_soil_health_score(soil_data) -> float:
    """
    Computes a 0-100 soil health score index based on all 6 parameter status evaluations.
    """
    params = [
        ('Soil pH', soil_data.ph),
        ('Nitrogen', soil_data.nitrogen),
        ('Phosphorus', soil_data.phosphorus),
        ('Potassium', soil_data.potassium),
        ('Organic Carbon', soil_data.organic_carbon),
        ('Moisture', soil_data.moisture),
    ]

    total_points = 0
    max_points = len(params) * 10

    for name, val in params:
        eval_res = evaluate_parameter_status(name, val)
        st = eval_res['status']
        if st in ('Optimal', 'Sufficient'):
            total_points += 10
        elif st == 'Medium':
            total_points += 7
        elif st == 'High':
            total_points += 6
        elif st == 'Low':
            total_points += 3

    return round((total_points / max_points) * 100, 1)
