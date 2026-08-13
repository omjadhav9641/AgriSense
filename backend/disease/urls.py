from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiagnoseLeafView, DiseaseHistoryViewSet

router = DefaultRouter()
router.register(r'history', DiseaseHistoryViewSet, basename='disease-history')

urlpatterns = [
    path('diagnose/', DiagnoseLeafView.as_view(), name='disease-diagnose'),
    path('', include(router.urls)),
]
