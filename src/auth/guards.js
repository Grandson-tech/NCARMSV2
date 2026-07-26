import { AUTH_ROUTES } from './routes.js';
import { requireAuthenticatedSession, requireGuestSession } from './middleware.js';
import { hasSessionError } from './session.js';

function redirect(path) {
  window.location.assign(path);
}

export async function protectAuthenticatedPage({ redirectTo = AUTH_ROUTES.login } = {}) {
  if (await requireAuthenticatedSession()) return true;
  if (hasSessionError()) return false;
  redirect(redirectTo);
  return false;
}

export async function redirectAuthenticatedUser({ redirectTo = AUTH_ROUTES.authenticatedHome } = {}) {
  if (await requireGuestSession()) return false;
  if (hasSessionError()) return false;
  redirect(redirectTo);
  return true;
}
