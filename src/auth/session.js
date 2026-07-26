import { getSession, onAuthStateChange } from '../../supabase/auth.js';
import { AUTH_STATUS, getAuthState, resetAuthState, updateAuthState } from './auth-state.js';

let restorePromise;
let authSubscription;

function applySession(session) {
  const currentState = getAuthState();
  return session
    ? updateAuthState({
      user: session.user,
      session,
      staffProfile: currentState.staffProfile?.id === session.user?.id ? currentState.staffProfile : null,
      status: AUTH_STATUS.AUTHENTICATED,
    })
    : resetAuthState();
}

function handleSessionError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const isConfigurationError = message.includes('Supabase configuration is unavailable');
  const isNetworkError = error instanceof TypeError || /network|fetch|offline/i.test(message);

  return updateAuthState({
    status: isConfigurationError
      ? AUTH_STATUS.CONFIGURATION_ERROR
      : isNetworkError
        ? AUTH_STATUS.NETWORK_ERROR
        : AUTH_STATUS.UNAUTHENTICATED,
    error,
  });
}

export async function restoreSession({ force = false } = {}) {
  const currentState = getAuthState();
  if (!force && currentState.status !== AUTH_STATUS.UNKNOWN) return currentState;
  if (restorePromise) return restorePromise;

  restorePromise = getSession()
    .then(({ session }) => applySession(session))
    .catch(handleSessionError)
    .finally(() => { restorePromise = undefined; });

  return restorePromise;
}

export function startAuthStateListener() {
  if (authSubscription) return () => stopAuthStateListener();

  const { data } = onAuthStateChange((_event, session) => applySession(session));
  authSubscription = data.subscription;
  return () => stopAuthStateListener();
}

export function stopAuthStateListener() {
  authSubscription?.unsubscribe();
  authSubscription = undefined;
}

export function validateSession() {
  const { session, status } = getAuthState();
  const expiresAt = session?.expires_at ?? 0;
  const isExpired = expiresAt > 0 && expiresAt * 1000 <= Date.now();

  if (status !== AUTH_STATUS.AUTHENTICATED || !session || isExpired) {
    if (isExpired) resetAuthState();
    return false;
  }

  return true;
}

export function hasSessionError() {
  const { status } = getAuthState();
  return status === AUTH_STATUS.CONFIGURATION_ERROR || status === AUTH_STATUS.NETWORK_ERROR;
}

export function setSession(session) {
  return applySession(session);
}
