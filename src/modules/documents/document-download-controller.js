import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { triggerBrowserDownload } from '../../shared/file-download.js';
import { downloadDocumentById } from './document-details-service.js';

function createFeedback(root) {
  const feedback = document.createElement('div');
  feedback.className = 'mb-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  root.prepend(feedback);
  return feedback;
}

/** Adds the shared document download action to a rendered document table. */
export function initialiseDocumentDownloadController({ root } = {}) {
  if (!root) return () => {};
  const feedback = createFeedback(root);
  const onRootClick = async (event) => {
    const button = event.target.closest('[data-document-download-id]');
    if (!button || !root.contains(button) || button.disabled) return;
    clearFormFeedback(feedback);
    setButtonLoading(button, true, 'Downloading…');
    try {
      const { blob, originalFileName } = await downloadDocumentById(button.dataset.documentDownloadId);
      triggerBrowserDownload(blob, originalFileName);
      showFormFeedback(feedback, 'Document download started.', 'success');
    } catch {
      showFormFeedback(feedback, 'Unable to download the document. Please try again.');
    } finally {
      setButtonLoading(button, false);
    }
  };
  root.addEventListener('click', onRootClick);
  return () => root.removeEventListener('click', onRootClick);
}
