# Comandos Útiles - Referencia Rápida

# Crear Empleados

# Opción Recomendada: Comando Django
```bash
# Crear 10 empleados (por defecto)
python manage.py crear_empleados

# Crear cantidad personalizada
python manage.py crear_empleados --cantidad 5
python manage.py crear_empleados --cantidad 20
```

### Opción 2: Script Python
```bash
# Crear 10 empleados
python crear_empleados_script.py

# Crear cantidad personalizada
python crear_empleados_script.py 5
python crear_empleados_script.py 20
```

### Opción 3: Django Fixtures
```bash
# Cargar empleados predefinidos
python manage.py loaddata fixtures/empleados.json
```

---

# Ver Empleados

# En Django Shell
```bash
python manage.py shell

# Ver cantidad de empleados
>>> from usuarios.models import Usuario
>>> Usuario.objects.count()

# Ver todos los empleados
>>> usuarios = Usuario.objects.all()
>>> for u in usuarios:
...     print(f"{u.get_full_name()} - {u.get_rol_display()}")

# Ver un empleado específico
>>> usuario = Usuario.objects.get(username='juan_perez')
>>> print(usuario.get_full_name())
>>> print(usuario.email)
>>> print(usuario.telefono)
```

### En Admin Django
```bash
python manage.py runserver
# Ir a: http://localhost:8000/admin/
# Username: admin
# Password: (tu contraseña)
# Buscar: "Usuarios" en la sección "Usuarios"
```

# Vía API REST
```bash
# Ver todos los usuarios
curl http://localhost:8000/api/usuarios/

# Con formato bonito
curl -i -H "Accept: application/json" http://localhost:8000/api/usuarios/ | python -m json.tool
```

---

# Gestionar Contraseñas

# Cambiar contraseña de un usuario
```bash
python manage.py changepassword juan_perez
# Ingresa la nueva contraseña
# Confirma la contraseña
```

# Establecer contraseña en Django Shell
```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> usuario = Usuario.objects.get(username='juan_perez')
>>> usuario.set_password('nueva_contraseña')
>>> usuario.save()
```

# Crear superusuario
```bash
python manage.py createsuperuser
```

---

# Crear Registros de Asistencia

# Script de Ejemplo
```bash
python crear_asistencia_ejemplo.py
```

# Vía Django Shell
```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> from asistencia.models import RegistroAsistencia
>>> from django.utils import timezone

# Obtener un empleado
>>> usuario = Usuario.objects.get(username='juan_perez')

# Crear registro de ENTRADA
>>> entrada = RegistroAsistencia.objects.create(
...     usuario=usuario,
...     tipo='ENT',
...     ubicacion='Oficina'
... )
>>> print(f"Entrada registrada: {usuario.get_full_name()}")

# Crear registro de SALIDA
>>> salida = RegistroAsistencia.objects.create(
...     usuario=usuario,
...     tipo='SAL',
...     ubicacion='Oficina'
... )
>>> print(f"Salida registrada: {usuario.get_full_name()}")
```

# Vía API REST
```bash
# Necesitas token de autenticación primero
TOKEN="tu_token_aqui"

# Crear registro de ENTRADA
curl -X POST http://localhost:8000/api/asistencia/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{
    "tipo": "ENT",
    "ubicacion": "Oficina Principal"
  }'

# Crear registro de SALIDA
curl -X POST http://localhost:8000/api/asistencia/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{
    "tipo": "SAL",
    "ubicacion": "Oficina Principal"
  }'
```

---

# Ver Registros de Asistencia

# En Django Shell
```bash
python manage.py shell
>>> from asistencia.models import RegistroAsistencia
>>> registros = RegistroAsistencia.objects.all()
>>> for r in registros[:5]:
...     print(f"{r.usuario.get_full_name()} - {r.fecha} {r.hora} ({r.tipo})")

# Ver registros de un usuario específico
>>> usuario = Usuario.objects.get(username='juan_perez')
>>> registros = usuario.registros_asistencia.all()
>>> for r in registros:
...     print(f"{r.fecha} {r.hora} - {r.tipo}")
```

