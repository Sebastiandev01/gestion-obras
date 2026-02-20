# Soluciones para Crear Empleados en la Tabla de Asistencia

El proyecto tiene:
- **Tabla Usuario** (`usuarios/models.py`): Modelo personalizado que extiende Django's `AbstractUser`
- **Tabla RegistroAsistencia** (`asistencia/models.py`): Tiene una relación `ForeignKey` con Usuario
- **Serializer**: Muestra datos del usuario en los registros de asistencia

**Problema**: Los registros de asistencia necesitan que exista un usuario (empleado) vinculado para mostrar el nombre.

---

# Soluciones Implementadas

# **Opción 1: Comando Django Management (RECOMENDADO)**

**Ubicación**: `usuarios/management/commands/crear_empleados.py`

**Ventajas**:
- ✓ Integrado nativamente en Django
- ✓ Fácil de mantener y extender
- ✓ Soporta argumentos personalizados
- ✓ Verifica empleados duplicados
- ✓ Profesional y reutilizable

**Cómo usar**:

```bash
# Crear 10 empleados (por defecto)
python manage.py crear_empleados

# Crear cantidad específica
python manage.py crear_empleados --cantidad 5

# Crear 15 empleados
python manage.py crear_empleados --cantidad 15
```

---

### **Opción 2: Script Python Independiente**

**Ubicación**: `crear_empleados_script.py` (en la raíz del proyecto)

**Ventajas**:
- ✓ Puede ejecutarse sin `manage.py`
- ✓ Útil para automatización
- ✓ No requiere estar en el directorio correcto

**Cómo usar**:

```bash
# Crear 10 empleados (por defecto)
python crear_empleados_script.py

# Crear cantidad específica
python crear_empleados_script.py 5

# Crear 15 empleados
python crear_empleados_script.py 15
```

---

# Empleados que se crean

Se crean 10 empleados con roles variados:

| Username | Nombre Completo | Rol | Teléfono |
|----------|-----------------|-----|----------|
| juan_perez | Juan Pérez | Trabajador | 3001234567 |
| maria_garcia | María García | Trabajador | 3002345678 |
| carlos_rodriguez | Carlos Rodríguez | Técnico | 3003456789 |
| ana_martinez | Ana Martínez | Técnico | 3004567890 |
| luis_sanchez | Luis Sánchez | Supervisor | 3005678901 |
| sofia_lopez | Sofía López | Trabajador | 3006789012 |
| diego_torres | Diego Torres | Trabajador | 3007890123 |
| laura_moreno | Laura Moreno | Arquitecto | 3008901234 |
| pablo_flores | Pablo Flores | Técnico | 3009012345 |
| elena_vargas | Elena Vargas | Supervisor | 3000123456 |

**Contraseña por defecto**: `1234`

---

# Verificar empleados creados

# Opción 1: Django Shell

```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> usuarios = Usuario.objects.all()
>>> for u in usuarios:
...     print(f"{u.get_full_name()} - {u.get_rol_display()}")
```

# Opción 2: Admin de Django

```bash
python manage.py runserver
# Ir a: http://localhost:8000/admin/
# Login con usuario admin
# Buscar "Usuarios"
```

# Opción 3: API REST

```bash
curl http://localhost:8000/api/usuarios/
```

---

# Crear registros de asistencia

Con los empleados creados, ahora puedes crear registros de asistencia:

# Vía API REST

```bash
curl -X POST http://localhost:8000/api/asistencia/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tipo": "ENT",
    "ubicacion": "Oficina",
    "observaciones": "Entrada normal"
  }'
```

# Vía Django Shell

```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> from asistencia.models import RegistroAsistencia
>>> from django.utils import timezone

>>> usuario = Usuario.objects.get(username='juan_perez')
>>> registro = RegistroAsistencia.objects.create(
...     usuario=usuario,
...     tipo='ENT',
...     ubicacion='Oficina'
... )
>>> print(f"Registro creado para: {usuario.get_full_name()}")
```

---

# Personalización

# Agregar más empleados

Edita la lista `empleados` en cualquiera de los dos archivos:
- `usuarios/management/commands/crear_empleados.py`
- `crear_empleados_script.py`

Agrega un nuevo diccionario:

```python
{
    'username': 'nuevo_usuario',
    'first_name': 'Nombre',
    'last_name': 'Apellido',
    'email': 'email@obra.com',
    'rol': 'TRA',  # TRA, TEC, SUP, ARQ, ADM
    'telefono': '3001234567'
},
```

### Cambiar contraseña por defecto

En cualquiera de los archivos, cambiar:
```python
usuario.set_password('1234')  # ← Cambiar aquí
```

---

# Mejores Prácticas

1. **Usa el comando Django** para desarrollo normal: `python manage.py crear_empleados`
2. **Usa el script** para automatización o CI/CD
3. **Verifica duplicados**: Los scripts no crean empleados duplicados
4. **Seguridad**: Cambia las contraseñas por defecto en producción
5. **Roles**:
   - `ADM`: Administrador (acceso total)
   - `ARQ`: Arquitecto (diseño de proyectos)
   - `SUP`: Supervisor (supervisión de obras)
   - `TEC`: Técnico (tareas técnicas)
   - `TRA`: Trabajador (trabajador regular)

---

# Próximos pasos

Después de crear los empleados:

1. Accede al admin: `python manage.py runserver`
2. Crea registros de asistencia manualmente
3. O usa la API REST para automatizar registros
4. Genera reportes de asistencia por empleado

---

**Creado**: 2026-01-30
