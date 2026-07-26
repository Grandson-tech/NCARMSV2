export function setFieldError(input, message = '') {
  const errorElement = document.querySelector(`[data-error-for="${input.id}"]`);
  input.setAttribute('aria-invalid', String(Boolean(message)));
  input.classList.toggle('border-red-500', Boolean(message));
  input.classList.toggle('focus:border-red-500', Boolean(message));
  input.classList.toggle('focus:ring-red-500/20', Boolean(message));

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.toggle('hidden', !message);
  }
}

export function clearFieldErrors(form) {
  form.querySelectorAll('input').forEach((input) => setFieldError(input));
}
