# Script para crear categoría, proveedor y material de ejemplo
from decimal import Decimal
from materiales.models import CategoriaMaterial, Proveedor, Material

# Crear o conseguir categoría
c, c_created = CategoriaMaterial.objects.get_or_create(
    codigo='CAT-001',
    defaults={
        'nombre': 'Cemento y arenas',
        'descripcion': 'Categoría ejemplo creada automáticamente',
        'color': '#FF6600',
        'orden': 1,
        'activa': True,
    }
)
print('Categoria:', c.id, c.nombre, 'creada?' , c_created)

# Crear o conseguir proveedor
p, p_created = Proveedor.objects.get_or_create(
    nombre='Proveedor Ejemplo',
    defaults={
        'contacto': 'Ana López',
        'telefono': '600-123-456',
        'email': 'proveedor@ejemplo.com',
        'direccion': 'Calle Falsa 123',
    }
)
print('Proveedor:', p.id, p.nombre, 'creado?' , p_created)

# Crear o conseguir material
m, m_created = Material.objects.get_or_create(
    codigo='MAT-001',
    defaults={
        'nombre': 'Arena gruesa',
        'descripcion': 'Arena para mezcla de concreto',
        'categoria': c,
        'cantidad': Decimal('100.00'),
        'unidad_medida': 'kg',
        'precio_unitario': Decimal('5.50'),
        'stock_minimo': Decimal('10.00'),
        'ubicacion': 'Almacén A',
        'proveedor': p,
    }
)
print('Material:', m.id, m.nombre, 'creado?' , m_created)

print('Operación completada.')
