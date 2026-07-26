function dateField(id, label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = 'date';
  input.className = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const error = document.createElement('p');
  error.id = `${id}-error`;
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = id;
  input.setAttribute('aria-describedby', error.id);
  wrapper.append(labelElement, input, error);
  return wrapper;
}

export function createDateRange() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  grid.append(dateField('attachment-start-date', 'Attachment start date'), dateField('attachment-end-date', 'Attachment end date'));
  return grid;
}
