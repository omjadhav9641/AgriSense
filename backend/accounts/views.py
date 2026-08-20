from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsAdminRole

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_deleted or not self.user.is_active:
            raise serializers.ValidationError({"detail": "User account is disabled or soft deleted."})
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # Do not allow non-admin to change role via /auth/me/
        if 'role' in request.data and request.user.role != 'admin':
            mutable_data = request.data.copy()
            mutable_data.pop('role', None)
            serializer = UserSerializer(request.user, data=mutable_data, partial=True)
        else:
            serializer = UserSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        return self.patch(request)

class UserListView(generics.ListAPIView):
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    permission_classes = (IsAdminRole,)
