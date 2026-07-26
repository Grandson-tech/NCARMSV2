export function createDashboardListDialog({ id, title, items, showCount = false }) {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  const panel = document.createElement('div');
  panel.className = 'ncarms-surface w-full max-w-md p-6 shadow-xl';
  const heading = document.createElement('h2');
  heading.id = `${id}-title`;
  heading.className = 'text-lg font-semibold text-slate-900';
  heading.textContent = title;
  const list = document.createElement('ul');
  list.className = 'mt-4 max-h-80 divide-y divide-slate-200 overflow-y-auto rounded-control border border-slate-200';
  items.forEach((item) => {
    const row = document.createElement('li');
    row.className = 'flex items-center justify-between gap-4 px-3 py-2 text-sm text-slate-700';
    const name = document.createElement('span');
    name.textContent = item.name;
    row.append(name);
    if (showCount) {
      const count = document.createElement('span');
      count.className = 'text-slate-600';
      count.textContent = `${item.count} student${item.count === 1 ? '' : 's'}`;
      row.append(count);
    }
    list.append(row);
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'mt-6 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  close.textContent = 'Close';
  panel.append(heading, list, close);
  dialog.append(panel);
  document.body.append(dialog);
  return { dialog, close };
}
