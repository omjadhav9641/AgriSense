from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order
from .serializers import OrderSerializer
from .services import place_order_atomic

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.filter(is_deleted=False)
        if user.role == 'farmer':
            queryset = queryset.filter(farmer=user)
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        shipping_address = request.data.get('shipping_address', request.user.address or 'Standard Farm Address')
        
        order = place_order_atomic(
            user=request.user,
            items_data=items_data,
            shipping_address=shipping_address
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        if request.user.role not in ['admin', 'manager']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()
        return Response(self.get_serializer(order).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)
