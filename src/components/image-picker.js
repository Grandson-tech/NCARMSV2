import { getPassportPhotoValidationMessage, resolvePassportPhotoUrl } from '../shared/passport-photo-storage.js';

export function createImagePicker({ inputId, label, initialUrl = null, readOnly = false }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 sm:flex-row sm:items-center';
  const preview = document.createElement('div');
  preview.className = 'flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-medium text-slate-500';
  preview.textContent = 'No photo';
  const renderPlaceholder = () => {
    preview.replaceChildren();
    preview.textContent = 'No photo';
  };
  const renderPreview = (url, alt) => {
    const image = document.createElement('img');
    image.className = 'h-full w-full object-cover';
    image.src = url;
    image.alt = alt;
    image.addEventListener('error', renderPlaceholder, { once: true });
    preview.replaceChildren(image);
  };
  if (initialUrl) resolvePassportPhotoUrl(initialUrl).then((url) => {
    if (url) renderPreview(url, 'Passport photo');
  }).catch(renderPlaceholder);
  const content = document.createElement('div');
  content.className = 'min-w-0 flex-1';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = inputId;
  labelElement.textContent = label;
  const input = document.createElement('input');
  input.id = inputId;
  input.name = inputId;
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.disabled = readOnly;
  input.className = 'mt-1 block w-full text-sm text-slate-700 file:mr-4 file:h-10 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const note = document.createElement('p');
  note.id = `${inputId}-note`;
  note.className = 'mt-2 text-xs leading-5 text-slate-500';
  note.textContent = readOnly ? 'Photo updates are not available.' : 'JPEG, PNG, or WEBP. Maximum file size: 2 MB.';
  const error = document.createElement('p');
  error.id = `${inputId}-error`;
  error.dataset.errorFor = inputId;
  error.className = 'hidden mt-2 text-xs text-red-700';
  input.setAttribute('aria-describedby', `${note.id} ${error.id}`);
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    const validationMessage = getPassportPhotoValidationMessage(file);
    if (validationMessage) {
      error.textContent = validationMessage;
      error.classList.remove('hidden');
      input.setAttribute('aria-invalid', 'true');
      input.value = '';
      renderPlaceholder();
      return;
    }
    error.textContent = '';
    error.classList.add('hidden');
    input.setAttribute('aria-invalid', 'false');
    if (!file) { renderPlaceholder(); return; }
    const previewUrl = URL.createObjectURL(file);
    renderPreview(previewUrl, 'Selected passport photo preview');
    const image = preview.querySelector('img');
    image?.addEventListener('load', () => URL.revokeObjectURL(previewUrl), { once: true });
    image?.addEventListener('error', () => URL.revokeObjectURL(previewUrl), { once: true });
  });
  content.append(labelElement, input, note, error);
  container.append(preview, content);
  return container;
}
