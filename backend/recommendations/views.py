import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from farms.models import SoilData
from .services import evaluate_crop_recommendation
from weather.services import get_parcel_weather

ML_ENGINE_URL = getattr(settings, 'ML_ENGINE_URL', 'http://127.0.0.1:8500')

class RecommendationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, soil_id=None):
        if not soil_id:
            soil_id = request.query_params.get('soil_id')
        
        if not soil_id:
            return Response({'error': 'soil_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            soil_data = SoilData.objects.get(id=soil_id, is_deleted=False)
        except SoilData.DoesNotExist:
            return Response({'error': 'Soil data record not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        if request.user.role == 'farmer' and soil_data.land.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch live weather context for recommendation tuning
        weather = get_parcel_weather(soil_data.land.latitude, soil_data.land.longitude)

        report_data = evaluate_crop_recommendation(
            soil_data=soil_data,
            weather_data=weather.get('alerts') if weather else None
        )

        return Response(report_data)


class QuickAICropRecommendationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = {
            'nitrogen': float(request.data.get('nitrogen', 120)),
            'phosphorus': float(request.data.get('phosphorus', 60)),
            'potassium': float(request.data.get('potassium', 40)),
            'temperature': float(request.data.get('temperature', 25.0)),
            'humidity': float(request.data.get('humidity', 65.0)),
            'ph': float(request.data.get('ph', 6.5)),
            'rainfall': float(request.data.get('rainfall', 85.0)),
            'top_n': int(request.data.get('top_n', 5))
        }

        try:
            res = requests.post(f"{ML_ENGINE_URL}/predict/crop", json=payload, timeout=8)
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                return Response({'error': 'ML Engine prediction error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException:
            # Graceful ML fallback
            fallback_predictions = [
                {'crop_name': 'Wheat', 'confidence_score': 92.5, 'fit_category': 'Highly Recommended', 'rationale': 'Optimal fit for Rabi season cool temperatures and balanced NPK.'},
                {'crop_name': 'Maize', 'confidence_score': 84.0, 'fit_category': 'Highly Recommended', 'rationale': 'High nitrogen responsiveness and warm climate affinity.'},
                {'crop_name': 'Barley', 'confidence_score': 76.5, 'fit_category': 'Suitable', 'rationale': 'Moderate water requirement with strong soil pH tolerance.'},
                {'crop_name': 'Sunflowers', 'confidence_score': 68.0, 'fit_category': 'Suitable', 'rationale': 'Drought-resistant oilseed with flexible nutrient demands.'},
                {'crop_name': 'Tomato', 'confidence_score': 55.0, 'fit_category': 'Conditional', 'rationale': 'Requires additional potassium and micro-irrigation management.'}
            ]
            return Response({'status': 'success', 'inputs': payload, 'predictions': fallback_predictions, 'is_fallback': True})
