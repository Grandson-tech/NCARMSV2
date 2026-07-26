import { createEmptyState } from './empty-state.js';
import { createPageState } from './page-state.js';
import { createStudentPhoto } from './student-photo.js';

const COLUMNS = Object.freeze([
  'Passport Photo',
  'Student Name',
  'Student Number',
  'University',
  'Course',
  'Department',
  'Attachment Cycle',
  'Attachment Start Date',
  'Attachment End Date',
  'Archived',
  'Actions',
]);

export function createStudentTable() {
  const wrapper = document.createElement('div');
  wrapper.className = 'ncarms-surface overflow-x-auto';

  const table = document.createElement('table');
  table.className = 'ncarms-table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Student attachment records';

  const head = document.createElement('thead');
  head.className = 'bg-slate-50';
  const headerRow = document.createElement('tr');
  COLUMNS.forEach((column) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
    cell.textContent = column;
    headerRow.append(cell);
  });
  head.append(headerRow);

  const body = document.createElement('tbody');
  body.id = 'student-records-table-body';
  body.className = 'divide-y divide-slate-200';
  table.append(caption, head, body);
  wrapper.append(table);
  return wrapper;
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

export function renderStudentTableState(tableBody, type) {
  const content = type === 'loading'
    ? createPageState({ type: 'loading', title: 'Loading records', message: 'Preparing the student records workspace.' })
    : type === 'error'
      ? createPageState({ type: 'error', title: 'Records unavailable', message: 'The student records workspace could not be prepared.' })
      : createEmptyState({ title: 'No student records to display', message: 'Student records will appear here when record services are connected.' });

  tableBody.replaceChildren(createStateRow(content));
}

export function renderStudentTableNoMatches(tableBody, onClearFilters) {
  const content = createEmptyState({
    title: 'No students match the selected filters.',
    message: 'Adjust or clear the current search and filters to view student records.',
  });
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'mt-4 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  clearButton.textContent = 'Clear Filters';
  clearButton.addEventListener('click', onClearFilters);
  content.append(clearButton);
  tableBody.replaceChildren(createStateRow(content));
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? 'Not provided' : String(value);
}

function formatDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function createCell(content, className = 'px-4 py-3 text-sm text-slate-700') {
  const cell = document.createElement('td');
  cell.className = className;
  if (content instanceof Node) cell.append(content);
  else cell.textContent = content;
  return cell;
}

function createArchivedBadge(archived) {
  const badge = document.createElement('span');
  badge.className = archived
    ? 'ncarms-badge bg-slate-100 text-slate-700 ring-slate-500/20'
    : 'ncarms-badge bg-emerald-50 text-emerald-800 ring-emerald-600/20';
  badge.textContent = archived ? 'Archived' : 'Not archived';
  return badge;
}

function createRecordActions(studentId) {
  const actions = document.createElement('div');
  actions.className = 'flex flex-wrap gap-2';
  const viewLink = document.createElement('a');
  viewLink.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  viewLink.href = `student-details.html?id=${encodeURIComponent(studentId)}`;
  viewLink.textContent = 'View';
  actions.append(viewLink);
  const editLink = document.createElement('a');
  editLink.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  editLink.href = `edit-student.html?id=${encodeURIComponent(studentId)}`;
  editLink.textContent = 'Edit';
  actions.append(editLink);
  const archiveButton = document.createElement('button');
  archiveButton.type = 'button';
  archiveButton.dataset.archiveStudentId = studentId;
  archiveButton.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  archiveButton.textContent = 'Archive';
  actions.append(archiveButton);
  return actions;
}

export function renderStudentRows(tableBody, students) {
  const rows = students.map((student) => {
    const row = document.createElement('tr');
    row.className = 'border-t border-slate-200 hover:bg-blue-50/50';
    row.append(
      createCell(createStudentPhoto({ url: student.passport_photo_url, fullName: student.full_name, size: 'h-10 w-10' })),
      createCell(formatValue(student.full_name), 'whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900'),
      createCell(formatValue(student.student_number), 'whitespace-nowrap px-4 py-3 text-sm text-slate-700'),
      createCell(formatValue(student.university)),
      createCell(formatValue(student.course)),
      createCell(formatValue(student.departmentName ?? student.departments?.name)),
      createCell(formatValue(student.attachmentCycle)),
      createCell(formatDate(student.attachment_start_date), 'whitespace-nowrap px-4 py-3 text-sm text-slate-700'),
      createCell(formatDate(student.attachment_end_date), 'whitespace-nowrap px-4 py-3 text-sm text-slate-700'),
      createCell(createArchivedBadge(Boolean(student.archived))),
      createCell(createRecordActions(student.id)),
    );
    return row;
  });

  tableBody.replaceChildren(...rows);
}

export function createDisabledRecordActions() {
  const group = document.createElement('div');
  group.className = 'flex flex-wrap gap-3';
  group.setAttribute('aria-label', 'Student record action placeholders');

  ['View', 'Edit', 'Archive'].forEach((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = true;
    button.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-50';
    button.textContent = label;
    group.append(button);
  });

  return group;
}
