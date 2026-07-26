export function createDocumentMetadata(items) {
  const list = document.createElement('dl');
  list.className = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  items.forEach(({ label, value }) => {
    const item = document.createElement('div');
    const term = document.createElement('dt');
    term.className = 'text-xs font-medium uppercase tracking-wide text-slate-500';
    term.textContent = label;
    const description = document.createElement('dd');
    description.className = 'mt-1 break-words text-sm text-slate-900';
    description.textContent = value;
    item.append(term, description);
    list.append(item);
  });
  return list;
}
