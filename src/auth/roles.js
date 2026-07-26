export const STAFF_ROLES = Object.freeze({
  OWNER: 'owner',
  ICT_OFFICER: 'ict_officer',
  HR_OFFICER: 'hr_officer',
});

export const ROLE_VALUES = Object.freeze(Object.values(STAFF_ROLES));

export function isValidRole(role) {
  return ROLE_VALUES.includes(role);
}

export function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}
