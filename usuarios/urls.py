from django.urls import path
from django.http import JsonResponse

# Placeholder para URLs de usuarios
# TODO: Implementar vistas adicionales cuando estén disponibles
# Nota: Las vistas de autenticación (LoginView, LogoutView, CustomTokenObtainPairView)
# están siendo importadas directamente en backend/urls.py
urlpatterns = [
    # Las vistas adicionales de usuarios se implementarán aquí
    # Por ahora, retornamos un mensaje temporal
    path('', lambda request: JsonResponse({
        'detail': 'Usuarios API - Las vistas se implementarán próximamente'
    })),
]
