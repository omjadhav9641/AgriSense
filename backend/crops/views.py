from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Crop
from .serializers import CropSerializer
from accounts.permissions import IsManagerRole

class CropViewSet(viewsets.ModelViewSet):
    serializer_class = CropSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Crop.objects.filter(is_deleted=False).order_by('name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)
