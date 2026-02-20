from rest_framework import permissions


class EsSupervisorOArquitecto(permissions.BasePermission):
    """
    Permiso personalizado para verificar si el usuario es Supervisor o Arquitecto.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.rol in ['SUP', 'ARQ', 'ADM']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
