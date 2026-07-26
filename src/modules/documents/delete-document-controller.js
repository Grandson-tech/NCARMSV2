import { createConfirmationDialog, getDialogFocusableElements } from '../../components/confirmation-dialog.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { deleteDocumentRecord } from './delete-document-service.js';

function createFeedback(root) {
  const feedback = document.createElement('div');
  feedback.className = 'mb-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  root.prepend(feedback);
  return feedback;
}

/**
 * Adds a reusable permanent document deletion action to a rendered document page.
 */
export function initialiseDeleteDocumentController({ root, onSuccess } = {}) {
  if (!root) return () => {};
  const feedback = createFeedback(root);
  const { dialog, cancel, confirm } = createConfirmationDialog({
    id: 'delete-document-dialog',
    title: 'Delete Document',
    message: 'Are you sure you want to permanently delete this document? This action cannot be undone.',
    confirmLabel: 'Delete Document',
  });
  let activeButton = null;
  let activeDocumentId = null;
  let isProcessing = false;

  const closeDialog = () => {
    if (isProcessing) return;
    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    activeButton?.focus();
  };

  const openDialog = (button) => {
    if (button.disabled) return;
    activeButton = button;
    activeDocumentId = button.dataset.deleteDocumentId ?? null;
    if (!activeDocumentId) return;
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    cancel.focus();
  };

  const onRootClick = (event) => {
    const button = event.target.closest('[data-delete-document-id]');
    if (button && root.contains(button)) openDialog(button);
  };

  const onDialogKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = getDialogFocusableElements(dialog);
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

  const submitDeletion = async () => {
    if (isProcessing || !activeDocumentId || !activeButton) return;
    isProcessing = true;
    clearFormFeedback(feedback);
    setButtonLoading(activeButton, true, 'Deleting…');
    setButtonLoading(confirm, true, 'Deleting…');
    cancel.disabled = true;
    try {
      await deleteDocumentRecord(activeDocumentId);
      showFormFeedback(feedback, 'Document deleted successfully.', 'success');
      dialog.classList.add('hidden');
      dialog.classList.remove('flex');
      window.setTimeout(() => onSuccess?.(), 250);
    } catch {
      showFormFeedback(feedback, 'Unable to delete the document. Please try again.');
      setButtonLoading(activeButton, false);
      setButtonLoading(confirm, false);
      cancel.disabled = false;
      isProcessing = false;
    }
  };

  root.addEventListener('click', onRootClick);
  cancel.addEventListener('click', closeDialog);
  confirm.addEventListener('click', submitDeletion);
  dialog.addEventListener('keydown', onDialogKeydown);
  return () => {
    root.removeEventListener('click', onRootClick);
    cancel.removeEventListener('click', closeDialog);
    confirm.removeEventListener('click', submitDeletion);
    dialog.removeEventListener('keydown', onDialogKeydown);
    dialog.remove();
  };
}
