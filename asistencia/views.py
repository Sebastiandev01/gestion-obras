from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from .models import RegistroAsistencia
from .serializers import RegistroAsistenciaSerializer
from .permissions import PuedeGestionarAsistencias


class RegistroAsistenciaViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroAsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = RegistroAsistencia.objects.all()

        # Usuarios normales solo ven sus registros
        if not (user.es_supervisor or user.es_arquitecto):
            queryset = queryset.filter(usuario=user)

        # Filtros por fecha
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')

        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)

        return queryset.order_by('-fecha', '-hora')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), PuedeGestionarAsistencias()]
        return [permissions.IsAuthenticated()]


class ResumenAsistenciaView(APIView):
    """
    Devuelve un resumen de asistencias agrupado por tipo
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        resumen = (
            RegistroAsistencia.objects
            .values('tipo')
            .annotate(total=Count('id'))
        )

        return Response(resumen)
