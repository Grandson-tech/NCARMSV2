function createSelect({ id, label, allLabel, options }) {
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
  allOption.textContent = allLabel;
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

function createDateInput({ id, label }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'min-w-0';
  const labelElement = document.createElement('label');
  labelElement.className = 'sr-only';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = 'date';
  input.className = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  wrapper.append(labelElement, input);
  return wrapper;
}

export function createReportFilterBar({ departments = [], universities = [], attachmentCycles = [] } = {}) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5';
  const legend = document.createElement('legend');
  legend.className = 'sr-only';
  legend.textContent = 'Report filters';
  fieldset.append(
    legend,
    createSelect({ id: 'report-filter-department', label: 'Department', allLabel: 'All Departments', options: departments }),
    createSelect({ id: 'report-filter-university', label: 'University', allLabel: 'All Universities', options: universities }),
    createSelect({ id: 'report-filter-cycle', label: 'Attachment Cycle', allLabel: 'All Attachment Cycles', options: attachmentCycles }),
    createDateInput({ id: 'report-filter-date-from', label: 'Registration date from' }),
    createDateInput({ id: 'report-filter-date-to', label: 'Registration date to' }),
  );
  return fieldset;
}
