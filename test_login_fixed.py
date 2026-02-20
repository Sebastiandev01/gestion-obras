#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status

# Crear cliente de prueba
client = APIClient()

# Probar login
response = client.post('/api/auth/login/', {
    'username': 'admin',
    'password': 'admin123'
}, format='json')

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")

if response.status_code == 200:
    print("✅ Login exitoso")
    access_token = response.data.get('access')
    print(f"Access token: {access_token[:50]}...")
    print(f"User: {response.data.get('user', {}).get('username', 'N/A')}")
    
    # Probar acceder a proyectos con el token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    proyectos_response = client.get('/api/proyectos/')
    print(f"\nProyectos Status Code: {proyectos_response.status_code}")
    print(f"Proyectos Data: {proyectos_response.data}")
    
else:
    print("❌ Login fallido")
    print(f"Error: {response.data}")
