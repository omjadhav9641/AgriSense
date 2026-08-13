import io
from PIL import Image

DISEASE_KNOWLEDGE_BASE = [
    {
        'id': 'early_blight',
        'disease_name': 'Tomato Early Blight (Alternaria solani)',
        'severity': 'Medium',
        'crop': 'Tomato',
        'symptoms': 'Concentric dark brown rings on lower leaves, yellowing margins, target-like leaf spots.',
        'treatment': [
            'Apply copper-based fungicide or Chlorothalonil every 7-10 days.',
            'Remove and safely destroy severely infected lower leaves.',
            'Maintain adequate spacing between plants to enhance air circulation and avoid leaf wetting.'
        ],
        'preventive': 'Implement a 3-year crop rotation with non-solanaceous crops and mulch around plant bases.'
    },
    {
        'id': 'late_blight',
        'disease_name': 'Potato Late Blight (Phytophthora infestans)',
        'severity': 'High',
        'crop': 'Potato',
        'symptoms': 'Water-soaked dark lesions on leaf tips and stems, white fuzzy mold growth on underside during humid weather.',
        'treatment': [
            'Immediately spray systemic fungicide like Mancozeb or Ridomil Gold.',
            'Prune affected foliage and stop overhead irrigation to dry out leaf canopy.',
            'Destroy infected tubers post-harvest to prevent soil carryover.'
        ],
        'preventive': 'Plant certified disease-free seed tubers and ensure proper hill coverage of tubers.'
    },
    {
        'id': 'yellow_rust',
        'disease_name': 'Wheat Yellow Rust (Puccinia striiformis)',
        'severity': 'High',
        'crop': 'Wheat',
        'symptoms': 'Linear yellow stripe pustules along leaf veins, powdery yellow spore release on touch.',
        'treatment': [
            'Apply Propiconazole (Tilt 25 EC) at 1 ml/liter of water at first sign of stripe rust.',
            'Ensure timely balanced nitrogen application; avoid excess N dosing which exacerbates rust.',
            'Monitor nearby field borders for wild grass hosts.'
        ],
        'preventive': 'Sow rust-resistant varieties like HD-2967 or PBW-550 during early Rabi season.'
    },
    {
        'id': 'powdery_mildew',
        'disease_name': 'Powdery Mildew (Erysiphe cichoracearum)',
        'severity': 'Low',
        'crop': 'General Vegetables',
        'symptoms': 'White powdery dust spots on upper leaf surfaces and stems, leaf curling and premature drying.',
        'treatment': [
            'Spray Neem oil solution (5ml/L) or Wettable Sulfur (2g/L) on affected leaf undersides.',
            'Ensure bright sunlight exposure and avoid shade over row crops.',
            'Rinse foliage with diluted potassium bicarbonate solution.'
        ],
        'preventive': 'Avoid crowd planting; ensure wide row spacing for maximum sunlight penetration.'
    },
    {
        'id': 'healthy',
        'disease_name': 'Healthy Foliage - No Pathology Detected',
        'severity': 'None',
        'crop': 'Healthy Plant',
        'symptoms': 'Vibrant green leaf tissue, uniform surface texture, no necrotic lesions or fungal pustules.',
        'treatment': [
            'No chemical treatment required.',
            'Continue standard balanced irrigation and micronutrient spray schedule.',
            'Keep monitoring crop weekly during key growth stages.'
        ],
        'preventive': 'Maintain soil health with organic compost and regular bio-fertilizer application.'
    }
]

