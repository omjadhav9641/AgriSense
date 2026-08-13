from rest_framework.routers import DefaultRouter
from .views import SchemeViewSet

router = DefaultRouter()
router.register(r'', SchemeViewSet, basename='scheme')

urlpatterns = router.urls
