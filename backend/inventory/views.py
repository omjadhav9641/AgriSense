from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from accounts.permissions import IsManagerRole

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Product.objects.filter(is_deleted=False)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)
