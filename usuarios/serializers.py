from rest_framework import serializers
from .models import Usuario


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para usuarios"""
    
    nombre_completo = serializers.SerializerMethodField()
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'nombre_completo',
            'rol',
            'rol_display',
            'telefono',
            'activo'
        ]
        read_only_fields = ['id', 'username']
    
    def get_nombre_completo(self, obj):
        return obj.get_full_name()


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer completo para usuarios"""
    
    nombre_completo = serializers.SerializerMethodField()
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'nombre_completo',
            'rol',
            'rol_display',
            'telefono',
            'direccion',
            'fecha_nacimiento',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def get_nombre_completo(self, obj):
        return obj.get_full_name()
