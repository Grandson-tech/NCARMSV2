import { DOCUMENT_FILTERS } from '../../config/documents.js';
import { createDocumentFilterBar } from '../../components/document-filter-bar.js';
import { createDocumentSearchBar } from '../../components/document-search-bar.js';
import { createDocumentTable, renderDocumentRows, renderDocumentTableEmpty, renderDocumentTableNoMatches, renderDocumentTableState } from '../../components/document-table.js';
import { createPagination } from '../../components/pagination.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { triggerBrowserDownload } from '../../shared/file-download.js';
import { downloadDocumentById } from './document-details-service.js';
import { initialiseDeleteDocumentController } from './delete-document-controller.js';
import { filterDocumentRecords, loadDocumentRecords } from './document-records-service.js';

export async function initialiseDocumentRecords() {
  const content = document.querySelector('#document-records-content');
  if (!content) return;

  const fragment = document.createDocumentFragment();
  const introduction = document.createElement('section');
  introduction.setAttribute('aria-labelledby', 'document-records-description');
  const description = document.createElement('p');
  description.id = 'document-records-description';
  description.className = 'text-sm leading-6 text-slate-600';
  description.textContent = 'Manage student attachment documents and records.';
  introduction.append(description);

  const controls = document.createElement('section');
  controls.className = 'mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
  controls.setAttribute('aria-label', 'Document search and filters');
  const controlsHeader = document.createElement('div');
  controlsHeader.className = 'mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';
  const uploadButton = document.createElement('a');
  uploadButton.href = 'upload-document.html';
  uploadButton.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  uploadButton.textContent = 'Upload Document';
  controlsHeader.append(uploadButton);
  const filterBar = createDocumentFilterBar(DOCUMENT_FILTERS);
  filterBar.classList.add('mt-3');
  controls.append(
    controlsHeader,
    createDocumentSearchBar({
      id: 'document-record-search',
      label: 'Search documents',
      placeholder: 'Search by student, document type, or file name...',
    }),
    filterBar,
  );

  const recordsSection = document.createElement('section');
  recordsSection.className = 'mt-6';
  recordsSection.setAttribute('aria-label', 'Document records table');
  recordsSection.append(
    createDocumentTable(),
    createPagination({ resourceLabel: 'Documents' }),
  );

  fragment.append(introduction, controls, recordsSection);
  content.replaceChildren(fragment);
  const feedback = document.createElement('div');
  feedback.className = 'mb-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  content.prepend(feedback);
  const tableBody = content.querySelector('#document-records-table-body');
  renderDocumentTableState(tableBody, 'loading');

  const filters = { search: '', documentType: '', status: '' };
  let documents = [];

  const setControlValues = () => {
    content.querySelector('#document-record-search').value = filters.search;
    content.querySelector('#document-filter-type').value = filters.documentType;
    content.querySelector('#document-filter-status').value = filters.status;
  };

  const renderRecords = () => {
    if (documents.length === 0) {
      renderDocumentTableEmpty(tableBody);
      return;
    }

    const filteredDocuments = filterDocumentRecords(documents, filters);
    if (filteredDocuments.length === 0) {
      renderDocumentTableNoMatches(tableBody);
      return;
    }

    renderDocumentRows(tableBody, filteredDocuments);
  };

  const updateFilters = () => {
    filters.search = content.querySelector('#document-record-search').value;
    filters.documentType = content.querySelector('#document-filter-type').value;
    filters.status = content.querySelector('#document-filter-status').value;
    renderRecords();
  };

  try {
    documents = await loadDocumentRecords();
    setControlValues();
    let searchTimer;
    content.querySelector('#document-record-search').addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(updateFilters, 250);
    });
    ['document-filter-type', 'document-filter-status'].forEach((id) => {
      const control = content.querySelector(`#${id}`);
      if (control) control.addEventListener('change', updateFilters);
    });
    renderRecords(documents);
  } catch {
    renderDocumentTableState(tableBody, 'error');
  }

  content.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-document-download-id]');
    if (!button || !content.contains(button) || button.disabled) return;
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
  });
  initialiseDeleteDocumentController({
    root: content,
    onSuccess: () => window.location.reload(),
  });
}
