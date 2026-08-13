from rest_framework import serializers
from .models import DiseaseDiagnosis

class DiseaseDiagnosisSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='user.username', read_only=True)
    land_name = serializers.CharField(source='land.name', read_only=True, default=None)

    class Meta:
        model = DiseaseDiagnosis
        fields = '__all__'
        read_only_fields = ('id', 'user', 'diagnosed_at', 'is_deleted')
