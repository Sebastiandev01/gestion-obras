# 🏗️ Sistema de Gestión de Obras

Sistema web completo para la gestión de proyectos de construcción, desarrollado con **Django (Backend)** y **React (Frontend)**.

---

##  Demo

![Demo](demo.gif)



---

##  Descripción

Este sistema permite administrar de forma eficiente todas las operaciones de una empresa constructora, incluyendo gestión de proyectos, personal, materiales y asistencia.

Está diseñado con una arquitectura escalable basada en API REST, facilitando su integración con aplicaciones móviles u otros sistemas.

---

##  Características principales

*  Gestión de proyectos y obras
*  Control de materiales e inventario
*  Gestión de personal y nómina
*  Control de asistencia
*  Sistema de autenticación y permisos
*  API REST con Django REST Framework

---

## Tecnologías utilizadas

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL

### Frontend

* React
* Vite
* Bootstrap / CSS

### Otros

* Git & GitHub
* REST APIs

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Sebastiandev01/gestion-obras.git
cd gestion-obras
```

### 2. Configurar entorno backend

```bash
python -m venv venv

# Activar entorno virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

### 3. Configurar frontend

```bash
cd frontend
npm install
```

### 4. Variables de entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales (base de datos, secret key, etc.)

---

## Ejecución

### Backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## Estructura del proyecto

```
gestion-obras/
├── backend/
├── frontend/
├── asistencia/
├── materiales/
├── nomina/
├── obras/
├── proyectos/
└── usuarios/
```

---

## Arquitectura

* Backend desacoplado con API REST
* Frontend independiente en React
* Base de datos relacional con PostgreSQL
* Sistema modular por aplicaciones Django

---

## Despliegue

### Producción

* Nginx (servidor web)
* Gunicorn (WSGI)
* PostgreSQL
* Configuración de variables de entorno
* SSL/TLS

---

## Contribuciones

Las contribuciones son bienvenidas:

```bash
git checkout -b feature/nueva-funcionalidad
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

---

## Licencia

MIT License

---

## Autor

**Sebastián Ávila**

 [sebastian1996avila@gmail.com](mailto:sebastian1996avila@gmail.com)
 https://github.com/Sebastiandev01

---

##  Nota

Este proyecto hace parte de mi portafolio como desarrollador enfocado en **Django y desarrollo backend**, mostrando habilidades en arquitectura de sistemas, APIs REST y desarrollo fullstack.
