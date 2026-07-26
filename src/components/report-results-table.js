import { createPageState } from './page-state.js';
import { createStudentPhoto } from './student-photo.js';

export function createReportResultsTable() {
  const container = document.createElement('div');
  container.id = 'report-results-container';
  return container;
}

export function renderReportResultsState(container, { type, title, message }) {
  container.replaceChildren(createPageState({ type, title, message }));
}

export function renderReportResults(container, { title, columns, rows }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ncarms-surface overflow-x-auto';
  const table = document.createElement('table');
  table.className = 'ncarms-table';
  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = `${title} results`;
  const head = document.createElement('thead');
  head.className = 'bg-slate-50';
  const headerRow = document.createElement('tr');
  columns.forEach((column) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
    cell.textContent = column.label;
    headerRow.append(cell);
  });
  head.append(headerRow);
  const body = document.createElement('tbody');
  body.className = 'divide-y divide-slate-200';
  rows.forEach((row) => {
    const tableRow = document.createElement('tr');
    tableRow.className = 'border-t border-slate-200 hover:bg-blue-50/50';
    columns.forEach((column) => {
      const cell = document.createElement('td');
      cell.className = 'px-4 py-3 text-sm text-slate-700';
      const value = row[column.key];
      if (column.key === 'fullName') {
        const identity = document.createElement('div');
        identity.className = 'flex min-w-0 items-center gap-3';
        identity.append(createStudentPhoto({ url: row.passportPhotoUrl, fullName: value, size: 'h-8 w-8' }));
        const name = document.createElement('span');
        name.className = 'truncate font-medium text-slate-900';
        name.textContent = value === null || value === undefined || value === '' ? 'Not provided' : String(value);
        identity.append(name);
        cell.append(identity);
      } else {
        cell.textContent = value === null || value === undefined || value === '' ? 'Not provided' : String(value);
      }
      tableRow.append(cell);
    });
    body.append(tableRow);
  });
  table.append(caption, head, body);
  wrapper.append(table);
  container.replaceChildren(wrapper);
}
