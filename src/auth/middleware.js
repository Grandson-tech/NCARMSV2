import { hasSessionError, restoreSession, startAuthStateListener, validateSession } from './session.js';

export async function requireAuthenticatedSession() {
  await restoreSession();
  if (hasSessionError()) return false;
  startAuthStateListener();
  return validateSession();
}

export async function requireGuestSession() {
  await restoreSession();
  if (hasSessionError()) return false;
  return !validateSession();
}

export async function withAuthenticatedSession(callback) {
  if (!await requireAuthenticatedSession()) return undefined;
  return callback();
}

export async function withGuestSession(callback) {
  if (!await requireGuestSession()) return undefined;
  return callback();
}
