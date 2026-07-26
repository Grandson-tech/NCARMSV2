import { createDocumentDetailSection } from '../../components/document-detail-section.js';
import { createDocumentMetadata } from '../../components/document-metadata.js';
import { createDocumentPreview } from '../../components/document-preview.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { createNotFoundState } from '../../components/not-found-state.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { triggerBrowserDownload } from '../../shared/file-download.js';
import { downloadDocumentById, loadDocumentDetails } from './document-details-service.js';
import { initialiseReplaceDocumentController } from './replace-document-controller.js';
import { initialiseDeleteDocumentController } from './delete-document-controller.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function value(input) {
  return input === null || input === undefined || input === '' ? 'Not provided' : String(input);
}

function formatDate(input) {
  if (!input || Number.isNaN(new Date(input).getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(input));
}

function createButton(label, { disabled = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.disabled = disabled;
  button.className = disabled
    ? 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-50'
    : 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  button.textContent = label;
  return button;
}

function createDetailsView(documentRecord) {
  const fragment = document.createDocumentFragment();
  const feedback = document.createElement('div');
  feedback.id = 'document-details-feedback';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  const metadata = createDocumentMetadata([
    { label: 'Original filename', value: value(documentRecord.originalFileName) },
    { label: 'Document type', value: value(documentRecord.documentType) },
    { label: 'Student', value: value(documentRecord.studentName) },
    { label: 'MIME type', value: value(documentRecord.mimeType) },
    { label: 'Upload date', value: formatDate(documentRecord.uploadedAt) },
    { label: 'Uploaded by', value: value(documentRecord.uploadedBy) },
    { label: 'Storage path', value: value(documentRecord.storagePath) },
  ]);
  const preview = createDocumentPreview({
    previewUrl: documentRecord.previewUrl,
    mimeType: documentRecord.mimeType,
    fileName: documentRecord.originalFileName,
  });
  const actions = document.createElement('section');
  actions.className = 'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  actions.setAttribute('aria-label', 'Document actions');
  const back = document.createElement('a');
  back.href = 'documents.html';
  back.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  back.textContent = 'Back to Documents';
  const download = createButton('Download');
  download.dataset.documentDetailsDownloadId = documentRecord.id;
  const replace = createButton('Replace');
  replace.dataset.replaceDocumentId = documentRecord.id;
  const deleteButton = createButton('Delete');
  deleteButton.dataset.deleteDocumentId = documentRecord.id;
  actions.append(back, download, replace, deleteButton);
  const previewSection = createDocumentDetailSection({
    id: 'document-preview-heading',
    title: 'Document Preview',
    description: 'Preview is available for supported image and PDF files.',
    content: preview,
  });
  previewSection.classList.add('mt-6');
  fragment.append(
    feedback,
    createDocumentDetailSection({ id: 'document-metadata-heading', title: 'Document Details', description: 'Read-only document metadata.', content: metadata }),
    previewSection,
    actions,
  );
  return fragment;
}

function renderNotFound(content, title, message) {
  content.replaceChildren(createNotFoundState({ title, message, backHref: 'documents.html', backLabel: 'Back to Documents' }));
}

export async function initialiseDocumentDetails() {
  const content = document.querySelector('#document-details-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading document details', message: 'Retrieving the document record.' });
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id || !UUID_PATTERN.test(id)) {
    renderNotFound(content, 'Invalid document', 'The document identifier is invalid.');
    return;
  }

  try {
    const document = await loadDocumentDetails(id);
    if (!document) {
      renderNotFound(content, 'Document not found', 'The requested document record could not be found.');
      return;
    }
    content.replaceChildren(createDetailsView(document));
    const feedback = content.querySelector('#document-details-feedback');
    const downloadButton = content.querySelector('[data-document-details-download-id]');
    downloadButton.addEventListener('click', async () => {
      clearFormFeedback(feedback);
      setButtonLoading(downloadButton, true, 'Downloading…');
      try {
        const { blob, originalFileName } = await downloadDocumentById(document.id);
        triggerBrowserDownload(blob, originalFileName);
        showFormFeedback(feedback, 'Document download started.', 'success');
      } catch {
        showFormFeedback(feedback, 'Unable to download the document. Please try again.');
      } finally {
        setButtonLoading(downloadButton, false);
      }
    });
    initialiseReplaceDocumentController({
      root: content,
      documentRecord: document,
      onSuccess: () => window.location.assign(`document-details.html?id=${encodeURIComponent(document.id)}`),
    });
    initialiseDeleteDocumentController({
      root: content,
      onSuccess: () => window.location.reload(),
    });
  } catch {
    content.replaceChildren(createPageState({
      type: 'error',
      title: 'Document details unavailable',
      message: 'The document record could not be retrieved. Please refresh the page or try again later.',
    }));
  }
}
