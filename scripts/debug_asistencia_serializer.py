# debug_asistencia_serializer.py
from rest_framework.test import APIRequestFactory
from django.conf import settings
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()

from usuarios.models import Usuario
from asistencia.serializers import RegistroAsistenciaSerializer

# crear usuario de prueba
u, created = Usuario.objects.get_or_create(username='debug_user')
if created:
	u.set_password('pass')
	u.save()

factory = APIRequestFactory()
request = factory.post('/api/asistencia/registros/', {'tipo': 'ENT'}, format='json')
request.user = u

serializer = RegistroAsistenciaSerializer(data={'tipo': 'ENT'}, context={'request': request})
valid = serializer.is_valid()
print('is_valid ->', valid)
print('errors ->', serializer.errors)
print('initial_data ->', serializer.initial_data)
print('validated_data ->', getattr(serializer, 'validated_data', None))
