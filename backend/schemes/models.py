from django.db import models

SCHEME_TYPES = (
    ('portal', 'Government Portal'),
    ('helpline', 'Emergency Helpline'),
    ('subsidy', 'Insurance & Subsidy'),
    ('advisory', 'Weather & Crop Advisory'),
)

class Scheme(models.Model):
    title = models.CharField(max_length=200)
    scheme_type = models.CharField(max_length=50, choices=SCHEME_TYPES, default='subsidy')
    description = models.TextField()
    link = models.URLField(blank=True, null=True)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    min_land_acreage = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    max_land_acreage = models.DecimalField(max_digits=6, decimal_places=2, default=1000.0)
    target_state = models.CharField(max_length=100, default='All')
    crop_category = models.CharField(max_length=100, default='All')
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.get_scheme_type_display()})"
