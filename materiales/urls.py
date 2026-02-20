from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_api import (
    MaterialViewSet,
    CategoriaMaterialViewSet,
    ProveedorViewSet
)

router = DefaultRouter()

router.register(r'materiales', MaterialViewSet, basename='material')
router.register(r'categorias', CategoriaMaterialViewSet, basename='categoria-material')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')

urlpatterns = [
    path('', include(router.urls)),
]
