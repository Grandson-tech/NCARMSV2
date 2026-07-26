export function createDetailItem({ label, value }) {
  const container = document.createElement('div');
  const term = document.createElement('dt');
  term.className = 'text-sm font-medium text-slate-600';
  term.textContent = label;
  const description = document.createElement('dd');
  description.className = 'mt-1 text-sm leading-6 text-slate-900';
  description.textContent = value ?? 'Not provided';
  container.append(term, description);
  return container;
}
