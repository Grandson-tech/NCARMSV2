export function createDocumentSearchBar({ id, label, placeholder }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full';

  const accessibleLabel = document.createElement('label');
  accessibleLabel.className = 'sr-only';
  accessibleLabel.htmlFor = id;
  accessibleLabel.textContent = label;

  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = 'search';
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.className = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  wrapper.append(accessibleLabel, input);
  return wrapper;
}
