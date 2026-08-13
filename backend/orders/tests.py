from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from inventory.models import Product
from orders.services import place_order_atomic

User = get_user_model()

class OrderCheckoutTestCase(TestCase):
    def setUp(self):
        self.farmer = User.objects.create_user(username='checkout_farmer', role='farmer')
        self.product = Product.objects.create(
            name='Urea (46% N)',
            category='Fertilizers',
            price_per_unit=250.00,
            unit='50kg Bag',
            stock=10,
            reorder_level=5
        )

    def test_successful_atomic_checkout(self):
        items = [{'product_id': self.product.id, 'quantity': 3}]
        order = place_order_atomic(self.farmer, items, 'Test Address')
        
        self.assertEqual(order.farmer, self.farmer)
        self.assertEqual(float(order.total_amount), 750.0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7) # 10 - 3

    def test_insufficient_stock_rollback(self):
        items = [{'product_id': self.product.id, 'quantity': 15}] # Requests 15, stock is 10
        with self.assertRaises(ValidationError):
            place_order_atomic(self.farmer, items, 'Test Address')

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10) # Stock remains unchanged
