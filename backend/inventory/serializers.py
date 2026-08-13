from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'price_per_unit', 'unit',
            'stock', 'reorder_level', 'description', 'image_url',
            'created_at', 'is_low_stock', 'is_deleted'
        )
        read_only_fields = ('id', 'created_at', 'is_deleted')

    def get_is_low_stock(self, obj):
        return obj.stock <= obj.reorder_level
