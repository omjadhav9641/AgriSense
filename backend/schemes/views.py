from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Scheme
from .serializers import SchemeSerializer
from accounts.permissions import IsManagerRole

class SchemeViewSet(viewsets.ModelViewSet):
    serializer_class = SchemeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Scheme.objects.filter(is_deleted=False)

        # Filtering parameters
        scheme_type = self.request.query_params.get('type')
        state = self.request.query_params.get('state')
        acreage = self.request.query_params.get('acreage')

        if scheme_type:
            queryset = queryset.filter(scheme_type=scheme_type)
        if state and state.lower() != 'all':
            queryset = queryset.filter(target_state__in=['All', state])
        if acreage:
            try:
                ac_val = float(acreage)
                queryset = queryset.filter(min_land_acreage__lte=ac_val, max_land_acreage__gte=ac_val)
            except ValueError:
                pass

        return queryset.order_by('scheme_type', 'title')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_24_NO_CONTENT)
