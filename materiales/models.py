from django.db import models
from django.core.validators import MinValueValidator


class CategoriaMaterial(models.Model):
    """Modelo para categorías de materiales"""
    
    codigo = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        null=True,
        help_text="Código único para identificar la categoría",
        verbose_name="Código"
    )
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre de la categoría"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    color = models.CharField(
        max_length=7,
        default='#000000',
        help_text="Color en formato hexadecimal para identificar la categoría",
        verbose_name="Color"
    )
    orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización de la categoría",
        verbose_name="Orden"
    )
    activa = models.BooleanField(
        default=True,
        help_text="Indica si la categoría está activa",
        verbose_name="Activa"
    )
    
    class Meta:
        verbose_name = "Categoría de Material"
        verbose_name_plural = "Categorías de Materiales"
        ordering = ['orden', 'nombre']
    
    def __str__(self):
        return self.nombre


class Proveedor(models.Model):
    """Modelo para proveedores de materiales"""
    
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre del proveedor"
    )
    contacto = models.CharField(
        max_length=100,
        verbose_name="Persona de contacto"
    )
    telefono = models.CharField(
        max_length=20,
        verbose_name="Teléfono"
    )
    email = models.EmailField(
        verbose_name="Correo electrónico"
    )
    direccion = models.TextField(
        verbose_name="Dirección"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        null=True,
        verbose_name="Fecha de creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        blank=True,
        null=True,
        verbose_name="Fecha de actualización"
    )
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Material(models.Model):
    """Modelo para materiales de construcción"""
    
    UNIDAD_CHOICES = [
        ('kg', 'Kilogramos'),
        ('g', 'Gramos'),
        ('l', 'Litros'),
        ('ml', 'Mililitros'),
        ('m', 'Metros'),
        ('cm', 'Centímetros'),
        ('m2', 'Metros cuadrados'),
        ('m3', 'Metros cúbicos'),
        ('un', 'Unidad'),
        ('pkg', 'Paquete'),
    ]
    
    codigo = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Código del material"
    )
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre del material"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    categoria = models.ForeignKey(
        CategoriaMaterial,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='materiales',
        verbose_name="Categoría"
    )
    cantidad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Cantidad en stock"
    )
    unidad_medida = models.CharField(
        max_length=5,
        choices=UNIDAD_CHOICES,
        default='un',
        verbose_name="Unidad de medida"
    )
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Precio unitario"
    )
    stock_minimo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Stock mínimo"
    )
    ubicacion = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Ubicación en almacén"
    )
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='materiales',
        verbose_name="Proveedor"
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
        verbose_name = "Material"
        verbose_name_plural = "Materiales"
        ordering = ['codigo']
    
    def __str__(self):
        return f"{self.codigo or 'N/A'} - {self.nombre}"
