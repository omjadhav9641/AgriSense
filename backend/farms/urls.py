from rest_framework.routers import DefaultRouter
from .views import LandViewSet, SoilDataViewSet

router = DefaultRouter()
router.register(r'lands', LandViewSet, basename='land')
router.register(r'soil-records', SoilDataViewSet, basename='soildata')

urlpatterns = router.urls
