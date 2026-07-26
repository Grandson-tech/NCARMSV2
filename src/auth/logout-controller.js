import { logout } from './auth-service.js';
import { AUTH_ROUTES } from './routes.js';

let isInitialised = false;

export function initialiseLogoutController() {
  if (isInitialised) return;
  isInitialised = true;

  document.addEventListener('click', async (event) => {
    const logoutTrigger = event.target.closest('[data-action="logout"]');
    if (!logoutTrigger) return;

    event.preventDefault();
    if (logoutTrigger.dataset.loading === 'true') return;
    logoutTrigger.dataset.loading = 'true';
    logoutTrigger.setAttribute('aria-disabled', 'true');

    try {
      await logout();
    } finally {
      window.location.assign(AUTH_ROUTES.login);
    }
  });
}
