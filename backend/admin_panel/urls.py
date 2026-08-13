from django.urls import path
from .views import (
    AuditLogListView,
    PromoteDemoteRoleView,
    SoftDeleteRestoreView,
    CSVExportView,
    AdminAnalyticsView,
    UserAdminListView,
    ToggleUserStatusView,
    FarmerDetailView,
    MarketplaceModerationView,
    InventoryOversightView,
    SoftDeletedListView,
)

urlpatterns = [
    path('analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('users/', UserAdminListView.as_view(), name='admin_users_list'),
    path('users/<int:user_id>/', FarmerDetailView.as_view(), name='admin_farmer_detail'),
    path('toggle-user-status/', ToggleUserStatusView.as_view(), name='admin_toggle_user_status'),
    path('promote-demote/', PromoteDemoteRoleView.as_view(), name='admin_promote_demote'),
    path('marketplace/', MarketplaceModerationView.as_view(), name='admin_marketplace_moderation'),
    path('inventory/', InventoryOversightView.as_view(), name='admin_inventory_oversight'),
    path('soft-deleted/', SoftDeletedListView.as_view(), name='admin_soft_deleted_list'),
    path('manage-soft-delete/', SoftDeleteRestoreView.as_view(), name='admin_soft_delete_restore'),
    path('audit-logs/', AuditLogListView.as_view(), name='admin_audit_logs'),
    path('export/<str:entity_type>/', CSVExportView.as_view(), name='admin_csv_export'),
]
