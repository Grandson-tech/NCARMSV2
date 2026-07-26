import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { archiveStudentRecord } from './archive-student-service.js';

function createFeedback(root) {
  const feedback = document.createElement('div');
  feedback.className = 'mb-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  root.prepend(feedback);
  return feedback;
}

function createConfirmationDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/40 p-4';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'archive-student-dialog-title');
  dialog.setAttribute('aria-describedby', 'archive-student-dialog-description');

  const panel = document.createElement('div');
  panel.className = 'w-full max-w-md rounded-lg bg-white p-6 shadow-lg';
  const title = document.createElement('h2');
  title.id = 'archive-student-dialog-title';
  title.className = 'text-lg font-semibold text-slate-900';
  title.textContent = 'Archive Student';
  const description = document.createElement('p');
  description.id = 'archive-student-dialog-description';
  description.className = 'mt-2 text-sm leading-6 text-slate-600';
  description.textContent = 'Are you sure you want to archive this student? This record will be hidden from active student lists but will not be deleted.';
  const actions = document.createElement('div');
  actions.className = 'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  cancel.textContent = 'Cancel';
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'inline-flex h-10 items-center justify-center rounded-md bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const confirmLabel = document.createElement('span');
  confirmLabel.dataset.buttonLabel = '';
  confirmLabel.textContent = 'Archive';
  confirm.append(confirmLabel);
  actions.append(cancel, confirm);
  panel.append(title, description, actions);
  dialog.append(panel);
  document.body.append(dialog);
  return { dialog, cancel, confirm };
}

function focusableElements(dialog) {
  return [...dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
}

/**
 * Adds archive handling to a rendered student page. Database work stays in the service.
 */
export function initialiseArchiveStudentController({ root, onSuccess, redirectTo = null } = {}) {
  if (!root) return () => {};

  const feedback = createFeedback(root);
  const { dialog, cancel, confirm } = createConfirmationDialog();
  let activeButton = null;
  let activeStudentId = null;
  let isProcessing = false;

  const closeDialog = () => {
    if (isProcessing) return;
    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    activeButton?.focus();
  };

  const openDialog = (button) => {
    activeButton = button;
    activeStudentId = button.dataset.archiveStudentId ?? null;
    if (!activeStudentId || button.disabled) return;
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    cancel.focus();
  };

  const onRootClick = (event) => {
    const button = event.target.closest('[data-archive-student-id]');
    if (!button || !root.contains(button)) return;
    openDialog(button);
  };

  const onDialogKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = focusableElements(dialog);
    const first = elements[0];
    const last = elements.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submitArchive = async () => {
    if (isProcessing || !activeStudentId || !activeButton) return;
    isProcessing = true;
    clearFormFeedback(feedback);
    setButtonLoading(activeButton, true, 'Archiving…');
    setButtonLoading(confirm, true, 'Archiving…');
    cancel.disabled = true;
    try {
      await archiveStudentRecord(activeStudentId);
      showFormFeedback(feedback, 'Student record archived successfully.', 'success');
      dialog.classList.add('hidden');
      dialog.classList.remove('flex');
      if (redirectTo) {
        window.setTimeout(() => window.location.assign(redirectTo), 250);
      } else if (onSuccess) {
        await onSuccess();
      }
    } catch {
      showFormFeedback(feedback, 'Unable to archive the student record. Please try again.');
      setButtonLoading(activeButton, false);
      setButtonLoading(confirm, false);
      cancel.disabled = false;
    } finally {
      isProcessing = false;
    }
  };

  root.addEventListener('click', onRootClick);
  cancel.addEventListener('click', closeDialog);
  confirm.addEventListener('click', submitArchive);
  dialog.addEventListener('keydown', onDialogKeydown);

  return () => {
    root.removeEventListener('click', onRootClick);
    cancel.removeEventListener('click', closeDialog);
    confirm.removeEventListener('click', submitArchive);
    dialog.removeEventListener('keydown', onDialogKeydown);
    dialog.remove();
  };
}
