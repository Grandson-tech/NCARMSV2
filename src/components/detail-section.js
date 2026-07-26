export function createDetailSection({ id, title, items }) {
  const section = document.createElement('section');
  section.className = 'ncarms-surface p-5 md:p-6';
  section.setAttribute('aria-labelledby', id);
  const heading = document.createElement('h2');
  heading.id = id;
  heading.className = 'text-base font-semibold text-slate-900';
  heading.textContent = title;
  const list = document.createElement('dl');
  list.className = 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2';
  items.forEach((item) => list.append(item));
  section.append(heading, list);
  return section;
}
