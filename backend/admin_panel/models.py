from django.db import models
from django.conf import settings

ACTION_CHOICES = (
    ('CREATE', 'CREATE'),
    ('UPDATE', 'UPDATE'),
    ('DELETE', 'DELETE'),
    ('RESTORE', 'RESTORE'),
    ('EXPORT', 'EXPORT'),
)

class AdminLog(models.Model):
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    entity_name = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.performed_by} - {self.action} on {self.entity_name} ({self.entity_id})"
