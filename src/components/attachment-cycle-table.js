import { createAttachmentCycleActiveBadge } from './attachment-cycle-active-badge.js';

const MONTHS = Object.freeze(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

function createCell(content, className = 'px-4 py-3 text-sm text-slate-700') {
  const cell = document.createElement('td');
  cell.className = className;
  if (content instanceof Node) cell.append(content);
  else cell.textContent = content ?? '—';
  return cell;
}

function createAction(label, action, cycleId, { disabled = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.disabled = disabled;
  button.dataset.attachmentCycleAction = action;
  button.dataset.attachmentCycleId = cycleId;
  button.className = 'inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  button.textContent = label;
  return button;
}

export function attachmentCycleMonthName(month) {
  return MONTHS[Number(month) - 1] ?? '—';
}

export function createAttachmentCycleTable(cycles) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ncarms-surface mt-4 overflow-x-auto';
  const table = document.createElement('table');
  table.className = 'ncarms-table';
  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Attachment cycles';
  const head = document.createElement('thead');
  head.className = 'bg-slate-50';
  const headerRow = document.createElement('tr');
  ['Cycle Name', 'Year', 'Active', 'Start Month', 'End Month', 'Linked Students', 'Actions'].forEach((label) => {
    const header = document.createElement('th');
    header.scope = 'col';
    header.className = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
    header.textContent = label;
    headerRow.append(header);
  });
  head.append(headerRow);
  const body = document.createElement('tbody');
  body.className = 'divide-y divide-slate-200';
  if (cycles.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'px-4 py-6 text-sm text-slate-600';
    cell.textContent = 'No attachment cycles have been created.';
    row.append(cell);
    body.append(row);
  } else {
    cycles.forEach((cycle) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-blue-50/50';
      const actions = document.createElement('div');
      actions.className = 'flex flex-wrap gap-2';
      actions.setAttribute('aria-label', `Actions for ${cycle.name}`);
      actions.append(
        createAction('Edit', 'edit', cycle.id),
        createAction('Activate', 'activate', cycle.id, { disabled: cycle.isActive }),
        createAction('Delete', 'delete', cycle.id),
      );
      row.append(
        createCell(cycle.name, 'whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900'),
        createCell(String(cycle.year)),
        createCell(createAttachmentCycleActiveBadge(cycle.isActive)),
        createCell(attachmentCycleMonthName(cycle.startMonth)),
        createCell(attachmentCycleMonthName(cycle.endMonth)),
        createCell(String(cycle.linkedStudentCount)),
        createCell(actions),
      );
      body.append(row);
    });
  }
  table.append(caption, head, body);
  wrapper.append(table);
  return wrapper;
}
