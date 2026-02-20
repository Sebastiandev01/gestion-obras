from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q

from .models import Proyecto
from .serializers import ProyectoSerializer

class ProyectoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión completa de proyectos
    - GET /api/proyectos/ -> listar proyectos
    - POST /api/proyectos/ -> crear proyecto
    - GET /api/proyectos/<id>/ -> detalle de proyecto
    - PUT/PATCH /api/proyectos/<id>/ -> actualizar proyecto
    - DELETE /api/proyectos/<id>/ -> eliminar proyecto
    """
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # -------------------------
    # QUERYS PERSONALIZADAS
    # -------------------------
    def get_queryset(self):
        """
        Filtrar proyectos según parámetros de consulta y rol del usuario
        """
        queryset = Proyecto.objects.all()

        # 🔐 Filtrado por rol
        if self.request.user.rol != 'ADM':  # Solo administradores ven todos
            queryset = queryset.filter(
                Q(responsable=self.request.user) |
                Q(asignados=self.request.user)
            ).distinct()

        # 🔎 Filtros de búsqueda
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion__icontains=search)
            )

        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)

        fecha_inicio = self.request.query_params.get('fecha_inicio')
        if fecha_inicio:
            queryset = queryset.filter(fecha_inicio__gte=fecha_inicio)

        fecha_fin = self.request.query_params.get('fecha_fin')
        if fecha_fin:
            queryset = queryset.filter(fecha_fin__lte=fecha_fin)

        responsable_id = self.request.query_params.get('responsable')
        if responsable_id:
            queryset = queryset.filter(responsable_id=responsable_id)

        activo = self.request.query_params.get('activo')
        if activo is not None:
            if activo.lower() in ['true', '1']:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ['false', '0']:
                queryset = queryset.filter(activo=False)

        return queryset.order_by('-fecha_creacion')

    def get_serializer_context(self):
        """
        Pasar request al serializer (NECESARIO para foto_url o campos relacionados)
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        """
        Asignar automáticamente el responsable del proyecto al crear
        """
        serializer.save(responsable=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar un proyecto con manejo robusto de permisos y errores de base de datos
        """
        try:
            # Obtener el proyecto directamente sin filtros de get_queryset
            # para evitar problemas de permisos en la eliminación
            proyecto_id = kwargs.get('pk')
            proyecto = Proyecto.objects.get(id=proyecto_id)
            
            # Verificar que solo administradores o el responsable puedan eliminar
            if request.user.rol != 'ADM' and proyecto.responsable != request.user:
                return Response(
                    {'error': 'No tiene permiso para eliminar este proyecto'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Log antes de eliminar
            proyecto_nombre = proyecto.nombre
            
            # Proceder con la eliminación (las cascadas se manejan automáticamente)
            proyecto.delete()
            
            return Response(
                {'message': f'Proyecto "{proyecto_nombre}" eliminado correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Proyecto.DoesNotExist:
            return Response(
                {'error': 'El proyecto no existe'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            # Log detallado del error
            error_detail = str(e)
            traceback.print_exc()
            
            return Response(
                {'error': f'Error al eliminar proyecto: {error_detail}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # -------------------------
    # ACCIONES PERSONALIZADAS
    # -------------------------
    @action(detail=True, methods=['post'])
    def asignar_personal(self, request, pk=None):
        """
        Asignar usuarios a un proyecto
        POST /api/proyectos/<id>/asignar_personal/
        {
            "usuarios_ids": [1,2,3]
        }
        """
        proyecto = self.get_object()
        usuarios_ids = request.data.get('usuarios_ids', [])

        if not usuarios_ids:
            return Response(
                {'error': 'Debe enviar una lista de IDs de usuarios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        proyecto.asignados.set(usuarios_ids)
        return Response({
            'message': 'Personal asignado correctamente',
            'total_asignados': proyecto.asignados.count()
        })

    @action(detail=True, methods=['get'])
    def personal_asignado(self, request, pk=None):
        """
        Listar usuarios asignados al proyecto
        GET /api/proyectos/<id>/personal_asignado/
        """
        proyecto = self.get_object()
        asignados = proyecto.asignados.all()

        from usuarios.serializers import UserBasicSerializer
        serializer = UserBasicSerializer(asignados, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Estadísticas generales de proyectos
        GET /api/proyectos/estadisticas/
        """
        total = Proyecto.objects.count()
        activos = Proyecto.objects.filter(activo=True).count()

        estados = {}
        for estado, display in Proyecto.ESTADO_CHOICES:
            estados[estado] = {
                'label': display,
                'count': Proyecto.objects.filter(estado=estado).count()
            }

        return Response({
            'total_proyectos': total,
            'proyectos_activos': activos,
            'por_estado': estados
        })
