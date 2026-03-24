from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import RegistroAsistencia
from django.utils import timezone
from usuarios.serializers import UserBasicSerializer
from usuarios.models import Usuario


class RegistroAsistenciaSerializer(serializers.ModelSerializer):
    # Permitir enviar `usuario` por su PK al crear (opcional). En lectura se muestra el serializer básico.
    usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), required=False,
        default=serializers.CurrentUserDefault(), allow_null=True
    )
    usuario_detalle = UserBasicSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = RegistroAsistencia
        fields = [
            'id',
            'usuario',
            'usuario_detalle',
            'fecha',
            'hora',
            'tipo',
            'ubicacion',
            'observaciones',
            'creado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'fecha', 'hora']

    def validate(self, data):
        """
        Validar reglas de negocio para asistencia:
        - Solo una ENTRADA (ENT) por día por usuario
        - Solo una SALIDA (SAL) por día por usuario
        - Para registrar SALIDA, debe existir ENTRADA previa el mismo día
        """
        request = self.context.get('request')
        usuario = request.user if request else None

        # Si el payload incluye 'usuario', usarlo; si no, usar el usuario autenticado.
        usuario_obj = data.get('usuario', None) or usuario

        # Si se intenta asignar otro usuario que no sea el propio, requerir permiso
        if data.get('usuario') and request:
            if data.get('usuario') != request.user and not (
                request.user.es_supervisor or request.user.es_arquitecto or request.user.es_administrador
            ):
                raise PermissionDenied('No tienes permiso para crear registros para otro usuario.')
        if not usuario or not usuario.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        tipo = data.get('tipo')
        if not tipo:
            raise serializers.ValidationError("El tipo de registro es requerido.")

        # Obtener la fecha actual del servidor (respeta timezone)
        hoy = timezone.localdate()

        # Validación 1: No puede haber dos registros del mismo tipo en un día
        existe_mismo_tipo = RegistroAsistencia.objects.filter(
            usuario=usuario_obj,
            fecha=hoy,
            tipo=tipo
        ).exists()

        if existe_mismo_tipo:
            raise serializers.ValidationError(
                f"Ya existe un registro de {tipo} para hoy."
            )

        # Validación 2: Para SALIDA, debe existir ENTRADA previa
        if tipo == 'SAL':
            existe_entrada = RegistroAsistencia.objects.filter(
                usuario=usuario_obj,
                fecha=hoy,
                tipo='ENT'
            ).exists()
            
            if not existe_entrada:
                raise serializers.ValidationError(
                    "No puedes registrar salida sin haber registrado entrada hoy."
                )
        
        # Si no se indicó usuario explícito, el create() o la vista asignarán el usuario autenticado.
        return data

    def create(self, validated_data):
        """
        Asignar automáticamente el usuario autenticado
        Las fechas y horas se asignarán automáticamente del modelo
        """
        # Si el usuario no fue incluido en los datos, no lo forzamos aquí;
        # la vista (`perform_create`) asignará el usuario autenticado por defecto.
        return super().create(validated_data)