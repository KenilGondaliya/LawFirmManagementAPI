// src/hooks/usePermissions.ts
import { useAuthStore } from '../stores/authStore';

export const usePermissions = () => {
  const { user, currentFirm } = useAuthStore();
  
  const hasRole = (roles: string | string[]): boolean => {
    const userRoles = user?.roles ?? [];
    if (!userRoles.length) return false;

    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.some(role => userRoles.includes(role));
  };
  
  const hasPermission = (permission: string): boolean => {
    // Get permissions from JWT claims
    // This would need to be parsed from the token
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return permissions.includes(permission);
  };
  
  const canView = (resource: string): boolean => {
    return hasPermission(`can_view_${resource}`);
  };
  
  const canEdit = (resource: string): boolean => {
    return hasPermission(`can_edit_${resource}`);
  };
  
  const canDelete = (resource: string): boolean => {
    return hasPermission(`can_delete_${resource}`);
  };
  
  const canManageUsers = (): boolean => {
    return hasPermission('can_manage_users');
  };
  
  const isOwner = (): boolean => {
    return hasRole('OWNER');
  };
  
  const isAdmin = (): boolean => {
    return hasRole(['OWNER', 'ADMIN']);
  };
  
  const isManager = (): boolean => {
    return hasRole(['OWNER', 'ADMIN', 'MANAGER']);
  };
  
  return {
    hasRole,
    hasPermission,
    canView,
    canEdit,
    canDelete,
    canManageUsers,
    isOwner,
    isAdmin,
    isManager
  };
};