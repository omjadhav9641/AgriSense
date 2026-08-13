from django.db import models
from django.conf import settings

SOIL_TYPES = (
    ('Alluvial', 'Alluvial Soil'),
    ('Black', 'Black Soil'),
    ('Red', 'Red Soil'),
    ('Loamy', 'Loamy Soil'),
    ('Clay', 'Clay Soil'),
    ('Sandy', 'Sandy Soil'),
    ('Laterite', 'Laterite Soil'),
)

class Land(models.Model):
    land_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lands')
    acreage = models.DecimalField(max_digits=8, decimal_places=2)
    soil_type = models.CharField(max_length=50, choices=SOIL_TYPES, default='Loamy')
    location_name = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.land_id}) - {self.acreage} Acres"

class SoilData(models.Model):
    land = models.ForeignKey(Land, on_delete=models.CASCADE, related_name='soil_records')
    ph = models.FloatField(help_text="Soil pH (e.g. 6.5)")
    nitrogen = models.FloatField(help_text="Nitrogen in ppm")
    phosphorus = models.FloatField(help_text="Phosphorus in ppm")
    potassium = models.FloatField(help_text="Potassium in ppm")
    organic_carbon = models.FloatField(help_text="Organic Carbon in %")
    moisture = models.FloatField(help_text="Moisture in %")
    sample_date = models.DateField()
    lab_reference = models.CharField(max_length=50, default="#000001")
    tested_by = models.CharField(max_length=100, default="Central Agri Lab")
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Soil Record {self.lab_reference} for {self.land.name} ({self.sample_date})"
