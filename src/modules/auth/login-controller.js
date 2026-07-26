import { login, logout } from '../../auth/auth-service.js';
import { getAuthState } from '../../auth/auth-state.js';
import { AUTH_ROUTES } from '../../auth/routes.js';
import { hasSessionError, restoreSession, startAuthStateListener, validateSession } from '../../auth/session.js';
import { StaffAccessError, validateAndCacheStaffProfile } from '../../auth/staff-access.js';
import { clearFieldErrors, setFieldError } from '../../components/form-field.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { initialisePasswordFields } from '../../components/password-field.js';

let failedAttempts = 0;
let blockedUntil = 0;

function getThrottleDelay() {
  return Math.min(15000, Math.max(0, failedAttempts - 2) * 5000);
}

function operationalErrorMessage() {
  return getAuthState().status === 'configuration_error'
    ? 'The application configuration is unavailable. Please contact an administrator.'
    : 'Unable to reach the authentication service. Check your connection and try again.';
}

export async function initialiseLoginPage() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  const feedback = document.querySelector('#login-feedback');
  const submitButton = form.querySelector('button[type="submit"]');
  const emailInput = form.elements.email;
  const passwordInput = form.elements.password;
  initialisePasswordFields(form);

  await restoreSession();
  if (hasSessionError()) {
    showFormFeedback(feedback, operationalErrorMessage());
  } else if (validateSession()) {
    try {
      await validateAndCacheStaffProfile();
      startAuthStateListener();
      window.location.assign(AUTH_ROUTES.authenticatedHome);
      return;
    } catch {
      await logout().catch(() => undefined);
      showFormFeedback(feedback, 'This account is not authorized to access NCARMS.');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    clearFormFeedback(feedback);

    const now = Date.now();
    if (now < blockedUntil) {
      const seconds = Math.ceil((blockedUntil - now) / 1000);
      showFormFeedback(feedback, `Please wait ${seconds} seconds before trying again.`);
      return;
    }

    let isValid = true;
    const email = emailInput.value.trim();
    if (!email) {
      setFieldError(emailInput, 'Email is required.');
      isValid = false;
    } else if (!emailInput.validity.valid) {
      setFieldError(emailInput, 'Enter a valid email address.');
      isValid = false;
    }
    if (!passwordInput.value) {
      setFieldError(passwordInput, 'Password is required.');
      isValid = false;
    }
    if (!isValid) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setButtonLoading(submitButton, true, 'Signing in…');
    try {
      const { user } = await login({ email, password: passwordInput.value });
      await validateAndCacheStaffProfile(user);
      failedAttempts = 0;
      window.location.assign(AUTH_ROUTES.authenticatedHome);
    } catch (error) {
      failedAttempts += 1;
      const delay = getThrottleDelay();
      blockedUntil = delay ? Date.now() + delay : 0;
      if (error instanceof StaffAccessError) {
        await logout().catch(() => undefined);
        showFormFeedback(feedback, 'This account is not authorized to access NCARMS.');
      } else {
        showFormFeedback(feedback, delay
          ? `Sign-in was not successful. Please wait ${delay / 1000} seconds before trying again.`
          : 'Sign-in was not successful. Check your email and password, then try again.');
      }
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

initialiseLoginPage();
