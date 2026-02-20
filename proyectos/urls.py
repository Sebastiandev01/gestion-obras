from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_api import ProyectoViewSet

router = DefaultRouter()
router.register(r'', ProyectoViewSet, basename='proyecto')

urlpatterns = [
    path('', include(router.urls)),
]
