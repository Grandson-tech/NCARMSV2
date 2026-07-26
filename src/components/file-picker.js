export function createFilePicker({ inputId, label, description }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';

  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = inputId;
  labelElement.textContent = label;
  const requiredIndicator = document.createElement('span');
  requiredIndicator.className = 'ml-1 text-red-700';
  requiredIndicator.setAttribute('aria-hidden', 'true');
  requiredIndicator.textContent = '*';
  labelElement.append(requiredIndicator);

  const input = document.createElement('input');
  input.id = inputId;
  input.name = inputId;
  input.type = 'file';
  input.required = true;
  input.className = 'block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 shadow-sm file:mr-4 file:h-10 file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const supportingText = document.createElement('p');
  supportingText.className = 'text-xs leading-5 text-slate-500';
  supportingText.textContent = description;
  const selectedFile = document.createElement('p');
  selectedFile.className = 'text-xs text-slate-600';
  selectedFile.setAttribute('aria-live', 'polite');
  const error = document.createElement('p');
  error.id = `${inputId}-error`;
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = inputId;
  input.setAttribute('aria-describedby', `${supportingText.id || `${inputId}-description`} ${error.id}`);
  supportingText.id = `${inputId}-description`;

  input.addEventListener('change', () => {
    selectedFile.textContent = input.files?.[0]?.name ? `Selected file: ${input.files[0].name}` : '';
  });

  wrapper.append(labelElement, input, supportingText, selectedFile, error);
  return wrapper;
}
