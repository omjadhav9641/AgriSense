from django.test import TestCase
from django.contrib.auth import get_user_model
from farms.models import Land, SoilData
from crops.models import Crop
from .services import evaluate_crop_recommendation, evaluate_parameter_status
from datetime import date

User = get_user_model()

class RecommendationEngineTestCase(TestCase):
    def setUp(self):
        self.farmer = User.objects.create_user(username='test_farmer', role='farmer')
        self.land = Land.objects.create(
            land_id='LND-000002',
            name='Green Fields Parcel A',
            owner=self.farmer,
            acreage=25.00,
            soil_type='Loamy',
            location_name='Punjab Zone',
            latitude=30.9010,
            longitude=75.8573
        )
        self.soil = SoilData.objects.create(
            land=self.land,
            lab_reference='#000002',
            sample_date=date(2026, 8, 1),
            ph=6.5,
            nitrogen=240.0,
            phosphorus=14.0,
            potassium=140.0,
            organic_carbon=0.45,
            moisture=18.0
        )

        # Seed catalog crop Wheat
        self.crop_wheat = Crop.objects.create(
            name='Wheat',
            season='Rabi',
            optimal_ph_min=6.0,
            optimal_ph_max=7.5,
            target_nitrogen=120.0,
            target_phosphorus=60.0,
            target_potassium=40.0,
            water_requirement='Medium'
        )

    def test_parameter_status_evaluator(self):
        ph_status = evaluate_parameter_status('Soil pH', 6.5)
        self.assertEqual(ph_status['status'], 'Optimal')

        n_status = evaluate_parameter_status('Nitrogen', 240.0)
        self.assertEqual(n_status['status'], 'Low')

        p_status = evaluate_parameter_status('Phosphorus', 14.0)
        self.assertEqual(p_status['status'], 'Medium')

    def test_recommendation_engine_output_structure(self):
        result = evaluate_crop_recommendation(self.soil)
        self.assertEqual(result['lab_reference'], '#000002')
        self.assertEqual(len(result['soil_analysis_table']), 6)
        self.assertIsNotNone(result['top_recommended_crop'])
        self.assertTrue(len(result['all_evaluated_crops']) > 0)

        # Check Wheat crop breakdown
        wheat_analysis = next(c for c in result['all_evaluated_crops'] if c['crop_name'] == 'Wheat')
        self.assertIn('dosage_table', wheat_analysis)
        self.assertIn('recommended_products', wheat_analysis)
        self.assertIn('analysis', wheat_analysis)
