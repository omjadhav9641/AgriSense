from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Land, SoilData
from .serializers import LandSerializer, SoilDataSerializer

class LandViewSet(viewsets.ModelViewSet):
    serializer_class = LandSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Land.objects.filter(is_deleted=False)
        if user.role == 'farmer':
            queryset = queryset.filter(owner=user)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)

class SoilDataViewSet(viewsets.ModelViewSet):
    serializer_class = SoilDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = SoilData.objects.filter(is_deleted=False)
        if user.role == 'farmer':
            queryset = queryset.filter(land__owner=user)
        
        land_id = self.request.query_params.get('land')
        if land_id:
            queryset = queryset.filter(land_id=land_id)

        return queryset.order_by('-sample_date', '-created_at')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)
