from django.db import models

SEASON_CHOICES = (
    ('Kharif', 'Kharif (Monsoon: Jun-Oct)'),
    ('Rabi', 'Rabi (Winter: Nov-Mar)'),
    ('Zaid', 'Zaid (Summer: Apr-May)'),
    ('All Season', 'All Season'),
)

WATER_CHOICES = (
    ('Low', 'Low'),
    ('Medium', 'Medium'),
    ('High', 'High'),
)

class Crop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='All Season')
    optimal_ph_min = models.FloatField(default=6.0)
    optimal_ph_max = models.FloatField(default=7.5)
    target_nitrogen = models.FloatField(help_text="Target N requirement in kg/acre")
    target_phosphorus = models.FloatField(help_text="Target P requirement in kg/acre")
    target_potassium = models.FloatField(help_text="Target K requirement in kg/acre")
    water_requirement = models.CharField(max_length=20, choices=WATER_CHOICES, default='Medium')
    frost_sensitive = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.season})"
