const MONTHS = Object.freeze(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
const INPUT_CLASS = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

function createField({ id, label, type = 'text', value = '', min, max }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = true;
  input.value = value ?? '';
  input.className = INPUT_CLASS;
  if (min !== undefined) input.min = String(min);
  if (max !== undefined) input.max = String(max);
  const error = document.createElement('p');
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = id;
  wrapper.append(labelElement, input, error);
  return wrapper;
}

function createMonthField(id, label, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.required = true;
  select.className = INPUT_CLASS;
  MONTHS.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = String(index + 1);
    option.textContent = month;
    select.append(option);
  });
  select.value = String(value ?? 1);
  const error = document.createElement('p');
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = id;
  wrapper.append(labelElement, select, error);
  return wrapper;
}

export function createAttachmentCycleDialog({ mode, cycle = null }) {
  const isEdit = mode === 'edit';
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'attachment-cycle-dialog-title');
  const panel = document.createElement('div');
  panel.className = 'ncarms-surface w-full max-w-lg p-6 shadow-xl';
  const title = document.createElement('h2');
  title.id = 'attachment-cycle-dialog-title';
  title.className = 'text-lg font-semibold text-slate-900';
  title.textContent = isEdit ? 'Edit Attachment Cycle' : 'Create Attachment Cycle';
  const form = document.createElement('form');
  form.className = 'mt-4 space-y-4';
  form.noValidate = true;
  const feedback = document.createElement('div');
  feedback.hidden = true;
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  const fields = document.createElement('div');
  fields.className = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  fields.append(
    createField({ id: 'attachment-cycle-name', label: 'Cycle Name', value: cycle?.name }),
    createField({ id: 'attachment-cycle-year', label: 'Year', type: 'number', value: cycle?.year, min: 2000, max: 2200 }),
    createMonthField('attachment-cycle-start-month', 'Start Month', cycle?.startMonth),
    createMonthField('attachment-cycle-end-month', 'End Month', cycle?.endMonth),
  );
  const activateLabel = document.createElement('label');
  activateLabel.className = 'flex items-center gap-2 text-sm text-slate-700';
  const activate = document.createElement('input');
  activate.type = 'checkbox';
  activate.name = 'attachment-cycle-activate';
  activate.checked = Boolean(cycle?.isActive);
  activateLabel.append(activate, document.createTextNode('Activate immediately'));
  const actions = document.createElement('div');
  actions.className = 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  cancel.textContent = 'Cancel';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const submitLabel = document.createElement('span');
  submitLabel.dataset.buttonLabel = '';
  submitLabel.textContent = isEdit ? 'Save Changes' : 'Create Cycle';
  submit.append(submitLabel);
  actions.append(cancel, submit);
  form.append(feedback, fields, activateLabel, actions);
  panel.append(title, form);
  dialog.append(panel);
  document.body.append(dialog);
  return { dialog, form, feedback, cancel, submit };
}
