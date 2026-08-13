from django.db import models
from django.conf import settings
from farms.models import Land

class DiseaseDiagnosis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='diagnoses')
    land = models.ForeignKey(Land, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnoses')
    disease_name = models.CharField(max_length=200)
    crop_affected = models.CharField(max_length=100, default='General')
    confidence_score = models.FloatField(default=0.0)
    severity = models.CharField(max_length=20, default='Medium')
    symptoms = models.TextField(blank=True, null=True)
    treatment_guidance = models.JSONField(default=list)
    preventive_measures = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    diagnosed_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-diagnosed_at']

    def __str__(self):
        return f"{self.disease_name} ({self.crop_affected}) - {self.user.username}"
