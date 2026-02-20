#!/usr/bin/env python
"""
Script para crear empleados de prueba en el sistema de asistencia
Uso: python crear_empleados_script.py [cantidad]
Ejemplo: python crear_empleados_script.py 10
"""

import os
import sys
import django

# Agregar el directorio del proyecto al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario


def crear_empleados(cantidad=10):
    """Crea empleados de prueba"""
    
    empleados = [
        {
            'username': 'juan_perez',
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'email': 'juan.perez@obra.com',
            'rol': 'TRA',
            'telefono': '3001234567'
        },
        {
            'username': 'maria_garcia',
            'first_name': 'María',
            'last_name': 'García',
            'email': 'maria.garcia@obra.com',
            'rol': 'TRA',
            'telefono': '3002345678'
        },
        {
            'username': 'carlos_rodriguez',
            'first_name': 'Carlos',
            'last_name': 'Rodríguez',
            'email': 'carlos.rodriguez@obra.com',
            'rol': 'TEC',
            'telefono': '3003456789'
        },
        {
            'username': 'ana_martinez',
            'first_name': 'Ana',
            'last_name': 'Martínez',
            'email': 'ana.martinez@obra.com',
            'rol': 'TEC',
            'telefono': '3004567890'
        },
        {
            'username': 'luis_sanchez',
            'first_name': 'Luis',
            'last_name': 'Sánchez',
            'email': 'luis.sanchez@obra.com',
            'rol': 'SUP',
            'telefono': '3005678901'
        },
        {
            'username': 'sofia_lopez',
            'first_name': 'Sofía',
            'last_name': 'López',
            'email': 'sofia.lopez@obra.com',
            'rol': 'TRA',
            'telefono': '3006789012'
        },
        {
            'username': 'diego_torres',
            'first_name': 'Diego',
            'last_name': 'Torres',
            'email': 'diego.torres@obra.com',
            'rol': 'TRA',
            'telefono': '3007890123'
        },
        {
            'username': 'laura_moreno',
            'first_name': 'Laura',
            'last_name': 'Moreno',
            'email': 'laura.moreno@obra.com',
            'rol': 'ARQ',
            'telefono': '3008901234'
        },
        {
            'username': 'pablo_flores',
            'first_name': 'Pablo',
            'last_name': 'Flores',
            'email': 'pablo.flores@obra.com',
            'rol': 'TEC',
            'telefono': '3009012345'
        },
        {
            'username': 'elena_vargas',
            'first_name': 'Elena',
            'last_name': 'Vargas',
            'email': 'elena.vargas@obra.com',
            'rol': 'SUP',
            'telefono': '3000123456'
        },
    ]

    # Limitar a la cantidad solicitada
    empleados = empleados[:cantidad]
    
    creados = 0
    existentes = 0

    print("\n" + "="*60)
    print("CREANDO EMPLEADOS PARA EL SISTEMA DE ASISTENCIA")
    print("="*60 + "\n")

    for emp in empleados:
        usuario, creado = Usuario.objects.get_or_create(
            username=emp['username'],
            defaults={
                'first_name': emp['first_name'],
                'last_name': emp['last_name'],
                'email': emp['email'],
                'rol': emp['rol'],
                'telefono': emp['telefono'],
                'activo': True,
            }
        )

        if creado:
            usuario.set_password('1234')
            usuario.save()
            print(f"✓ Empleado creado: {usuario.get_full_name()} ({usuario.get_rol_display()})")
            creados += 1
        else:
            print(f"⊘ Empleado ya existe: {usuario.get_full_name()}")
            existentes += 1

    print("\n" + "="*60)
    print(f"✓ RESUMEN: {creados} empleado(s) creado(s), {existentes} ya existente(s)")
    print("="*60 + "\n")
    print("Contraseña por defecto: 1234")
    print("="*60 + "\n")


if __name__ == '__main__':
    cantidad = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    crear_empleados(cantidad)
