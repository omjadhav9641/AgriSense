from django.db import models
from django.conf import settings

STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Sold', 'Sold'),
    ('Closed', 'Closed'),
)

class MarketplaceListing(models.Model):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='produce_listings')
    title = models.CharField(max_length=200)
    crop_name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Quantity available (e.g. 50 Quintals / 500 kg)")
    unit = models.CharField(max_length=20, default='Quintals')
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=200, help_text="District / State / City")
    harvest_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    contact_phone = models.CharField(max_length=30, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.quantity} {self.unit} @ ₹{self.price_per_unit}/{self.unit} ({self.seller.username})"


class ListingInquiry(models.Model):
    listing = models.ForeignKey(MarketplaceListing, on_delete=models.CASCADE, related_name='inquiries')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    buyer_name = models.CharField(max_length=150)
    buyer_contact = models.CharField(max_length=100)
    message = models.TextField()
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry for {self.listing.title} from {self.buyer_name}"
