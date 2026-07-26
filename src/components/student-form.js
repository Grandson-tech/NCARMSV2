import { createDateRange } from './date-range.js';
import { createFormSection } from './form-section.js';
import { createImagePicker } from './image-picker.js';

const INPUT_CLASS = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

function field({ id, label, type = 'text', required = false, multiline = false, value = '', readOnly = false }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  if (required) {
    const indicator = document.createElement('span');
    indicator.className = 'ml-1 text-red-700';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '*';
    labelElement.append(indicator);
  }
  const input = multiline ? document.createElement('textarea') : document.createElement('input');
  input.id = id;
  input.name = id;
  if (!multiline) input.type = type;
  input.required = required;
  input.value = value ?? '';
  input.readOnly = readOnly;
  if (readOnly) input.classList.add('bg-slate-100', 'text-slate-500');
  input.className = multiline ? `${INPUT_CLASS} min-h-24 py-2` : INPUT_CLASS;
  const error = document.createElement('p');
  error.id = `${id}-error`;
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = id;
  input.setAttribute('aria-describedby', error.id);
  wrapper.append(labelElement, input, error);
  return wrapper;
}

function departmentField({ departments, value = '' }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = 'department-id';
  labelElement.textContent = 'Department';
  const indicator = document.createElement('span');
  indicator.className = 'ml-1 text-red-700';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.textContent = '*';
  labelElement.append(indicator);
  const select = document.createElement('select');
  select.id = 'department-id';
  select.name = 'department-id';
  select.required = true;
  select.className = INPUT_CLASS;
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a department';
  select.append(placeholder);
  departments.forEach((department) => {
    const option = document.createElement('option');
    option.value = department.id;
    option.textContent = department.name;
    option.selected = department.id === value;
    select.append(option);
  });
  const error = document.createElement('p');
  error.id = 'department-id-error';
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = 'department-id';
  select.setAttribute('aria-describedby', error.id);
  wrapper.append(labelElement, select, error);
  return wrapper;
}

function grid(fields) {
  const element = document.createElement('div');
  element.className = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  fields.forEach((item) => element.append(item));
  return element;
}

function attachmentCycleInfo(cycle) {
  const card = document.createElement('div');
  card.className = 'rounded-control border border-slate-200 bg-slate-50 p-4 shadow-surface';
  const label = document.createElement('p');
  label.className = 'text-sm font-medium text-slate-700';
  label.textContent = 'Attachment Cycle';
  const value = document.createElement('p');
  value.className = 'mt-1 text-sm text-slate-900';
  value.textContent = cycle?.label ?? 'No attachment cycle assigned';
  card.append(label, value);
  return card;
}

export function createStudentForm({ mode = 'create', initialValues = {}, photoUrl = null, departments = [], attachmentCycle = null } = {}) {
  const form = document.createElement('form');
  form.id = `${mode}-student-form`;
  form.className = 'space-y-6';
  form.noValidate = true;
  const feedback = document.createElement('div');
  feedback.id = `${mode}-student-feedback`;
  feedback.dataset.studentFeedback = '';
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  feedback.hidden = true;
  const required = grid([
    field({ id: 'full-name', label: 'Full name', required: true, value: initialValues.fullName }),
    field({ id: 'student-number', label: 'Student number', required: true, value: initialValues.studentNumber, readOnly: mode === 'edit' }),
    departmentField({ departments, value: initialValues.departmentId }),
  ]);
  const optional = grid([
    field({ id: 'email', label: 'Email', type: 'email', value: initialValues.email }), field({ id: 'phone', label: 'Phone', value: initialValues.phone }),
    field({ id: 'national-id', label: 'National ID', value: initialValues.nationalId }), field({ id: 'university', label: 'University', value: initialValues.university }),
    field({ id: 'course', label: 'Course', value: initialValues.course }), field({ id: 'placement-reference', label: 'Placement reference', value: initialValues.placementReference }),
  ]);
  const skills = field({ id: 'skills', label: 'Skills', multiline: true, value: initialValues.skills });
  form.append(
    feedback,
    createFormSection({ id: 'student-photo-section', title: 'Passport Photo', description: mode === 'edit' ? 'Select a new image only when replacing the current passport photo.' : 'Optional. It will be uploaded when the student record is created.', content: createImagePicker({ inputId: 'passport-photo', label: 'Passport photo', initialUrl: photoUrl }) }),
    createFormSection({ id: 'student-core-section', title: 'Student Information', description: 'Fields marked with an asterisk are required.', content: required }),
    createFormSection({ id: 'student-cycle-section', title: mode === 'create' ? 'Current Attachment Cycle' : 'Assigned Attachment Cycle', description: mode === 'create' ? 'New student records are assigned to the active cycle.' : 'The assigned attachment cycle cannot be changed here.', content: attachmentCycleInfo(attachmentCycle) }),
    createFormSection({ id: 'student-contact-section', title: 'Additional Information', description: 'Optional verified information.', content: optional }),
    createFormSection({ id: 'student-skills-section', title: 'Skills', description: 'Optional verified information.', content: skills }),
    createFormSection({ id: 'student-dates-section', title: 'Attachment Dates', description: 'Optional verified dates.', content: createDateRange() }),
  );
  const note = document.createElement('p');
  note.className = 'text-xs leading-5 text-slate-500';
  note.textContent = 'Address, emergency contact, and notes fields are not shown because they are not verified columns in the current schema.';
  const actions = document.createElement('div');
  actions.className = 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('a');
  cancel.href = 'student-records.html';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  cancel.textContent = 'Cancel';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const label = document.createElement('span');
  label.dataset.buttonLabel = '';
  label.textContent = mode === 'edit' ? 'Save changes' : 'Create student record';
  submit.append(label);
  actions.append(cancel, submit);
  form.append(note, actions);
  form.elements['attachment-start-date'].value = initialValues.attachmentStartDate ?? '';
  form.elements['attachment-end-date'].value = initialValues.attachmentEndDate ?? '';
  return form;
}
