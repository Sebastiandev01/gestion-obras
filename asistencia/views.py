from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django.db import IntegrityError
from .models import RegistroAsistencia
from .serializers import RegistroAsistenciaSerializer
from .permissions import PuedeGestionarAsistencias


class RegistroAsistenciaViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroAsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Usar select_related para evitar consultas N+1 al serializar `usuario`
        queryset = RegistroAsistencia.objects.select_related('usuario').all()

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

    def create(self, request, *args, **kwargs):
        """
        Override create para capturar errores de integridad (duplicados)
        y devolver mensajes amigables en caso de conflicto.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            # perform_create añade el usuario autenticado
            self.perform_create(serializer)
        except IntegrityError as e:
            return Response(
                {'error': 'Registro duplicado o conflicto: ' + str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # Si el serializer ya contiene `usuario` (por ejemplo creado por supervisor), respetarlo;
        # en caso contrario asignar el usuario autenticado.
        if serializer.validated_data.get('usuario'):
            serializer.save()
        else:
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
