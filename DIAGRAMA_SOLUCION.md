# Diagrama de la Solución

# Estructura del Proyecto Actualizada

```
Gestion_obras-master/
│
├── 📄 RESUMEN_SOLUCION.md          ← COMIENZA AQUÍ
├── 📄 QUICK_START_EMPLEADOS.md     ← Guía rápida
├── 📄 EMPLEADOS_SETUP.md           ← Documentación completa
│
├── 🔧 SCRIPTS DE CREACIÓN
├── crear_empleados_script.py       ← Script Python independiente
├── crear_asistencia_ejemplo.py     ← Crea registros de asistencia
│
├──  fixtures/
│   └── empleados.json              ← Datos precargados (opcional)
│
├── usuarios/
│   ├── management/
│   │   └── commands/
│   │       └── crear_empleados.py  ← COMANDO DJANGO (RECOMENDADO)
│   └── models.py                   ← Modelo Usuario
│
├── asistencia/
│   ├── models.py                   ← Modelo RegistroAsistencia
│   └── serializers.py              ← Serializer (muestra nombre usuario)
│
└── ... (resto del proyecto)
```

---

# Flujo de Trabajo

```
┌─────────────────────────────────────────────┐
│    CREAR EMPLEADOS EN LA BASE DE DATOS      │
└─────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   OPCIÓN 1      OPCIÓN 2      OPCIÓN 3
   Comando      Script        Fixtures
   Django       Python        JSON
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │   10 EMPLEADOS CREADOS EN DB    │
        │  (Usuario modelo con relación   │
        │   a RegistroAsistencia)         │
        └─────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   VER EN ADMIN            CREAR REGISTROS
   /admin/usuarios/        DE ASISTENCIA
   usuarios/               (Ver relación)
```

---

# Relación Base de Datos

```
┌──────────────────────────────────────┐
│         Tabla: usuarios_usuario      │
├──────────────────────────────────────┤
│ id (PK)                              │
│ username ✓                           │
│ first_name ✓                         │
│ last_name ✓                          │
│ email ✓                              │
│ rol ✓                                │
│ telefono                             │
│ activo                               │
│ fecha_creacion                       │
│ ... (otros campos)                   │
└──────────────────────────────────────┘
              ▲
              │
              │ (ForeignKey)
              │
┌──────────────────────────────────────┐
│   Tabla: asistencia_registroasistencia│
├──────────────────────────────────────┤
│ id (PK)                              │
│ usuario_id (FK) ──────────────┐      │
│ fecha                         │      │
│ hora                          │      │
│ tipo (ENT/SAL)                │      │
│ ubicacion                     │      │
│ observaciones                 │      │
│ creado_en                     │      │
└──────────────────────────────────────┘
```

**Resultado en la API**: Cuando haces GET /api/asistencia/, ves:
```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "username": "juan_perez",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "fecha": "2026-01-30",
  "hora": "08:30:00",
  "tipo": "ENT"
}
```

**El nombre del usuario está disponible** ✓

---

# Casos de Uso

### Caso 1: Desarrollo Local
```bash
python manage.py crear_empleados --cantidad 10
python crear_asistencia_ejemplo.py
python manage.py runserver
# Accede a http://localhost:8000/admin/
```

### Caso 2: Automatización (CI/CD)
```bash
python crear_empleados_script.py 10
# Ejecutar en GitHub Actions, Docker, etc.
```

### Caso 3: Datos Predefinidos
```bash
# Una sola vez
python manage.py migrate
python manage.py loaddata fixtures/empleados.json
```

---

# Verificación

### Ver empleados creados:
```bash
# Opción 1: Django Shell
python manage.py shell
>>> from usuarios.models import Usuario
>>> Usuario.objects.count()  # Debe mostrar >= 10
>>> Usuario.objects.first().get_full_name()  # Muestra nombre completo

# Opción 2: Admin Django
http://localhost:8000/admin/usuarios/usuario/

# Opción 3: API REST
curl http://localhost:8000/api/usuarios/
```

# Ver registros de asistencia:
```bash
# Django Shell
python manage.py shell
>>> from asistencia.models import RegistroAsistencia
>>> RegistroAsistencia.objects.count()  # Debe mostrar 50+

# API REST
curl http://localhost:8000/api/asistencia/

# Admin Django
http://localhost:8000/admin/asistencia/registroasistencia/
```

---

# Aprendizaje

# Conceptos utilizados:

1. **Django Management Commands**
   - Ubicación: `app/management/commands/nombre.py`
   - Método: `handle()` - punto de entrada
   - Argumentos: `add_arguments()`

2. **Django ORM**
   - `get_or_create()` - obtiene o crea
   - `ForeignKey` - relaciones 1:N
   - `objects.filter()` - consultas

3. **Django Serializers (DRF)**
   - Nested serializers para relaciones
   - `read_only=True` para campos derivados
   - Presentación de datos en API

4. **Security**
   - `set_password()` - hasheo de contraseñas
   - Validación de datos
   - Permisos por rol

---

# Próximas Mejoras 

# Aún no realizadas

1. Crear un comando para **eliminar empleados de prueba**
   ```bash
   python manage.py eliminar_empleados --username juan_perez
   ```

2. Crear un comando para **generar reportes de asistencia**
   ```bash
   python manage.py reportes_asistencia --mes 01 --año 2026
   ```

3. **Importar empleados desde CSV**
   ```bash
   python manage.py importar_empleados --archivo empleados.csv
   ```

4. **Automatizar cálculo de horas trabajadas**
   - Crear un servicio que calcule automáticamente
   - Mostrar estadísticas por empleado

---



# Para comenzar: `python manage.py crear_empleados`
