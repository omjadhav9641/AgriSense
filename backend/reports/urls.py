from django.urls import path
from .views import SoilReportPDFView, SoilReportJSONView

urlpatterns = [
    path('pdf/<int:soil_id>/', SoilReportPDFView.as_view(), name='report_pdf'),
    path('json/<int:soil_id>/', SoilReportJSONView.as_view(), name='report_json'),
]
