#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from usuarios.views import CustomTokenObtainPairView
from usuarios.models import Usuario

# Crear factory para simular peticiones
factory = APIRequestFactory()

# Simular petición de login
view = CustomTokenObtainPairView()
request = factory.post('/api/auth/login/', {
    'username': 'admin',
    'password': 'admin123'
}, format='json')

# Ejecutar la vista
response = view.post(request)

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")

if response.status_code == 200:
    print("✅ Login exitoso")
    print(f"Access token: {response.data.get('access', 'N/A')[:50]}...")
    print(f"User: {response.data.get('user', {}).get('username', 'N/A')}")
else:
    print("❌ Login fallido")
    print(f"Error: {response.data}")
