import csv
from io import StringIO
from .models import AdminLog
from django.contrib.auth import get_user_model
from farms.models import Land, SoilData
from inventory.models import Product
from orders.models import Order
from crops.models import Crop
from marketplace.models import MarketplaceListing
from disease.models import DiseaseDiagnosis

User = get_user_model()

def log_admin_action(user, action: str, entity_name: str, entity_id: str = None, details: str = None):
    AdminLog.objects.create(
        performed_by=user,
        action=action,
        entity_name=entity_name,
        entity_id=str(entity_id) if entity_id else "",
        details=details or ""
    )

MODEL_MAP = {
    'user': User,
    'farmer': User,
    'land': Land,
    'soildata': SoilData,
    'product': Product,
    'order': Order,
    'crop': Crop,
    'marketplacelisting': MarketplaceListing,
    'marketplace': MarketplaceListing,
    'diseasediagnosis': DiseaseDiagnosis,
    'disease': DiseaseDiagnosis,
}

def toggle_soft_delete(entity_type: str, entity_id: int, restore: bool = False, performed_by=None) -> bool:
    model_cls = MODEL_MAP.get(entity_type.lower())
    if not model_cls:
        return False
    try:
        obj = model_cls.objects.get(id=entity_id)
        if hasattr(obj, 'is_deleted'):
            obj.is_deleted = not restore
            obj.save()
        elif hasattr(obj, 'is_active'):
            obj.is_active = restore
            obj.save()
        else:
            return False

        action = 'RESTORE' if restore else 'DELETE'
        log_admin_action(performed_by, action, entity_type, str(entity_id), f"Soft-delete status set to is_deleted={not restore}")
        return True
    except model_cls.DoesNotExist:
        return False

def generate_csv_export(entity_type: str, performed_by=None) -> str:
    output = StringIO()
    writer = csv.writer(output)

    if entity_type.lower() == 'farmers':
        farmers = User.objects.filter(role='farmer', is_deleted=False)
        writer.writerow(['ID', 'Username', 'Email', 'Phone', 'State', 'Date Joined'])
        for f in farmers:
            writer.writerow([f.id, f.username, f.email, f.phone, f.state, f.date_joined])

    elif entity_type.lower() == 'orders':
        orders = Order.objects.filter(is_deleted=False)
        writer.writerow(['ID', 'Order Number', 'Farmer', 'Total Amount', 'Status', 'Date'])
        for o in orders:
            writer.writerow([o.id, o.order_number, o.farmer.username, o.total_amount, o.status, o.created_at])

    elif entity_type.lower() == 'products':
        products = Product.objects.filter(is_deleted=False)
        writer.writerow(['ID', 'Name', 'Category', 'Price', 'Stock', 'Reorder Level'])
        for p in products:
            writer.writerow([p.id, p.name, p.category, p.price_per_unit, p.stock, p.reorder_level])

    elif entity_type.lower() == 'crops':
        crops = Crop.objects.filter(is_deleted=False)
        writer.writerow(['ID', 'Name', 'Season', 'Target N', 'Target P', 'Target K', 'Optimal pH Min', 'Optimal pH Max'])
        for c in crops:
            writer.writerow([c.id, c.name, c.season, c.target_nitrogen, c.target_phosphorus, c.target_potassium, c.optimal_ph_min, c.optimal_ph_max])

    log_admin_action(performed_by, 'EXPORT', entity_type, details=f"Exported CSV for {entity_type}")
    return output.getvalue()
