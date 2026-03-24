from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from usuarios.models import Usuario
from asistencia.models import RegistroAsistencia
from rest_framework import status
from django.utils import timezone


class AsistenciaAPITests(APITestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = Usuario.objects.create_user(username='u1', password='pass')
		self.other = Usuario.objects.create_user(username='u2', password='pass')
		self.supervisor = Usuario.objects.create_user(username='sup', password='pass', rol='SUP')
		self.url = '/api/asistencia/registros/'

	def test_create_entrada_success(self):
		self.client.force_authenticate(self.user)
		data = {'tipo': 'ENT'}
		resp = self.client.post(self.url, data, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
		self.assertTrue(RegistroAsistencia.objects.filter(usuario=self.user, tipo='ENT', fecha=timezone.localdate()).exists())

	def test_cannot_create_duplicate_entrada(self):
		self.client.force_authenticate(self.user)
		data = {'tipo': 'ENT'}
		resp1 = self.client.post(self.url, data, format='json')
		self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)
		resp2 = self.client.post(self.url, data, format='json')
		self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

	def test_cannot_create_salida_without_entrada(self):
		self.client.force_authenticate(self.user)
		data = {'tipo': 'SAL'}
		resp = self.client.post(self.url, data, format='json')
		self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

	def test_create_salida_after_entrada(self):
		self.client.force_authenticate(self.user)
		resp1 = self.client.post(self.url, {'tipo': 'ENT'}, format='json')
		self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)
		resp2 = self.client.post(self.url, {'tipo': 'SAL'}, format='json')
		self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)

	def test_supervisor_can_create_for_other(self):
		self.client.force_authenticate(self.supervisor)
		resp = self.client.post(self.url, {'usuario': self.other.id, 'tipo': 'ENT'}, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
		self.assertTrue(RegistroAsistencia.objects.filter(usuario=self.other, tipo='ENT', fecha=timezone.localdate()).exists())

	def test_user_cannot_create_for_another(self):
		self.client.force_authenticate(self.user)
		resp = self.client.post(self.url, {'usuario': self.other.id, 'tipo': 'ENT'}, format='json')
		self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
