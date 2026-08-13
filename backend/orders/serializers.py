from rest_framework import serializers
from .models import Order, OrderItem
from inventory.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_id', 'quantity', 'unit_price', 'subtotal')
        read_only_fields = ('id', 'unit_price', 'subtotal')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    farmer_name = serializers.ReadOnlyField(source='farmer.username')

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'farmer', 'farmer_name', 'total_amount',
            'status', 'shipping_address', 'created_at', 'updated_at', 'items', 'is_deleted'
        )
        read_only_fields = ('id', 'order_number', 'farmer', 'total_amount', 'created_at', 'updated_at', 'is_deleted')
