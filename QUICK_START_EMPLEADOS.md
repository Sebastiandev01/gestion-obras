# GUÍA RÁPIDA: Crear Empleados para Asistencia

## Métodos Disponibles

###  **MÉTODO RECOMENDADO: Comando Django** 

```bash
python manage.py crear_empleados --cantidad 10
```

**Ventajas**: Nativo, seguro, profesional.

---

###  Script Python Independiente

```bash
python crear_empleados_script.py 10
```

**Ventajas**: Funciona sin manage.py, útil para automatización.

---

###  Django Fixtures (Manual)

```bash
python manage.py loaddata fixtures/empleados.json
```

**Ventajas**: Carga de datos predefinidos, control total.

---

# Resultado

✓ Se crearán **10 empleados** con diferentes roles:
- 4 Trabajadores (TRA)
- 3 Técnicos (TEC)
- 2 Supervisores (SUP)
- 1 Arquitecto (ARQ)

**Todos con contraseña**: `1234`

---

#  Verificar

```bash
# Ver todos los empleados
python manage.py shell
>>> from usuarios.models import Usuario
>>> Usuario.objects.all().count()
```

---

**Ver documentación completa en**: `EMPLEADOS_SETUP.md`
