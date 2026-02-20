#!/usr/bin/env python
"""
Script para crear registros de asistencia de prueba
Uso: python crear_asistencia_ejemplo.py
"""

import os
import sys
import django
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from usuarios.models import Usuario
from asistencia.models import RegistroAsistencia
from django.utils import timezone


def crear_registros_asistencia():
    """Crea registros de asistencia de prueba para los empleados"""
    
    print("\n" + "="*70)
    print("CREANDO REGISTROS DE ASISTENCIA DE PRUEBA")
    print("="*70 + "\n")
    
    # Obtener todos los empleados
    usuarios = Usuario.objects.filter(rol__in=['TRA', 'TEC', 'SUP'])[:5]
    
    if not usuarios.exists():
        print("❌ No hay empleados disponibles. Ejecuta primero: python manage.py crear_empleados")
        return
    
    registros_creados = 0
    
    # Crear registros para los últimos 5 días
    for dias_atras in range(5):
        fecha = timezone.localdate() - timedelta(days=dias_atras)
        
        for usuario in usuarios:
            # Crear registro de ENTRADA
            entrada = RegistroAsistencia.objects.create(
                usuario=usuario,
                fecha=fecha,
                hora=timezone.datetime(2026, 1, 30, 8, 30).time(),
                tipo='ENT',
                ubicacion='Oficina Principal'
            )
            registros_creados += 1
            print(f"✓ Entrada registrada: {usuario.get_full_name():20} | {fecha} | 08:30")
            
            # Crear registro de SALIDA
            salida = RegistroAsistencia.objects.create(
                usuario=usuario,
                fecha=fecha,
                hora=timezone.datetime(2026, 1, 30, 17, 30).time(),
                tipo='SAL',
                ubicacion='Oficina Principal'
            )
            registros_creados += 1
            print(f"✓ Salida registrada:   {usuario.get_full_name():20} | {fecha} | 17:30")
        
        print()
    
    print("="*70)
    print(f"✓ RESUMEN: {registros_creados} registro(s) de asistencia creado(s)")
    print("="*70 + "\n")
    
    # Mostrar resumen
    print(" RESUMEN DE ASISTENCIA POR EMPLEADO:\n")
    for usuario in usuarios:
        registros = usuario.registros_asistencia.count()
        print(f"  • {usuario.get_full_name():20} - {registros} registros")


if __name__ == '__main__':
    crear_registros_asistencia()
