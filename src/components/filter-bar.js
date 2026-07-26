function createFilter({ id, label, allLabel }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'min-w-0';

  const labelElement = document.createElement('label');
  labelElement.className = 'sr-only';
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.className = 'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const option = document.createElement('option');
  option.value = '';
  option.textContent = allLabel ?? `All ${label.toLowerCase()}`;
  select.append(option);
  wrapper.append(labelElement, select);
  return wrapper;
}

export function createFilterBar(filters) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4';

  const legend = document.createElement('legend');
  legend.className = 'sr-only';
  legend.textContent = 'Student record filters';
  fieldset.append(legend);

  filters.forEach((filter) => fieldset.append(createFilter(filter)));
  return fieldset;
}

export function setFilterOptions(select, options) {
  if (!select) return;
  const allOption = select.options[0]?.cloneNode(true);
  select.replaceChildren(allOption);
  options.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
}
