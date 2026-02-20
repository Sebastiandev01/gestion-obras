from rest_framework import serializers
from .models import Proyecto
from usuarios.serializers import UserBasicSerializer


class ProyectoSerializer(serializers.ModelSerializer):
    """
    Serializer para proyectos de construcción
    """

    # Campos calculados / solo lectura
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )

    responsable_info = UserBasicSerializer(
        source='responsable',
        read_only=True
    )

    asignados_info = UserBasicSerializer(
        source='asignados',
        many=True,
        read_only=True
    )

    foto_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Proyecto
        fields = [
            'id',
            'nombre',
            'descripcion',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'presupuesto',
            'activo',
            'foto',
            'foto_url',
            'responsable',
            'responsable_info',
            'asignados',
            'asignados_info',
            'fecha_creacion',
            'fecha_actualizacion',
        ]

        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
            'responsable_info',
            'asignados_info',
            'estado_display',
            'foto_url',
        ]

    # -------------------------
    # VALIDACIONES
    # -------------------------

    def validate_presupuesto(self, value):
        """
        Validar que el presupuesto no sea negativo
        """
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "El presupuesto no puede ser negativo."
            )
        return value

    def validate(self, data):
        """
        Validaciones generales del proyecto
        """
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        if fecha_inicio and fecha_fin:
            if fecha_fin < fecha_inicio:
                raise serializers.ValidationError(
                    "La fecha de finalización no puede ser anterior a la fecha de inicio."
                )

        return data

    # -------------------------
    # MÉTODOS AUXILIARES
    # -------------------------

    def get_foto_url(self, obj):
        """
        Retorna la URL absoluta de la imagen
        """
        if not obj.foto:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.foto.url)

        return obj.foto.url
