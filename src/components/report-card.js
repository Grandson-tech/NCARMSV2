export function createReportCard({ reportId, title, description, actionLabel = 'Generate Report', disabled = true, loading = false }) {
  const card = document.createElement('article');
  card.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
  const heading = document.createElement('h2');
  heading.className = 'text-base font-semibold text-slate-900';
  heading.textContent = title;
  const supportingText = document.createElement('p');
  supportingText.className = 'mt-2 text-sm leading-6 text-slate-600';
  supportingText.textContent = description;
  const action = document.createElement('button');
  action.type = 'button';
  action.disabled = disabled || loading;
  if (reportId) action.dataset.reportId = reportId;
  action.setAttribute('aria-busy', String(loading));
  action.className = 'mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50';
  action.textContent = loading ? 'Preparing…' : actionLabel;
  card.append(heading, supportingText, action);
  return card;
}
