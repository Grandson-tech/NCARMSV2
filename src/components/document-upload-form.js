import { createFilePicker } from './file-picker.js';
import { createFormSection } from './form-section.js';
import { createUploadProgress } from './upload-progress.js';

const INPUT_CLASS = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

function createSelectField({ id, label, options, placeholder, selectedValue = '' }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  const labelElement = document.createElement('label');
  labelElement.className = 'text-sm font-medium text-slate-700';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const requiredIndicator = document.createElement('span');
  requiredIndicator.className = 'ml-1 text-red-700';
  requiredIndicator.setAttribute('aria-hidden', 'true');
  requiredIndicator.textContent = '*';
  labelElement.append(requiredIndicator);
  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.required = true;
  select.className = INPUT_CLASS;
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);
  options.forEach(({ value, label: optionLabel }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = optionLabel;
    select.append(option);
  });
  select.value = selectedValue;
  const error = document.createElement('p');
  error.id = `${id}-error`;
  error.className = 'hidden text-xs text-red-700';
  error.dataset.errorFor = id;
  select.setAttribute('aria-describedby', error.id);
  wrapper.append(labelElement, select, error);
  return wrapper;
}

export function createDocumentUploadForm({ students, documentTypes, selectedStudentId = '', registrationCompletion = false }) {
  const form = document.createElement('form');
  form.id = 'document-upload-form';
  form.className = 'space-y-6';
  form.noValidate = true;

  const feedback = document.createElement('div');
  feedback.id = 'document-upload-feedback';
  feedback.hidden = true;
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.fullName ?? 'Not provided'} — ${student.studentNumber ?? 'Not provided'}`,
  }));
  const typeOptions = documentTypes.map((type) => ({ value: type, label: type }));
  const detailsGrid = document.createElement('div');
  detailsGrid.className = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  detailsGrid.append(
    createSelectField({ id: 'document-student-id', label: 'Student', options: studentOptions, placeholder: 'Select a student', selectedValue: selectedStudentId }),
    createSelectField({ id: 'document-type', label: 'Document type', options: typeOptions, placeholder: 'Select a document type' }),
  );
  const progress = createUploadProgress();
  const actions = document.createElement('div');
  actions.className = 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('a');
  cancel.href = registrationCompletion ? `student-details.html?id=${encodeURIComponent(selectedStudentId)}` : 'documents.html';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  cancel.textContent = registrationCompletion ? 'Skip for Now' : 'Cancel';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const label = document.createElement('span');
  label.dataset.buttonLabel = '';
  label.textContent = registrationCompletion ? 'Upload Documents' : 'Upload document';
  submit.append(label);
  actions.append(cancel, submit);

  form.append(
    feedback,
    createFormSection({ id: 'document-information-section', title: 'Document Information', description: 'Select the student and document type.', content: detailsGrid }),
    createFormSection({ id: 'document-file-section', title: 'File', description: 'Choose a file no larger than 10 MB.', content: createFilePicker({ inputId: 'document-file', label: 'Document file', description: 'The selected file will be uploaded to the secure documents bucket.' }) }),
    progress,
    actions,
  );
  return form;
}
