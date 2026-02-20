from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class Nomina(models.Model):
    """Modelo para nóminas de empleados"""
    
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Pagado', 'Pagado'),
        ('Cancelado', 'Cancelado'),
    ]
    
    empleado = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'TRA'},
        related_name='nominas',
        verbose_name="Empleado"
    )
    periodo = models.CharField(
        max_length=7,
        help_text="Formato: YYYY-MM",
        verbose_name="Período"
    )
    dias_trabajados = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Días trabajados"
    )
    sueldo_base = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Sueldo base"
    )
    horas_extras = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Horas extras"
    )
    bonificaciones = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Bonificaciones"
    )
    deducciones = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Deducciones"
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Total"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='Pendiente',
        verbose_name="Estado"
    )
    comentario = models.TextField(
        blank=True,
        null=True,
        verbose_name="Comentario"
    )
    ultimo_cambio_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nominas_modificadas',
        verbose_name="Último cambio por"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de actualización"
    )
    
    class Meta:
        verbose_name = "Nómina"
        verbose_name_plural = "Nóminas"
        ordering = ['-fecha_creacion']
        permissions = [
            ('can_process_nomina', 'Puede procesar nóminas'),
            ('can_cancel_nomina', 'Puede cancelar nóminas'),
        ]
    
    def __str__(self):
        return f"{self.empleado.get_full_name()} - {self.periodo}"
    
    def calcular_total(self):
        """Calcula el total de la nómina"""
        valor_hora_normal = Decimal(str(self.sueldo_base)) / (Decimal('30') * Decimal('8'))
        valor_horas_extras = self.horas_extras * valor_hora_normal * Decimal('1.5')
        total = (self.sueldo_base + valor_horas_extras + self.bonificaciones - self.deducciones)
        return total
    
    def save(self, *args, **kwargs):
        """Sobrescribe save para calcular el total automáticamente"""
        self.total = self.calcular_total()
        super().save(*args, **kwargs)


class Pago(models.Model):
    """Modelo para pagos realizados"""
    
    nomina = models.ForeignKey(
        Nomina,
        on_delete=models.CASCADE,
        related_name='pagos',
        verbose_name="Nómina"
    )
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Monto"
    )
    metodo_pago = models.CharField(
        max_length=50,
        verbose_name="Método de pago"
    )
    referencia = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Referencia"
    )
    fecha_pago = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de pago"
    )
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name="Observaciones"
    )
    
    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['-fecha_pago']
    
    def __str__(self):
        return f"Pago de {self.monto} - {self.nomina.empleado.get_full_name()}"
