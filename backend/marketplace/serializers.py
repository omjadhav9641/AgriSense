from rest_framework import serializers
from .models import MarketplaceListing, ListingInquiry

class ListingInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingInquiry
        fields = '__all__'
        read_only_fields = ('id', 'listing', 'buyer', 'created_at')

class MarketplaceListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_phone = serializers.CharField(source='seller.phone', read_only=True)
    inquiries_count = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceListing
        fields = '__all__'
        read_only_fields = ('id', 'seller', 'created_at', 'updated_at', 'is_deleted')

    def get_inquiries_count(self, obj):
        return obj.inquiries.count()
