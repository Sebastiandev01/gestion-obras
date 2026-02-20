# asistencia/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistroAsistenciaViewSet, ResumenAsistenciaView

app_name = 'asistencia'

# Router principal para RegistroAsistencia
router = DefaultRouter()
router.register(r'registros', RegistroAsistenciaViewSet, basename='asistencia')

urlpatterns = [
    # Incluye todas las rutas del router
    # Ahora las rutas serán:
    # GET /api/asistencia/registros/          (lista todos)
    # POST /api/asistencia/registros/         (crea nuevo)
    # GET /api/asistencia/registros/{id}/     (detalle)
    # PUT /api/asistencia/registros/{id}/     (actualiza)
    # PATCH /api/asistencia/registros/{id}/   (actualiza parcial)
    # DELETE /api/asistencia/registros/{id}/  (elimina)
    path('', include(router.urls)),

    # Resumen de asistencia
    # GET /api/asistencia/resumen/
    path('resumen/', ResumenAsistenciaView.as_view(), name='resumen-asistencia'),
]

# También puedes agregar URLs adicionales si necesitas:
# path('buscar/', BuscarAsistenciaView.as_view(), name='buscar-asistencia'),
# path('reporte/', GenerarReporteView.as_view(), name='generar-reporte'),