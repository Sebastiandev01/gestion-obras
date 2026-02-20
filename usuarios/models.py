from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """Modelo de usuario personalizado para el sistema de gestión de obras"""
    
    ROL_CHOICES = [
        ('ADM', 'Administrador'),
        ('ARQ', 'Arquitecto'),
        ('SUP', 'Supervisor'),
        ('TEC', 'Técnico'),
        ('TRA', 'Trabajador'),
    ]
    
    rol = models.CharField(
        max_length=3,
        choices=ROL_CHOICES,
        default='TRA',
        verbose_name="Rol"
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Teléfono"
    )
    direccion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Dirección"
    )
    fecha_nacimiento = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de nacimiento"
    )
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Última actualización"
    )
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ['-fecha_creacion']
        permissions = [
            ('gestionar_usuarios', 'Puede gestionar usuarios'),
            ('gestionar_proyectos', 'Puede gestionar proyectos'),
            ('gestionar_materiales', 'Puede gestionar materiales'),
            ('gestionar_nomina', 'Puede gestionar nómina'),
            ('ver_reportes', 'Puede ver reportes'),
            ('gestionar_asistencias', 'Puede gestionar asistencias'),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_rol_display()})"
    
    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username
    
    def get_rol_display(self):
        """Retorna el nombre del rol"""
        return dict(self.ROL_CHOICES).get(self.rol, self.rol)
    
    @property
    def nombre_completo(self):
        """Propiedad para obtener el nombre completo"""
        return self.get_full_name()
    
    @property
    def es_supervisor(self):
        """Verifica si el usuario es supervisor"""
        return self.rol == 'SUP'
    
    @property
    def es_arquitecto(self):
        """Verifica si el usuario es arquitecto"""
        return self.rol == 'ARQ'
    
    @property
    def es_administrador(self):
        """Verifica si el usuario es administrador"""
        return self.rol == 'ADM'
