export function setButtonLoading(button, isLoading, loadingLabel = 'Please wait…') {
  const label = button.querySelector('[data-button-label]');
  if (!button.dataset.defaultLabel) button.dataset.defaultLabel = label?.textContent ?? button.textContent;

  button.disabled = isLoading;
  button.setAttribute('aria-busy', String(isLoading));
  if (label) label.textContent = isLoading ? loadingLabel : button.dataset.defaultLabel;
}
