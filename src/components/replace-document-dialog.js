import { createFilePicker } from './file-picker.js';
import { createUploadProgress } from './upload-progress.js';

export function createReplaceDocumentDialog({ originalFileName, documentType }) {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'replace-document-dialog-title');

  const panel = document.createElement('div');
  panel.className = 'ncarms-surface w-full max-w-lg p-6 shadow-xl';
  const title = document.createElement('h2');
  title.id = 'replace-document-dialog-title';
  title.className = 'text-lg font-semibold text-slate-900';
  title.textContent = 'Replace Document';
  const current = document.createElement('p');
  current.className = 'mt-2 text-sm leading-6 text-slate-600';
  current.textContent = `Current file: ${originalFileName || 'Not provided'} · ${documentType || 'Not provided'}`;
  const form = document.createElement('form');
  form.className = 'mt-4 space-y-4';
  form.noValidate = true;
  const feedback = document.createElement('div');
  feedback.hidden = true;
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  const picker = createFilePicker({ inputId: 'replacement-document-file', label: 'New file', description: 'Choose a replacement file no larger than 10 MB.' });
  const progress = createUploadProgress();
  const actions = document.createElement('div');
  actions.className = 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  cancel.textContent = 'Cancel';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const label = document.createElement('span');
  label.dataset.buttonLabel = '';
  label.textContent = 'Replace';
  submit.append(label);
  actions.append(cancel, submit);
  form.append(feedback, picker, progress, actions);
  panel.append(title, current, form);
  dialog.append(panel);
  document.body.append(dialog);
  return { dialog, form, fileInput: form.elements['replacement-document-file'], feedback, progress, cancel, submit };
}
