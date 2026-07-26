const ICONS = Object.freeze({
  students: '<svg class="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17-8a4 4 0 1 0 0-8m-3 10a4 4 0 0 1 3 3.87V21" /></svg>',
  departments: '<svg class="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01" /></svg>',
  university: '<svg class="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m3 10 9-5 9 5-9 5-9-5Zm4 3v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" /></svg>',
  calendar: '<svg class="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path stroke-linecap="round" d="M16 3v4M8 3v4M3 10h18" /></svg>',
});

export function createSummaryCard({ id, title, value = '—', description, action = null, icon = null }) {
  const article = document.createElement('article');
  article.className = 'ncarms-metric-card';
  if (action) {
    article.classList.add('cursor-pointer', 'hover:border-blue-300', 'hover:bg-slate-50', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2');
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.dataset.dashboardAction = action;
  }
  const headingRow = document.createElement('div');
  headingRow.className = 'flex items-start justify-between gap-4';
  const heading = document.createElement('h3');
  heading.className = 'pt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500';
  heading.textContent = title;
  headingRow.append(heading);
  if (ICONS[icon]) {
    const iconContainer = document.createElement('span');
    iconContainer.className = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-slate-100/90 text-slate-500';
    iconContainer.innerHTML = ICONS[icon];
    headingRow.append(iconContainer);
  }
  const metric = document.createElement('p');
  metric.className = 'mt-5 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-slate-900 md:text-[2.15rem]';
  if (id) metric.dataset.summaryValue = id;
  metric.textContent = value;
  article.append(headingRow, metric);
  if (description) {
    const supportingText = document.createElement('p');
    supportingText.className = 'mt-auto border-t border-amber-200/70 pt-3 text-sm leading-6 text-slate-500';
    supportingText.textContent = description;
    article.append(supportingText);
  }
  return article;
}

export function updateSummaryCardValue(scope, id, value) {
  const metric = scope.querySelector(`[data-summary-value="${id}"]`);
  if (metric) metric.textContent = value;
}
