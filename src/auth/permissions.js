import { STAFF_ROLES, isValidRole, normalizeRole } from './roles.js';

export const PERMISSIONS = Object.freeze({
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_STUDENTS: 'view_students',
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_DOCUMENTS: 'manage_documents',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_USERS: 'manage_users',
});

const ROLE_PERMISSIONS = Object.freeze({
  [STAFF_ROLES.OWNER]: Object.values(PERMISSIONS),
  [STAFF_ROLES.ICT_OFFICER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.MANAGE_STUDENTS, PERMISSIONS.MANAGE_DOCUMENTS, PERMISSIONS.VIEW_REPORTS],
  [STAFF_ROLES.HR_OFFICER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.MANAGE_STUDENTS, PERMISSIONS.VIEW_REPORTS],
});

export function getRolePermissions(role) {
  const normalizedRole = normalizeRole(role);
  return isValidRole(normalizedRole) ? [...ROLE_PERMISSIONS[normalizedRole]] : [];
}

export function hasPermission(role, permission) {
  return getRolePermissions(role).includes(permission);
}

export function hasAnyPermission(role, permissions) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role, permissions) {
  return permissions.every((permission) => hasPermission(role, permission));
}
