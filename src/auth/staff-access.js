import { selectRows } from '../../supabase/database.js';
import { getAuthState, getAuthenticatedStaffProfile, setAuthenticatedStaffProfile } from './auth-state.js';
import { isValidRole, normalizeRole } from './roles.js';

const STAFF_PROFILE_COLUMNS = 'id, full_name, email, role, department, created_at';

export class StaffAccessError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'StaffAccessError';
    this.code = code;
  }
}

export async function getStaffProfileByUserId(userId) {
  const profiles = await selectRows('staff_profiles', {
    columns: STAFF_PROFILE_COLUMNS,
    filters: { id: userId },
  });

  if (profiles.length !== 1) {
    throw new StaffAccessError('No authorized staff profile was found.', 'PROFILE_NOT_FOUND');
  }

  const profile = profiles[0];
  const role = normalizeRole(profile.role);
  if (!isValidRole(role)) {
    throw new StaffAccessError('The staff profile has an unsupported role.', 'UNSUPPORTED_ROLE');
  }

  return Object.freeze({ ...profile, role });
}

export async function validateAndCacheStaffProfile(user = getAuthState().user) {
  if (!user?.id) {
    throw new StaffAccessError('An authenticated user is required.', 'USER_REQUIRED');
  }

  const profile = await getStaffProfileByUserId(user.id);
  setAuthenticatedStaffProfile(profile);
  return profile;
}

export async function getCachedStaffProfile() {
  const cachedProfile = getAuthenticatedStaffProfile();
  const { user } = getAuthState();
  if (cachedProfile?.id === user?.id) return cachedProfile;
  return validateAndCacheStaffProfile(user);
}
