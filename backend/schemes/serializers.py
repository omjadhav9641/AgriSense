from rest_framework import serializers
from .models import Scheme

class SchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scheme
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'is_deleted')
