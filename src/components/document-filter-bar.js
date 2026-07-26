function createFilter({ id, label, options = [] }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'min-w-0';

  const labelElement = document.createElement('label');
  labelElement.className = 'sr-only';
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.className = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = `All ${label.toLowerCase()}`;
  select.append(allOption);
  options.forEach(({ value, label: optionLabel }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = optionLabel;
    select.append(option);
  });

  wrapper.append(labelElement, select);
  return wrapper;
}

export function createDocumentFilterBar(filters) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

  const legend = document.createElement('legend');
  legend.className = 'sr-only';
  legend.textContent = 'Document filters';
  fieldset.append(legend);
  filters.forEach((filter) => fieldset.append(createFilter(filter)));
  return fieldset;
}
