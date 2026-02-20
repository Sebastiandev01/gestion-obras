from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_api import NominaViewSet

router = DefaultRouter()
router.register(r'', NominaViewSet, basename='nomina')

urlpatterns = [
    path('', include(router.urls)),
]
