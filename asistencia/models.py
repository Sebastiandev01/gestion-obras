from django.db import models
from django.utils import timezone
from usuarios.models import Usuario


def hora_actual():
    """
    Retorna la hora actual correctamente (TimeField necesita time, no datetime)
    """
    return timezone.localtime().time()


class RegistroAsistencia(models.Model):
    TIPOS_REGISTRO = (
        ('ENT', 'Entrada'),
        ('SAL', 'Salida'),
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='registros_asistencia'
    )

    fecha = models.DateField(
        default=timezone.localdate  # Usa localdate que respeta la zona horaria
    )

    hora = models.TimeField(
        default=hora_actual  # Usa hora_actual que respeta la zona horaria
    )

    tipo = models.CharField(
        max_length=3,
        choices=TIPOS_REGISTRO
    )

    ubicacion = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    creado_en = models.DateTimeField(
        auto_now_add=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = 'Registro de Asistencia'
        verbose_name_plural = 'Registros de Asistencia'
        ordering = ['-fecha', '-hora']
        unique_together = ('usuario', 'fecha', 'tipo')

    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.fecha} - {self.get_tipo_display()}"