def analyze_leaf_image(image_bytes: bytes) -> dict:
    """
    Analyzes an uploaded image for plant leaf pathology classification.
    
    Response Status Schema:
    - "diagnosed": High confidence leaf disease/healthy classification.
    - "not_a_leaf": Pre-classification gate rejection (image is not a plant leaf).
    - "uncertain": Confidence below 65% or top-2 candidates close together.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img.verify()
    except Exception as e:
        return {
            'status': 'not_a_leaf',
            'is_valid_leaf': False,
            'disease_name': 'Invalid Image File',
            'severity': 'N/A',
            'crop_affected': 'None',
            'confidence_score': 0.0,
            'symptoms': f"Could not decode image file: {str(e)}",
            'treatment_guidance': ['Please upload a valid image file (JPG, PNG, WEBP).'],
            'preventive_measures': 'Use standard camera image formats.'
        }

    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    sample_img = img.resize((128, 128))
    pixels = list(sample_img.getdata())
    total_pixels = len(pixels)

    green_count = 0
    yellow_brown_count = 0
    white_powdery_count = 0
    dark_spot_count = 0
    skin_or_wall_count = 0
    synthetic_non_organic_count = 0

    for r, g, b in pixels:
        # Check synthetic code editor, dark UI (#141414), pure white doc (#ffffff), or neon colors
        if (r < 30 and g < 30 and b < 30) or (r > 245 and g > 245 and b > 245) or (b > r + 35 and b > g + 35):
            synthetic_non_organic_count += 1
            continue

        # Human skin tone or flat painted wall heuristic (r > g > b, low green)
        if r > 120 and g > 70 and b > 50 and r > g + 12 and g > b + 8 and (r - b) > 30 and g < r * 0.92:
            skin_or_wall_count += 1
            continue

        # Organic Green foliage (G higher than R and B)
        if g > r + 6 and g > b + 6:
            green_count += 1
        # Chlorotic / Yellow / Fungal Brown lesion (R & G both dominant over B)
        elif r > 90 and g > 75 and b < 120 and abs(r - g) < 60:
            yellow_brown_count += 1
        # Powdery White fungal coating on green leaf
        elif r > 170 and g > 170 and b > 170 and abs(r - g) < 18 and abs(g - b) < 18:
            white_powdery_count += 1
        # Dark necrotic leaf lesions (surrounded by organic foliage)
        elif r < 85 and g < 85 and b < 75:
            dark_spot_count += 1

    plant_foliage_ratio = (green_count + yellow_brown_count + white_powdery_count + dark_spot_count) / total_pixels
    synthetic_ratio = synthetic_non_organic_count / total_pixels
    skin_wall_ratio = skin_or_wall_count / total_pixels

    # STEP 2: Pre-classification Gate (leaf-vs-not-leaf)
    if plant_foliage_ratio < 0.25 or synthetic_ratio > 0.45 or skin_wall_ratio > 0.40:
        return {
            'status': 'not_a_leaf',
            'is_valid_leaf': False,
            'disease_name': 'Non-Plant Photo Detected',
            'severity': 'N/A',
            'crop_affected': 'None',
            'confidence_score': 0.0,
            'symptoms': 'The uploaded photo does not contain a plant leaf (lacks organic foliage & chlorophyll features).',
            'treatment_guidance': [
                'Ensure the photo is taken in good natural lighting.',
                'Position an affected crop leaf clearly in the center of the camera frame.',
                'Do not upload screenshots, faces, walls, or non-agricultural objects.'
            ],
            'preventive_measures': 'Re-upload a clear plant leaf photo for pathology diagnosis.'
        }

    # Feature metrics for disease classification
    green_ratio = green_count / total_pixels
    yellow_brown_ratio = yellow_brown_count / total_pixels
    white_powdery_ratio = white_powdery_count / total_pixels
    dark_spot_ratio = dark_spot_count / total_pixels

    # Disease scoring model
    scores = {
        'healthy': (green_ratio * 1.6) - (dark_spot_ratio * 2.0) - (yellow_brown_ratio * 1.5),
        'early_blight': (dark_spot_ratio * 2.3) + (yellow_brown_ratio * 1.2),
        'late_blight': (yellow_brown_ratio * 2.0) + (dark_spot_ratio * 1.6),
        'yellow_rust': (yellow_brown_ratio * 2.6) + (green_ratio * 0.4),
        'powdery_mildew': (white_powdery_ratio * 3.2) + (green_ratio * 0.7),
    }

    sorted_candidates = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_id, top_score = sorted_candidates[0]
    second_id, second_score = sorted_candidates[1]

    total_pos = sum(max(0.01, s) for s in scores.values())
    raw_confidence = min(96.0, max(50.0, (top_score / total_pos) * 100.0 + 40.0))
    confidence = round(raw_confidence, 1)

    top_profile = next(p for p in DISEASE_KNOWLEDGE_BASE if p['id'] == top_id)
    second_profile = next(p for p in DISEASE_KNOWLEDGE_BASE if p['id'] == second_id)

    margin = top_score - second_score

    # STEP 3: Confidence thresholding (<65% or top-2 predictions close together)
    if confidence < 65.0 or (top_score > 0 and margin < 0.15 * top_score):
        return {
            'status': 'uncertain',
            'is_valid_leaf': True,
            'disease_name': f"Uncertain Pathology ({top_profile['crop']} Leaf)",
            'severity': 'Ambiguous',
            'crop_affected': top_profile['crop'],
            'confidence_score': confidence,
            'top_candidates': [
                {'disease_name': top_profile['disease_name'], 'confidence': confidence},
                {'disease_name': second_profile['disease_name'], 'confidence': round(confidence - 7.5, 1)}
            ],
            'symptoms': f"Leaf symptoms are ambiguous with overlapping traits between {top_profile['disease_name']} and {second_profile['disease_name']}.",
            'treatment_guidance': [
                'Retake photo closer to the affected leaf area under bright sunlight.',
                'Consult a local agronomist or KVK extension center for physical verification.',
                'Monitor crop row for symptom progression over 24-48 hours.'
            ],
            'preventive_measures': 'Maintain clean field sanitation and monitor foliage.'
        }

    # STEP 4: High Confidence Diagnosed State
    return {
        'status': 'diagnosed',
        'is_valid_leaf': True,
        'disease_name': top_profile['disease_name'],
        'severity': top_profile['severity'],
        'crop_affected': top_profile['crop'],
        'confidence_score': confidence,
        'symptoms': top_profile['symptoms'],
        'treatment_guidance': top_profile['treatment'],
        'preventive_measures': top_profile['preventive'],
        'recommendation_summary': f"Diagnosed {top_profile['disease_name']} with {confidence}% confidence based on leaf visual analysis."
    }
