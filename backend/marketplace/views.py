from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MarketplaceListing, ListingInquiry
from .serializers import MarketplaceListingSerializer, ListingInquirySerializer

class MarketplaceListingViewSet(viewsets.ModelViewSet):
    serializer_class = MarketplaceListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = MarketplaceListing.objects.filter(is_deleted=False)
        crop = self.request.query_params.get('crop')
        location = self.request.query_params.get('location')
        status_param = self.request.query_params.get('status', 'Active')
        my_listings = self.request.query_params.get('my_listings')

        if my_listings and self.request.user.is_authenticated:
            queryset = queryset.filter(seller=self.request.user)
        else:
            if status_param != 'All':
                queryset = queryset.filter(status=status_param)

        if crop and crop != 'All':
            queryset = queryset.filter(crop_name__icontains=crop)
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            seller=self.request.user,
            contact_phone=self.request.data.get('contact_phone', self.request.user.phone or '')
        )

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def inquire(self, request, pk=None):
        listing = self.get_object()
        serializer = ListingInquirySerializer(data=request.data)
        if serializer.is_valid():
            buyer_user = request.user if request.user.is_authenticated else None
            serializer.save(listing=listing, buyer=buyer_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
