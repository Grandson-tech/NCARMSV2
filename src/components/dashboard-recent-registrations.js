import { createStudentPhoto } from './student-photo.js';

function createCell(value, className = 'px-5 py-4 text-sm text-slate-700') {
  const cell = document.createElement('td');
  cell.className = className;
  if (value instanceof Node) cell.append(value);
  else cell.textContent = value || '—';
  return cell;
}

function createStudentIdentity(student) {
  const identity = document.createElement('div');
  identity.className = 'flex min-w-0 items-center gap-3';
  const avatar = createStudentPhoto({ url: student.passportPhotoUrl, fullName: student.fullName, size: 'h-8 w-8' });
  const name = document.createElement('span');
  name.className = 'truncate';
  name.textContent = student.fullName || 'Not provided';
  identity.append(avatar, name);
  return identity;
}

export function createDashboardRecentRegistrations(students) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ncarms-surface mt-5 overflow-x-auto';
  const table = document.createElement('table');
  table.className = 'ncarms-table';
  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Five most recently registered students';
  const head = document.createElement('thead');
  head.className = 'bg-slate-50';
  const headerRow = document.createElement('tr');
  ['Student', 'Department', 'University', 'Registration Date'].forEach((label) => {
    const header = document.createElement('th');
    header.scope = 'col';
    header.className = 'whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500';
    header.textContent = label;
    headerRow.append(header);
  });
  head.append(headerRow);
  const body = document.createElement('tbody');
  body.className = 'divide-y divide-slate-200';
  if (students.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'px-4 py-5 text-sm text-slate-600';
    cell.textContent = 'No student registrations are available.';
    row.append(cell);
    body.append(row);
  } else {
    students.forEach((student) => {
      const row = document.createElement('tr');
      row.className = 'cursor-pointer hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500';
      row.tabIndex = 0;
      row.setAttribute('role', 'link');
      row.dataset.studentDetailsId = student.id;
      row.append(
        createCell(createStudentIdentity(student), 'whitespace-nowrap px-5 py-4 text-sm font-medium tracking-[-0.005em] text-slate-900'),
        createCell(student.department),
        createCell(student.university),
        createCell(student.registeredAt, 'whitespace-nowrap px-5 py-4 text-sm text-slate-700'),
      );
      body.append(row);
    });
  }
  table.append(caption, head, body);
  wrapper.append(table);
  return wrapper;
}
