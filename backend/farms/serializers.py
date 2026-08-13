from rest_framework import serializers
from .models import Land, SoilData
from .services import evaluate_parameter_status, calculate_soil_health_score

class SoilDataSerializer(serializers.ModelSerializer):
    parameter_statuses = serializers.SerializerMethodField()
    health_score = serializers.SerializerMethodField()

    class Meta:
        model = SoilData
        fields = (
            'id', 'land', 'ph', 'nitrogen', 'phosphorus', 'potassium',
            'organic_carbon', 'moisture', 'sample_date', 'lab_reference',
            'tested_by', 'created_at', 'parameter_statuses', 'health_score', 'is_deleted'
        )
        read_only_fields = ('id', 'created_at', 'is_deleted')

    def get_parameter_statuses(self, obj):
        return {
            'ph': evaluate_parameter_status('Soil pH', obj.ph),
            'nitrogen': evaluate_parameter_status('Nitrogen', obj.nitrogen),
            'phosphorus': evaluate_parameter_status('Phosphorus', obj.phosphorus),
            'potassium': evaluate_parameter_status('Potassium', obj.potassium),
            'organic_carbon': evaluate_parameter_status('Organic Carbon', obj.organic_carbon),
            'moisture': evaluate_parameter_status('Moisture', obj.moisture),
        }

    def get_health_score(self, obj):
        return calculate_soil_health_score(obj)

class LandSerializer(serializers.ModelSerializer):
    latest_soil_data = serializers.SerializerMethodField()
    owner_name = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Land
        fields = (
            'id', 'land_id', 'name', 'owner', 'owner_name', 'acreage',
            'soil_type', 'location_name', 'latitude', 'longitude',
            'created_at', 'updated_at', 'latest_soil_data', 'is_deleted'
        )
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at', 'is_deleted')

    def get_latest_soil_data(self, obj):
        latest = obj.soil_records.filter(is_deleted=False).order_by('-sample_date', '-created_at').first()
        if latest:
            return SoilDataSerializer(latest).data
        return None
