export function createEmptyState({ title, message }) {
  const container = document.createElement('div');
  container.className = 'py-8 text-center';

  const heading = document.createElement('h3');
  heading.className = 'text-sm font-medium text-slate-900';
  heading.textContent = title;

  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-6 text-slate-500';
  description.textContent = message;

  container.append(heading, description);
  return container;
}
