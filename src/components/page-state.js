const STATE_STYLES = {
  loading: 'border-slate-200 bg-white text-slate-600',
  empty: 'border-slate-200 bg-white text-slate-600',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function createPageState({ type = 'empty', title, message }) {
  const section = document.createElement('section');
  section.className = `rounded-surface border p-5 text-sm shadow-surface md:p-6 ${STATE_STYLES[type] ?? STATE_STYLES.empty}`;
  section.setAttribute('role', type === 'error' ? 'alert' : 'status');
  section.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  const heading = document.createElement('h2');
  heading.className = 'font-semibold tracking-[-0.01em]';
  heading.textContent = title;

  const description = document.createElement('p');
  description.className = 'mt-1 leading-6';
  description.textContent = message;

  if (type === 'loading') {
    const indicator = document.createElement('span');
    indicator.className = 'mb-3 block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700';
    indicator.setAttribute('aria-hidden', 'true');
    section.append(indicator);
  }
  section.append(heading, description);
  return section;
}

export function renderPageState(container, options) {
  container.replaceChildren(createPageState(options));
}
