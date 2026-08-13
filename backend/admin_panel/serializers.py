from rest_framework import serializers
from .models import AdminLog

class AdminLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.ReadOnlyField(source='performed_by.username')

    class Meta:
        model = AdminLog
        fields = ('id', 'action', 'entity_name', 'entity_id', 'performed_by', 'performed_by_name', 'details', 'timestamp')
        read_only_fields = ('id', 'timestamp')