# En Admin Django
```bash
# http://localhost:8000/admin/asistencia/registroasistencia/
```

# Vía API REST
```bash
# Ver todos los registros
curl http://localhost:8000/api/asistencia/

# Con formato bonito
curl -i -H "Accept: application/json" http://localhost:8000/api/asistencia/ | python -m json.tool
```

---

#  Estadísticas de Asistencia

### Django Shell
```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> from asistencia.models import RegistroAsistencia
>>> from django.utils import timezone

# Total de registros
>>> RegistroAsistencia.objects.count()

# Registros hoy
>>> hoy = timezone.localdate()
>>> RegistroAsistencia.objects.filter(fecha=hoy).count()

# Registros por usuario
>>> usuario = Usuario.objects.get(username='juan_perez')
>>> usuario.registros_asistencia.count()

# Entradas hoy
>>> RegistroAsistencia.objects.filter(fecha=hoy, tipo='ENT').count()

# Salidas hoy
>>> RegistroAsistencia.objects.filter(fecha=hoy, tipo='SAL').count()
```

---

# Mantenimiento de Base de Datos

# Hacer migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### Ver migraciones aplicadas
```bash
python manage.py showmigrations
```

# Crear respaldo de datos
```bash
# Exportar todos los datos
python manage.py dumpdata > backup.json

# Exportar solo usuarios
python manage.py dumpdata usuarios > usuarios_backup.json

# Exportar solo asistencia
python manage.py dumpdata asistencia > asistencia_backup.json
```

# Restaurar desde respaldo
```bash
python manage.py loaddata backup.json
```

# Limpiar datos de prueba
```bash
python manage.py shell
>>> from usuarios.models import Usuario
>>> # Eliminar usuario específico
>>> Usuario.objects.get(username='juan_perez').delete()
>>> # Eliminar todos los empleados de prueba
>>> Usuario.objects.filter(username__startswith='test_').delete()
```

---

# Servidor de Desarrollo

# Iniciar servidor
```bash
python manage.py runserver
# Accede a: http://localhost:8000/
# Admin: http://localhost:8000/admin/
# API: http://localhost:8000/api/
```

# En puerto específico
```bash
python manage.py runserver 0.0.0.0:8080
```

# Con auto-recarga deshabilitada
```bash
python manage.py runserver --noreload
```

---

# Testing

# Ejecutar tests
```bash
python manage.py test
python manage.py test asistencia
python manage.py test usuarios
```

# Con verbose
```bash
python manage.py test --verbosity=2
```

---

# Dependencias

# Instalar dependencias
```bash
pip install -r requirements.txt
```

# Verificar instalación
```bash
pip list
python -c "import django; print(django.VERSION)"
```

---

# Troubleshooting

# Error: "No such table"
```bash
python manage.py migrate
```

# Error: "Permission denied"
```bash
# Asegúrate de estar en el directorio correcto
cd c:\Users\Desktop\Downloads\Gestion_obras-master\Gestion_obras-master
```

# Error: "Module not found"
```bash
# Instala las dependencias
pip install -r requirements.txt
```

# Limpiar caché de Python
```bash
# Windows
for /d %i in (__pycache__) do rmdir /s /q %i

# Linux/Mac
find . -type d -name __pycache__ -exec rm -r {} +
```

---

# Tips Útiles

# Usar IPython Shell
```bash
# Más features que el shell normal
python manage.py shell_plus

# Instalar django-extensions primero
pip install django-extensions
```

# Crear usuario administrador interactivamente
```bash
python manage.py createsuperuser --interactive
```

# Ejecutar comando sin interactividad
```bash
echo "from usuarios.models import Usuario; print(Usuario.objects.count())" | python manage.py shell
```

# Usar dbshell para SQL directo
```bash
python manage.py dbshell
# Ejecuta SQL directamente en la base de datos
SELECT * FROM usuarios_usuario;
```

---

**Última actualización**: 2026-01-30
