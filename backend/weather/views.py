from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from farms.models import Land
from .services import get_parcel_weather

class WeatherView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        land_id = request.query_params.get('land_id')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if land_id:
            try:
                land = Land.objects.get(id=land_id, is_deleted=False)
                lat = land.latitude
                lng = land.longitude
            except Land.DoesNotExist:
                return Response({'error': 'Land parcel not found'}, status=status.HTTP_404_NOT_FOUND)

        if not lat or not lng:
            lat = 20.5937
            lng = 78.9629

        weather_data = get_parcel_weather(float(lat), float(lng))
        return Response(weather_data)
