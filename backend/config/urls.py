from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/farms/', include('farms.urls')),
    path('api/crops/', include('crops.urls')),
    path('api/recommendations/', include('recommendations.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/schemes/', include('schemes.urls')),
    path('api/admin-panel/', include('admin_panel.urls')),
    path('api/disease/', include('disease.urls')),
    path('api/marketplace/', include('marketplace.urls')),
]
