from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from farms.models import SoilData
from .services import generate_soil_report_pdf
from recommendations.services import evaluate_crop_recommendation

class SoilReportPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, soil_id):
        try:
            soil_data = SoilData.objects.get(id=soil_id, is_deleted=False)
        except SoilData.DoesNotExist:
            return Response({'error': 'Soil record not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'farmer' and soil_data.land.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        pdf_bytes = generate_soil_report_pdf(soil_data)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="AgriSense_Soil_Report_{soil_data.lab_reference.replace("#", "")}.pdf"'
        return response

class SoilReportJSONView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, soil_id):
        try:
            soil_data = SoilData.objects.get(id=soil_id, is_deleted=False)
        except SoilData.DoesNotExist:
            return Response({'error': 'Soil record not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'farmer' and soil_data.land.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        report_data = evaluate_crop_recommendation(soil_data)
        return Response(report_data)
