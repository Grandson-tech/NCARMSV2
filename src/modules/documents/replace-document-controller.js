import { MAX_DOCUMENT_UPLOAD_BYTES } from '../../config/document-upload.js';
import { createReplaceDocumentDialog } from '../../components/replace-document-dialog.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setFieldError } from '../../components/form-field.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { setUploadProgress } from '../../components/upload-progress.js';
import { replaceDocumentFile } from './replace-document-service.js';

function validateReplacementFile(input) {
  const file = input.files?.[0] ?? null;
  const message = !file
    ? 'Select a replacement file.'
    : file.size === 0
      ? 'The selected file is empty.'
      : file.size > MAX_DOCUMENT_UPLOAD_BYTES
        ? 'The selected file must be 10 MB or smaller.'
        : '';
  setFieldError(input, message);
  return !message;
}

export function initialiseReplaceDocumentController({ root, documentRecord, onSuccess } = {}) {
  if (!root || !documentRecord) return () => {};
  const trigger = root.querySelector('[data-replace-document-id]');
  if (!trigger) return () => {};
  const { dialog, form, fileInput, feedback, progress, cancel, submit } = createReplaceDocumentDialog({
    originalFileName: documentRecord.originalFileName,
    documentType: documentRecord.documentType,
  });
  let isProcessing = false;

  const closeDialog = () => {
    if (isProcessing) return;
    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    trigger.focus();
  };

  const openDialog = () => {
    clearFormFeedback(feedback);
    setFieldError(fileInput);
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    fileInput.focus();
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submitReplacement = async (event) => {
    event.preventDefault();
    clearFormFeedback(feedback);
    if (!validateReplacementFile(fileInput) || isProcessing) {
      if (fileInput.getAttribute('aria-invalid') === 'true') fileInput.focus();
      return;
    }
    isProcessing = true;
    setButtonLoading(submit, true, 'Replacing…');
    cancel.disabled = true;
    setUploadProgress(progress, { active: true, message: 'Uploading and saving replacement document…' });
    try {
      await replaceDocumentFile({ documentId: documentRecord.id, file: fileInput.files[0] });
      setUploadProgress(progress, { active: false });
      showFormFeedback(feedback, 'Document replaced successfully. Refreshing details…', 'success');
      window.setTimeout(() => onSuccess?.(), 300);
    } catch {
      setUploadProgress(progress, { active: false });
      showFormFeedback(feedback, 'Unable to replace the document. Please try again.');
      setButtonLoading(submit, false);
      cancel.disabled = false;
      isProcessing = false;
    }
  };

  trigger.addEventListener('click', openDialog);
  cancel.addEventListener('click', closeDialog);
  form.addEventListener('submit', submitReplacement);
  dialog.addEventListener('keydown', onKeydown);
  return () => {
    trigger.removeEventListener('click', openDialog);
    cancel.removeEventListener('click', closeDialog);
    form.removeEventListener('submit', submitReplacement);
    dialog.removeEventListener('keydown', onKeydown);
    dialog.remove();
  };
}
