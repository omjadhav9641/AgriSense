from django.urls import path
from .views import RecommendationAPIView, QuickAICropRecommendationView

urlpatterns = [
    path('quick-ai/', QuickAICropRecommendationView.as_view(), name='recommendation_quick_ai'),
    path('evaluate/<int:soil_id>/', RecommendationAPIView.as_view(), name='recommendation_evaluate'),
    path('evaluate/', RecommendationAPIView.as_view(), name='recommendation_evaluate_query'),
]
