from django.db import models
from django.conf import settings


class Proyecto(models.Model):
    """Modelo para representar proyectos de construcción"""
    
    ESTADO_CHOICES = [
        ('PLAN', 'Planificado'),
        ('EJE', 'En Ejecución'),
        ('SUS', 'Suspendido'),
        ('COM', 'Completado'),
        ('CAN', 'Cancelado'),
    ]
    
    nombre = models.CharField(
        max_length=200,
        verbose_name="Nombre del proyecto"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    fecha_inicio = models.DateField(
        verbose_name="Fecha de inicio"
    )
    fecha_fin = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de finalización"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='PLAN',
        verbose_name="Estado"
    )
    presupuesto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="Presupuesto"
    )
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    foto = models.ImageField(
        upload_to='proyectos/',
        blank=True,
        null=True,
        verbose_name="Foto del proyecto"
    )
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proyectos_responsable',
        verbose_name="Responsable"
    )
    asignados = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='proyectos_asignados',
        verbose_name="Personal asignado"
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
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['fecha_inicio']),
        ]
    
    def __str__(self):
        return self.nombre
    
