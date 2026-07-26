export function createReportEmptyState() {
  const container = document.createElement('section');
  container.className = 'py-8 text-center';
  container.setAttribute('aria-labelledby', 'report-empty-state-title');
  const heading = document.createElement('h3');
  heading.id = 'report-empty-state-title';
  heading.className = 'text-sm font-medium text-slate-900';
  heading.textContent = 'No reports generated';
  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-6 text-slate-500';
  description.textContent = 'Generated reports will appear here.';
  container.append(heading, description);
  return container;
}
