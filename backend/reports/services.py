import io
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from recommendations.services import evaluate_crop_recommendation

def generate_soil_report_pdf(soil_data) -> bytes:
    report_data = evaluate_crop_recommendation(soil_data)
    
    html_content = render_to_string('soil_report_pdf.html', {'report': report_data})
    
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.BytesIO(html_content.encode('UTF-8')), dest=pdf_buffer)
    
    if pisa_status.err:
        raise Exception("Error generating soil report PDF")
        
    return pdf_buffer.getvalue()
