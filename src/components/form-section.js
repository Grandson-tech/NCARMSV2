export function createFormSection({ id, title, description, content }) {
  const section = document.createElement('section');
  section.className = 'ncarms-surface p-5 md:p-6';
  section.setAttribute('aria-labelledby', id);
  const heading = document.createElement('h2');
  heading.id = id;
  heading.className = 'text-base font-semibold text-slate-900';
  heading.textContent = title;
  section.append(heading);
  if (description) {
    const text = document.createElement('p');
    text.className = 'mt-1 text-sm leading-6 text-slate-600';
    text.textContent = description;
    section.append(text);
  }
  content.classList.add('mt-4');
  section.append(content);
  return section;
}
