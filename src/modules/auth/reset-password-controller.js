import { logout, updatePassword } from '../../auth/auth-service.js';
import { AUTH_ROUTES } from '../../auth/routes.js';
import { restoreSession, validateSession } from '../../auth/session.js';
import { clearFieldErrors, setFieldError } from '../../components/form-field.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { initialisePasswordFields } from '../../components/password-field.js';

async function initialisePasswordResetPage() {
  const form = document.querySelector('#reset-password-form');
  if (!form) return;
  const feedback = document.querySelector('#reset-password-feedback');
  const submitButton = form.querySelector('button[type="submit"]');
  const passwordInput = form.elements.password;
  const confirmationInput = form.elements.passwordConfirmation;
  initialisePasswordFields(form);

  await restoreSession({ force: true });
  if (!validateSession()) {
    showFormFeedback(feedback, 'This password reset link is invalid or has expired. Request a new link to continue.');
    submitButton.disabled = true;
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    clearFormFeedback(feedback);
    let isValid = true;
    if (!passwordInput.value) {
      setFieldError(passwordInput, 'Enter a new password.');
      isValid = false;
    }
    if (!confirmationInput.value) {
      setFieldError(confirmationInput, 'Confirm your new password.');
      isValid = false;
    } else if (passwordInput.value !== confirmationInput.value) {
      setFieldError(confirmationInput, 'Passwords do not match.');
      isValid = false;
    }
    if (!isValid) return;

    setButtonLoading(submitButton, true, 'Updating…');
    try {
      await updatePassword(passwordInput.value);
      await logout();
      window.location.assign(AUTH_ROUTES.login);
    } catch {
      showFormFeedback(feedback, 'Unable to update the password. Request a new reset link and try again.');
      setButtonLoading(submitButton, false);
    }
  });
}

initialisePasswordResetPage();
