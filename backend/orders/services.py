import uuid
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Order, OrderItem
from inventory.models import Product

try:
    from django_q.tasks import async_task
except ImportError:
    async_task = None

def send_order_confirmation_notification(order_id: int):
    """
    Async worker task (Django-Q2) to send email/SMS confirmation.
    """
    try:
        order = Order.objects.get(id=order_id)
        # Log notification delivery simulation
        print(f"[ASYNC TASK] Order Confirmation sent to {order.farmer.email or order.farmer.username} for Order #{order.order_number}")
        return True
    except Order.DoesNotExist:
        return False

def place_order_atomic(user, items_data: list, shipping_address: str) -> Order:
    """
    Places an order atomically:
    1. Validates stock availability for each item.
    2. Deducts stock.
    3. Creates Order & OrderItems.
    4. Triggers async order notification via Django-Q2.
    """
    if not items_data:
        raise ValidationError("Order must contain at least one item.")

    with transaction.atomic():
        order_number = f"AGR-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(
            order_number=order_number,
            farmer=user,
            total_amount=0.0,
            status='placed',
            shipping_address=shipping_address
        )

        total = 0.0

        for item in items_data:
            product_id = item.get('product_id')
            quantity = int(item.get('quantity', 1))

            if quantity <= 0:
                raise ValidationError("Quantity must be greater than zero.")

            try:
                product = Product.objects.select_for_update().get(id=product_id, is_deleted=False)
            except Product.DoesNotExist:
                raise ValidationError(f"Product ID {product_id} not found.")

            if product.stock < quantity:
                raise ValidationError(f"Insufficient stock for {product.name}. Available: {product.stock}, requested: {quantity}")

            # Deduct stock atomically
            product.stock -= quantity
            product.save()

            subtotal = product.price_per_unit * quantity
            total += float(subtotal)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price_per_unit,
                subtotal=subtotal
            )

        order.total_amount = total
        order.save()

    # Enqueue async notification task (falls back silently if worker queue is unavailable)
    if async_task:
        try:
            async_task('orders.services.send_order_confirmation_notification', order.id)
        except Exception as e:
            print(f"[ORDER NOTIFICATION] Task queued or skipped safely: {e}")

    return order
