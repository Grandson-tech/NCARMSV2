export const AUTH_STATUS = Object.freeze({
  UNKNOWN: 'unknown',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  CONFIGURATION_ERROR: 'configuration_error',
  NETWORK_ERROR: 'network_error',
});

let state = Object.freeze({
  user: null,
  session: null,
  staffProfile: null,
  status: AUTH_STATUS.UNKNOWN,
  error: null,
});

const subscribers = new Set();
const STAFF_PROFILE_STORAGE_KEY = 'ncarms.auth.staff-profile';

function getSessionStorage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function readStoredStaffProfile() {
  try {
    const value = getSessionStorage()?.getItem(STAFF_PROFILE_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function persistStaffProfile(staffProfile) {
  try {
    const storage = getSessionStorage();
    if (staffProfile) storage?.setItem(STAFF_PROFILE_STORAGE_KEY, JSON.stringify(staffProfile));
    else storage?.removeItem(STAFF_PROFILE_STORAGE_KEY);
  } catch {
    // Storage availability does not prevent in-memory authentication state.
  }
}

function notify() {
  subscribers.forEach((subscriber) => subscriber(state));
}

export function getAuthState() {
  return state;
}

export function updateAuthState({
  user = state.user,
  session = state.session,
  staffProfile = state.staffProfile,
  status,
  error = null,
} = {}) {
  state = Object.freeze({
    user: user ?? session?.user ?? null,
    session,
    staffProfile,
    status: status ?? (session ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED),
    error,
  });
  notify();
  return state;
}

export function resetAuthState() {
  persistStaffProfile(null);
  return updateAuthState({
    user: null,
    session: null,
    staffProfile: null,
    status: AUTH_STATUS.UNAUTHENTICATED,
  });
}

export function getAuthenticatedStaffProfile() {
  return state.staffProfile ?? readStoredStaffProfile();
}

export function setAuthenticatedStaffProfile(staffProfile) {
  persistStaffProfile(staffProfile);
  return updateAuthState({ staffProfile });
}

export function subscribeToAuthState(subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}
