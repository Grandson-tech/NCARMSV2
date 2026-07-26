export function createUploadProgress() {
  const container = document.createElement('div');
  container.className = 'rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 shadow-sm';
  container.hidden = true;
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-busy', 'false');
  const message = document.createElement('p');
  message.dataset.uploadProgressMessage = '';
  container.append(message);
  return container;
}

export function setUploadProgress(container, { active, message = '' }) {
  container.hidden = !active;
  container.setAttribute('aria-busy', String(active));
  container.querySelector('[data-upload-progress-message]').textContent = message;
}
