from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarketplaceListingViewSet

router = DefaultRouter()
router.register(r'listings', MarketplaceListingViewSet, basename='marketplace-listing')

urlpatterns = [
    path('', include(router.urls)),
]
