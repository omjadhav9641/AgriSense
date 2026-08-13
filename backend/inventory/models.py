from django.db import models

CATEGORY_CHOICES = (
    ('Seeds', 'Seeds'),
    ('Fertilizers', 'Fertilizers'),
    ('Pesticides', 'Pesticides'),
    ('Equipment', 'Equipment'),
    ('Fuel', 'Fuel'),
    ('Crops', 'Crops'),
)

class Product(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Fertilizers')
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    stock = models.IntegerField(default=100)
    reorder_level = models.IntegerField(default=20)
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - ₹{self.price_per_unit}/{self.unit} ({self.stock} in stock)"
