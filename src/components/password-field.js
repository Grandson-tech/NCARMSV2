export function initialisePasswordFields(scope = document) {
  scope.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
    const input = document.querySelector(toggle.dataset.passwordToggle);
    if (!input) return;

    toggle.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(isHidden));
      toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
}
