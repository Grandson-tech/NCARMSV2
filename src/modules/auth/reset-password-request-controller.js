import { sendPasswordReset } from '../../auth/auth-service.js';
import { setFieldError } from '../../components/form-field.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';

function getRecoveryRedirectUrl() {
  return new URL('reset-password.html', window.location.href).toString();
}

function initialisePasswordResetRequestPage() {
  const form = document.querySelector('#password-reset-request-form');
  if (!form) return;
  const emailInput = form.elements.email;
  const feedback = document.querySelector('#password-reset-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormFeedback(feedback);
    setFieldError(emailInput);
    const email = emailInput.value.trim();
    if (!email || !emailInput.validity.valid) {
      setFieldError(emailInput, 'Enter a valid email address.');
      emailInput.focus();
      return;
    }

    setButtonLoading(submitButton, true, 'Sending…');
    try {
      await sendPasswordReset(email, getRecoveryRedirectUrl());
      showFormFeedback(feedback, 'If this email belongs to an NCARMS account, password reset instructions will be sent shortly.', 'success');
      form.reset();
    } catch {
      showFormFeedback(feedback, 'Unable to process the request right now. Please try again.');
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

initialisePasswordResetRequestPage();
