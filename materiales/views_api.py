from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.db import models
from decimal import Decimal
from .models import Material, CategoriaMaterial, Proveedor
from .serializers import MaterialSerializer, CategoriaMaterialSerializer, ProveedorSerializer
import logging
from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger(__name__)

class MaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar materiales con depuración mejorada
    """
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def get_queryset(self):
        """
        Obtener materiales con filtros opcionales
        """
        try:
            logger.debug(f"🔍 Obteniendo materiales con parámetros: {self.request.query_params}")
            queryset = Material.objects.all()
            
            # Filtros
            categoria = self.request.query_params.get('categoria', None)
            if categoria:
                logger.debug(f"Filtrando por categoría: {categoria}")
                queryset = queryset.filter(categoria=categoria)
                
            # Búsqueda por nombre o descripción
            search = self.request.query_params.get('search', None)
            if search:
                logger.debug(f"Buscando: {search}")
                queryset = queryset.filter(
                    models.Q(nombre__icontains=search) |
                    models.Q(descripcion__icontains=search) |
                    models.Q(codigo__icontains=search)
                )
                
            result = queryset.select_related('categoria', 'proveedor')
            logger.debug(f"✅ Materiales encontrados: {result.count()}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error al obtener materiales: {str(e)}")
            # No lanzar excepción aquí, solo devolver queryset vacío
            return Material.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Sobrescribir create para mejor manejo de errores
        """
        try:
            logger.info("📥 Iniciando creación de material")
            logger.debug(f"Datos recibidos: {request.data}")
            
            # Validar datos básicos
            if 'nombre' not in request.data or not request.data['nombre'].strip():
                error_msg = "El nombre del material es requerido"
                logger.warning(f"Validación fallida: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Usar el serializer
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"❌ Serializer inválido: {serializer.errors}")
                return Response(
                    {'error': 'Datos inválidos', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar el material
            logger.debug("Serializer válido, procediendo a guardar...")
            material = serializer.save()
            logger.info(f"✅ Material creado exitosamente: {material.id} - {material.nombre}")
            
            # Devolver respuesta
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except DjangoValidationError as e:
            logger.error(f"❌ Error de validación de Django: {str(e)}")
            return Response(
                {'error': 'Error de validación', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Error inesperado al crear material: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor al crear el material'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Sobrescribir update para mejor manejo de errores
        """
        try:
            logger.info(f"📝 Iniciando actualización de material {kwargs.get('pk')}")
            logger.debug(f"Datos recibidos: {request.data}")
            
            # Obtener instancia
            instance = self.get_object()
            
            # Validar datos básicos
            if 'nombre' in request.data and not request.data['nombre'].strip():
                error_msg = "El nombre del material es requerido"
                logger.warning(f"Validación fallida: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Usar el serializer
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if not serializer.is_valid():
                logger.warning(f"❌ Serializer inválido: {serializer.errors}")
                return Response(
                    {'error': 'Datos inválidos', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar cambios
            logger.debug("Serializer válido, procediendo a actualizar...")
            material = serializer.save()
            logger.info(f"✅ Material actualizado exitosamente: {material.id} - {material.nombre}")
            
            return Response(serializer.data)
            
        except DjangoValidationError as e:
            logger.error(f"❌ Error de validación de Django: {str(e)}")
            return Response(
                {'error': 'Error de validación', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Error inesperado al actualizar material: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor al actualizar el material'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """
        Método original de perform_create - Mantener para compatibilidad
        """
        try:
            logger.debug("Ejecutando perform_create...")
            if not serializer.validated_data.get('nombre'):
                raise serializers.ValidationError("El nombre es requerido")
            
            material = serializer.save()
            logger.info(f"Material guardado en perform_create: {material.nombre}")
            return material
        except DjangoValidationError as e:
            logger.error(f"Error de validación Django en perform_create: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error en perform_create: {str(e)}")
            raise serializers.ValidationError(f"Error al crear el material: {str(e)}")

    def perform_update(self, serializer):
        """
        Método original de perform_update - Mantener para compatibilidad
        """
        try:
            logger.debug("Ejecutando perform_update...")
            if not serializer.validated_data.get('nombre'):
                raise serializers.ValidationError("El nombre es requerido")
            
            material = serializer.save()
            logger.info(f"Material actualizado en perform_update: {material.nombre}")
            return material
        except DjangoValidationError as e:
            logger.error(f"Error de validación Django en perform_update: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error en perform_update: {str(e)}")
            raise serializers.ValidationError(f"Error al actualizar el material: {str(e)}")

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Endpoint para obtener estadísticas de materiales
        """
        try:
            logger.info("📊 Generando estadísticas de materiales")
            
            total_materiales = Material.objects.count()
            logger.debug(f"Total materiales: {total_materiales}")
            
            total_valor = Material.objects.aggregate(
                total=Sum(F('cantidad') * F('precio_unitario'))
            )['total'] or 0
            
            stock_bajo = Material.objects.filter(
                cantidad__lt=F('stock_minimo')
            ).count()
            
            stock_critico = Material.objects.filter(
                cantidad__lt=F('stock_minimo') * Decimal('0.3')
            ).count()
            
            materiales_por_categoria = Material.objects.values(
                'categoria__nombre'
            ).annotate(
                total=Count('id')
            ).order_by('-total')
            
            logger.info("✅ Estadísticas generadas exitosamente")
            
            return Response({
                'total_materiales': total_materiales,
                'total_valor': float(total_valor),
                'stock_bajo': stock_bajo,
                'stock_critico': stock_critico,
                'materiales_por_categoria': list(materiales_por_categoria)
            })
            
        except Exception as e:
            logger.error(f"❌ Error al obtener estadísticas: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error al generar estadísticas', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CategoriaMaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías de materiales
    """
    queryset = CategoriaMaterial.objects.all()
    serializer_class = CategoriaMaterialSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Sobrescribir create para mejor manejo de errores
        """
        try:
            logger.info("📥 Iniciando creación de categoría")
            logger.debug(f"Datos recibidos: {request.data}")
            
            # Validar datos básicos
            if 'nombre' not in request.data or not request.data['nombre'].strip():
                error_msg = "El nombre de la categoría es requerido"
                logger.warning(f"Validación fallida: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Usar el serializer
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"❌ Serializer inválido: {serializer.errors}")
                return Response(
                    {'error': 'Datos inválidos', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar
            categoria = serializer.save()
            logger.info(f"✅ Categoría creada exitosamente: {categoria.id} - {categoria.nombre}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except DjangoValidationError as e:
            logger.error(f"❌ Error de validación de Django: {str(e)}")
            return Response(
                {'error': 'Error de validación', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Error inesperado al crear categoría: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor al crear la categoría'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            logger.error(f"Error de validación al crear categoría: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error al crear categoría: {str(e)}")
            raise serializers.ValidationError(f"Error al crear la categoría: {str(e)}")

    def perform_update(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            logger.error(f"Error de validación al actualizar categoría: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error al actualizar categoría: {str(e)}")
            raise serializers.ValidationError(f"Error al actualizar la categoría: {str(e)}")

class ProveedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proveedores
    """
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Sobrescribir create para mejor manejo de errores
        """
        try:
            logger.info("📥 Iniciando creación de proveedor")
            logger.debug(f"Datos recibidos: {request.data}")
            
            # Validar datos básicos
            if 'nombre' not in request.data or not request.data['nombre'].strip():
                error_msg = "El nombre del proveedor es requerido"
                logger.warning(f"Validación fallida: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Usar el serializer
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"❌ Serializer inválido: {serializer.errors}")
                return Response(
                    {'error': 'Datos inválidos', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar
            proveedor = serializer.save()
            logger.info(f"✅ Proveedor creado exitosamente: {proveedor.id} - {proveedor.nombre}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except DjangoValidationError as e:
            logger.error(f"❌ Error de validación de Django: {str(e)}")
            return Response(
                {'error': 'Error de validación', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Error inesperado al crear proveedor: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor al crear el proveedor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            logger.error(f"Error de validación al crear proveedor: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error al crear proveedor: {str(e)}")
            raise serializers.ValidationError(f"Error al crear el proveedor: {str(e)}")

    def perform_update(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            logger.error(f"Error de validación al actualizar proveedor: {str(e)}")
            raise serializers.ValidationError(str(e))
        except Exception as e:
            logger.error(f"Error al actualizar proveedor: {str(e)}")
            raise serializers.ValidationError(f"Error al actualizar el proveedor: {str(e)}")