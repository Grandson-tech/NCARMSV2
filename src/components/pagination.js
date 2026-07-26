function createPaginationButton(label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.disabled = true;
  button.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-50';
  button.textContent = label;
  return button;
}

export function createPagination({ resourceLabel = 'Student records', showSummary = true } = {}) {
  const navigation = document.createElement('nav');
  navigation.className = 'flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between';
  navigation.setAttribute('aria-label', `${resourceLabel} pagination`);

  const summary = document.createElement('p');
  summary.className = 'text-sm text-slate-500';
  summary.dataset.paginationSummary = '';
  summary.textContent = 'Showing 0 of 0 students';

  const controls = document.createElement('div');
  controls.className = 'flex gap-3';
  controls.append(createPaginationButton('Previous'), createPaginationButton('Next'));
  if (showSummary) navigation.append(summary);
  navigation.append(controls);
  return navigation;
}

export function setPaginationSummary(navigation, { shown = 0, total = 0 } = {}) {
  const summary = navigation?.querySelector('[data-pagination-summary]');
  if (summary) summary.textContent = `Showing ${shown} of ${total} students`;
}
