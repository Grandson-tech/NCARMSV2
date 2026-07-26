export function createNotFoundState({ title, message, backHref, backLabel }) {
  const section = document.createElement('section');
  section.className = 'rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm';
  section.setAttribute('role', 'status');
  section.setAttribute('aria-live', 'polite');
  const heading = document.createElement('h2');
  heading.className = 'text-base font-semibold text-slate-900';
  heading.textContent = title;
  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-6 text-slate-600';
  description.textContent = message;
  const backLink = document.createElement('a');
  backLink.className = 'mt-4 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  backLink.href = backHref;
  backLink.textContent = backLabel;
  section.append(heading, description, backLink);
  return section;
}
