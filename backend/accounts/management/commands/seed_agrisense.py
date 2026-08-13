from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from farms.models import Land, SoilData
from crops.models import Crop
from inventory.models import Product
from schemes.models import Scheme
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial data for AgriSense (users, Section 5 baseline soil report, crops, products, schemes)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding AgriSense database...")

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@agrisense.org', 'role': 'admin', 'first_name': 'System', 'last_name': 'Admin'}
        )
        admin_user.set_password('admin123')
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.save()

        manager_user, _ = User.objects.get_or_create(
            username='manager',
            defaults={'email': 'manager@agrisense.org', 'role': 'manager', 'first_name': 'Agronomy', 'last_name': 'Manager'}
        )
        manager_user.set_password('manager123')
        manager_user.save()

        agro_user, _ = User.objects.get_or_create(
            username='agronomist',
            defaults={'email': 'agronomist@agrisense.org', 'role': 'agronomist', 'first_name': 'Dr. Sharma', 'last_name': 'Agronomist'}
        )
        agro_user.set_password('agronomist123')
        agro_user.save()

        farmer_user, _ = User.objects.get_or_create(
            username='om',
            defaults={'email': 'om@farmer.org', 'role': 'farmer', 'first_name': 'Om', 'last_name': 'Patel', 'phone': '+91 9876543210', 'address': 'Farm Block 4, Agrisense Zone', 'state': 'Punjab'}
        )
        farmer_user.set_password('farmer123')
        farmer_user.save()

        self.stdout.write("Created demo users (admin, manager, agronomist, om).")

        # 2. Crops (9 Crops with accurate high-res imagery)
        crops_data = [
            {'name': 'Wheat', 'season': 'Rabi', 'optimal_ph_min': 6.0, 'optimal_ph_max': 7.5, 'target_nitrogen': 120.0, 'target_phosphorus': 60.0, 'target_potassium': 40.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Rice', 'season': 'Kharif', 'optimal_ph_min': 5.5, 'optimal_ph_max': 7.0, 'target_nitrogen': 150.0, 'target_phosphorus': 60.0, 'target_potassium': 60.0, 'water_requirement': 'High', 'image_url': 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Sugarcane', 'season': 'All Season', 'optimal_ph_min': 6.0, 'optimal_ph_max': 8.0, 'target_nitrogen': 250.0, 'target_phosphorus': 100.0, 'target_potassium': 120.0, 'water_requirement': 'High', 'image_url': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Sunflowers', 'season': 'Kharif', 'optimal_ph_min': 6.0, 'optimal_ph_max': 7.5, 'target_nitrogen': 80.0, 'target_phosphorus': 60.0, 'target_potassium': 40.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Potato', 'season': 'Rabi', 'optimal_ph_min': 5.5, 'optimal_ph_max': 6.5, 'target_nitrogen': 180.0, 'target_phosphorus': 100.0, 'target_potassium': 150.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Maize', 'season': 'Kharif', 'optimal_ph_min': 5.8, 'optimal_ph_max': 7.0, 'target_nitrogen': 120.0, 'target_phosphorus': 60.0, 'target_potassium': 50.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Tomato', 'season': 'Zaid', 'optimal_ph_min': 6.0, 'optimal_ph_max': 6.8, 'target_nitrogen': 140.0, 'target_phosphorus': 80.0, 'target_potassium': 100.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Cotton', 'season': 'Kharif', 'optimal_ph_min': 6.0, 'optimal_ph_max': 8.0, 'target_nitrogen': 120.0, 'target_phosphorus': 60.0, 'target_potassium': 60.0, 'water_requirement': 'Medium', 'image_url': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Barley', 'season': 'Rabi', 'optimal_ph_min': 6.0, 'optimal_ph_max': 7.5, 'target_nitrogen': 90.0, 'target_phosphorus': 40.0, 'target_potassium': 30.0, 'water_requirement': 'Low', 'image_url': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'},
        ]

        for cd in crops_data:
            crop, created = Crop.objects.get_or_create(name=cd['name'], defaults=cd)
            if not created:
                for key, value in cd.items():
                    setattr(crop, key, value)
                crop.save()

        self.stdout.write("Seeded 9 Crop Catalog records with accurate high-res imagery.")

        # 3. Baseline Land & Soil Data reproducing Section 5 Report #000002
        land, _ = Land.objects.get_or_create(
            land_id='LND-000002',
            defaults={
                'name': 'Green Fields Parcel A',
                'owner': farmer_user,
                'acreage': 25.00,
                'soil_type': 'Loamy',
                'location_name': 'Punjab Agrisense Zone',
                'latitude': 30.9010,
                'longitude': 75.8573,
            }
        )

        soil_record, _ = SoilData.objects.get_or_create(
            lab_reference='#000002',
            defaults={
                'land': land,
                'sample_date': date(2026, 8, 1),
                'tested_by': 'Punjab Central Soil Testing Lab',
                'ph': 6.5,
                'nitrogen': 240.0,
                'phosphorus': 14.0,
                'potassium': 140.0,
                'organic_carbon': 0.45,
                'moisture': 18.0,
            }
        )

        self.stdout.write("Seeded Land 'LND-000002' and Soil Record '#000002' matching Section 5 baseline.")

        # 4. Products (with accurate high-res imagery)
        products_data = [
            {'name': 'Urea (46% N)', 'category': 'Fertilizers', 'price_per_unit': 266.50, 'unit': '50kg Bag', 'stock': 250, 'reorder_level': 30, 'description': 'High-nitrogen fertilizer for split top dressing.', 'image_url': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Single Super Phosphate - SSP (16% P2O5)', 'category': 'Fertilizers', 'price_per_unit': 380.00, 'unit': '50kg Bag', 'stock': 180, 'reorder_level': 25, 'description': 'Essential phosphate fertilizer for basal application.', 'image_url': 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Muriate of Potash - MOP (60% K2O)', 'category': 'Fertilizers', 'price_per_unit': 1700.00, 'unit': '50kg Bag', 'stock': 120, 'reorder_level': 15, 'description': 'Potash source for root development and crop quality.', 'image_url': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80'},
            {'name': 'DAP (Diammonium Phosphate)', 'category': 'Fertilizers', 'price_per_unit': 1350.00, 'unit': '50kg Bag', 'stock': 15, 'reorder_level': 20, 'description': 'Dual-nutrient N & P fertilizer.', 'image_url': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'},
            {'name': 'HD-2967 High Yield Wheat Seeds', 'category': 'Seeds', 'price_per_unit': 850.00, 'unit': '40kg Bag', 'stock': 90, 'reorder_level': 10, 'description': 'Certified disease-resistant Rabi wheat seed variety.', 'image_url': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'},
            {'name': 'Drip Irrigation Starter Kit', 'category': 'Equipment', 'price_per_unit': 4500.00, 'unit': 'Set', 'stock': 8, 'reorder_level': 5, 'description': 'Precision micro-drip irrigation system for 1 acre.', 'image_url': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'},
        ]

        for pd in products_data:
            product, created = Product.objects.get_or_create(name=pd['name'], defaults=pd)
            if not created:
                for key, value in pd.items():
                    setattr(product, key, value)
                product.save()

        self.stdout.write("Seeded E-Commerce Products.")

        # 5. Government Schemes & Portals
        schemes_data = [
            {'title': 'e-NAM (National Agriculture Market)', 'scheme_type': 'portal', 'description': 'Pan-India electronic trading portal networking existing APMC mandis to create a unified national market.', 'link': 'https://www.enam.gov.in'},
            {'title': 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'scheme_type': 'subsidy', 'description': 'Direct income support of Rs. 6000 per year to small and marginal farmer families.', 'link': 'https://pmkisan.gov.in', 'min_land_acreage': 0.0, 'max_land_acreage': 10.0},
            {'title': 'Soil Health Card Scheme', 'scheme_type': 'portal', 'description': 'Government portal for issue of soil health cards to farmers with crop-wise nutrient advisories.', 'link': 'https://soilhealth.dac.gov.in'},
            {'title': 'Kisan Call Center Helpline', 'scheme_type': 'helpline', 'description': 'Free expert toll-free advisory line available 6:00 AM to 10:00 PM daily in 22 regional languages.', 'contact_number': '1800-180-1551'},
            {'title': 'Agriculture Emergency Support', 'scheme_type': 'helpline', 'description': 'Disaster & flood response hotline for agricultural crop protection.', 'contact_number': '1077'},
            {'title': 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', 'scheme_type': 'subsidy', 'description': 'Comprehensive crop insurance against drought, flood, and localized calamities.', 'link': 'https://pmfby.gov.in'},
            {'title': 'Meghdoot & Damini Weather App', 'scheme_type': 'advisory', 'description': 'Official IMD agro-met advisories and real-time lightning strike alert network.', 'link': 'https://mausam.imd.gov.in'},
        ]

        for sd in schemes_data:
            Scheme.objects.get_or_create(title=sd['title'], defaults=sd)

        self.stdout.write("Seeded Government Resources & Portals successfully.")

        # 6. Marketplace Produce Listings (Farmer-to-Buyer)
        from marketplace.models import MarketplaceListing
        marketplace_data = [
            {
                'title': 'Premium Sharbati Wheat Grain Batch',
                'crop_name': 'Wheat',
                'quantity': 60.00,
                'unit': 'Quintals',
                'price_per_unit': 2450.00,
                'location': 'Ludhiana, Punjab',
                'description': 'Sun-dried premium grade Sharbati wheat, harvested directly from Green Fields Parcel A. High gluten content.',
                'image_url': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
                'contact_phone': '+91 9876543210'
            },
            {
                'title': 'Organic Basmati Paddy Rice',
                'crop_name': 'Rice',
                'quantity': 100.00,
                'unit': 'Quintals',
                'price_per_unit': 3850.00,
                'location': 'Karnal, Haryana',
                'description': 'Aromatic 1121 Extra Long Grain Basmati Rice. Chemical-free organic cultivation.',
                'image_url': 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
                'contact_phone': '+91 9876543210'
            },
            {
                'title': 'Fresh Farm Red Tomatoes',
                'crop_name': 'Tomato',
                'quantity': 35.00,
                'unit': 'Quintals',
                'price_per_unit': 1800.00,
                'location': 'Jalandhar, Punjab',
                'description': 'Grade-A firm ripe red tomatoes ready for bulk market distribution.',
                'image_url': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
                'contact_phone': '+91 9876543210'
            }
        ]

        for md in marketplace_data:
            MarketplaceListing.objects.get_or_create(
                title=md['title'],
                defaults={'seller': farmer_user, **md}
            )

        self.stdout.write("Seeded Farmer Produce Marketplace Listings successfully.")
        self.stdout.write(self.style.SUCCESS("AgriSense Seeding Complete!"))
