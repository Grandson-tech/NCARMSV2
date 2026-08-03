import { createDocumentEmptyState } from './document-empty-state.js';
import { createDocumentStatusBadge } from './document-status-badge.js';
import { createPageState } from './page-state.js';

const COLUMNS = Object.freeze([
  'Student',
  'Document Type',
  'Original File Name',
  'Uploaded By',
  'Upload Date',
  'Status',
  'Actions',
]);

export function createDocumentTable() {
  const wrapper = document.createElement('div');
  wrapper.className = 'ncarms-surface overflow-x-auto';

  const table = document.createElement('table');
  table.className = 'ncarms-table';
  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Student attachment documents';

  const head = document.createElement('thead');
  head.className = 'bg-slate-50';
  const row = document.createElement('tr');
  COLUMNS.forEach((column) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
    cell.textContent = column;
    row.append(cell);
  });
  head.append(row);

  const body = document.createElement('tbody');
  body.id = 'document-records-table-body';
  body.className = 'divide-y divide-slate-200';
  table.append(caption, head, body);
  wrapper.append(table);
  return wrapper;
}

function createActionButton(label, { disabled = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.disabled = disabled;
  button.className = disabled
    ? 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-50'
    : 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  button.textContent = label;
  return button;
}

export function createDocumentActions(documentId) {
  const actions = document.createElement('div');
  actions.className = 'flex flex-wrap gap-2';
  actions.setAttribute('aria-label', 'Document actions');
  const viewLink = document.createElement('a');
  viewLink.href = `document-details.html?id=${encodeURIComponent(documentId)}`;
  viewLink.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  viewLink.textContent = 'View';
  const downloadButton = createActionButton('Download');
  downloadButton.dataset.documentDownloadId = documentId;
  const replaceLink = document.createElement('a');
  replaceLink.href = `document-details.html?id=${encodeURIComponent(documentId)}`;
  replaceLink.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  replaceLink.textContent = 'Replace';
  const deleteButton = createActionButton('Delete');
  deleteButton.dataset.deleteDocumentId = documentId;
  actions.append(viewLink, downloadButton, replaceLink, deleteButton);
  return actions;
}

export function renderDocumentTableEmpty(tableBody, options) {
  tableBody.replaceChildren(createStateRow(createDocumentEmptyState(options)));
}

export function renderDocumentTableNoMatches(tableBody) {
  const content = createDocumentEmptyState({
    title: 'No documents match the selected search or filters.',
    message: 'Adjust or clear the current search and filters to view matching documents.',
  });
  tableBody.replaceChildren(createStateRow(content));
}

function createStateRow(content) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = COLUMNS.length;
  cell.className = 'px-4 py-3';
  cell.append(content);
  row.append(cell);
  return row;
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function createCell(content, className = 'px-4 py-3 text-sm text-slate-700') {
  const cell = document.createElement('td');
  cell.className = className;
  if (content instanceof Node) cell.append(content);
  else cell.textContent = content;
  return cell;
}

export function renderDocumentTableState(tableBody, type) {
  const content = type === 'loading'
    ? createPageState({ type: 'loading', title: 'Loading documents', message: 'Retrieving document records.' })
    : createPageState({ type: 'error', title: 'Documents unavailable', message: 'Document records could not be retrieved. Please refresh the page.' });
  tableBody.replaceChildren(createStateRow(content));
}

export function renderDocumentRows(tableBody, documents) {
  const rows = documents.map((record) => {
    const row = document.createElement('tr');
    row.className = 'border-t border-slate-200 hover:bg-blue-50/50';
    row.append(
      createCell(formatValue(record.studentName ?? record.students?.full_name), 'whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900'),
      createCell(formatValue(record.document_type)),
      createCell(formatValue(record.original_file_name)),
      createCell(formatValue(record.uploaderName ?? record.staff_profiles?.full_name)),
      createCell(formatDate(record.uploaded_at), 'whitespace-nowrap px-4 py-3 text-sm text-slate-700'),
      createCell(createDocumentStatusBadge(record.status ?? null)),
      createCell(createDocumentActions(record.id)),
    );
    return row;
  });
  tableBody.replaceChildren(...rows);
}
