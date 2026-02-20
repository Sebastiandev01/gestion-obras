from rest_framework import serializers
from .models import RegistroAsistencia
from django.utils import timezone
from usuarios.serializers import UserBasicSerializer


class RegistroAsistenciaSerializer(serializers.ModelSerializer):
    usuario = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = RegistroAsistencia
        fields = [
            'id',
            'usuario',
            'fecha',
            'hora',
            'tipo',
            'ubicacion',
            'observaciones',
            'creado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'usuario', 'fecha', 'hora']

    def validate(self, data):
        """
        Validar reglas de negocio para asistencia:
        - Solo una ENTRADA (ENT) por día por usuario
        - Solo una SALIDA (SAL) por día por usuario
        - Para registrar SALIDA, debe existir ENTRADA previa el mismo día
        """
        request = self.context.get('request')
        usuario = request.user if request else None

        if not usuario or not usuario.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        tipo = data.get('tipo')
        if not tipo:
            raise serializers.ValidationError("El tipo de registro es requerido.")

        # Obtener la fecha actual del servidor (respeta timezone)
        hoy = timezone.localdate()

        # Validación 1: No puede haber dos registros del mismo tipo en un día
        existe_mismo_tipo = RegistroAsistencia.objects.filter(
            usuario=usuario,
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
                usuario=usuario,
                fecha=hoy,
                tipo='ENT'
            ).exists()
            
            if not existe_entrada:
                raise serializers.ValidationError(
                    "No puedes registrar salida sin haber registrado entrada hoy."
                )
        
        return data

    def create(self, validated_data):
        """
        Asignar automáticamente el usuario autenticado
        Las fechas y horas se asignarán automáticamente del modelo
        """
        request = self.context.get('request')
        validated_data['usuario'] = request.user
        return super().create(validated_data)