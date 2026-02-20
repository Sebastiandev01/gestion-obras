from django.contrib import admin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'rol', 'activo', 'fecha_creacion')
    list_filter = ('rol', 'activo', 'fecha_creacion')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('-fecha_creacion',)
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('username', 'first_name', 'last_name', 'email', 'telefono', 'direccion', 'fecha_nacimiento')
        }),
        ('Seguridad', {
            'fields': ('password',)
        }),
        ('Rol y Permisos', {
            'fields': ('rol', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Estado', {
            'fields': ('activo', 'is_active')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion', 'last_login'),
            'classes': ('collapse',)
        }),
    )
