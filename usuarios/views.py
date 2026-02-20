from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from .serializers import UsuarioSerializer
from .models import Usuario


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para obtener tokens JWT con información del usuario"""
    
    def post(self, request, *args, **kwargs):
        # Validar credenciales
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.user
        refresh = RefreshToken.for_user(user)
        
        # Serializar información del usuario
        user_serializer = UsuarioSerializer(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        })


class LoginView(APIView):
    """Vista para login (deprecated, usar CustomTokenObtainPairView)"""
    
    def post(self, request):
        return Response(
            {'detail': 'Use /api/auth/login/ endpoint'},
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    """Vista para logout"""
    
    def post(self, request):
        try:
            # Obtener el refresh token del body
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                # Invalidar el refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Cerrar sesión
            logout(request)
            
            return Response(
                {'detail': 'Sesión cerrada exitosamente'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': 'Error al cerrar sesión', 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
