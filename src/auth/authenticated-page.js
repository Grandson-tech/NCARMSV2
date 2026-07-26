import { logout } from './auth-service.js';
import { protectAuthenticatedPage } from './guards.js';
import { initialiseLogoutController } from './logout-controller.js';
import { AUTH_ROUTES } from './routes.js';
import { getCachedStaffProfile } from './staff-access.js';

export async function initialiseAuthenticatedPage() {
  if (!await protectAuthenticatedPage()) return false;

  try {
    await getCachedStaffProfile();
    initialiseLogoutController();
    return true;
  } catch {
    await logout().catch(() => undefined);
    window.location.assign(AUTH_ROUTES.login);
    return false;
  }
}
