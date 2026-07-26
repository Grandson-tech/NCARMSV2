export function createStaffWelcome(profile, { currentDate, summary } = {}) {
  const section = document.createElement('section');
  section.className = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6';
  section.setAttribute('aria-labelledby', 'staff-welcome-title');

  const title = document.createElement('h2');
  title.id = 'staff-welcome-title';
  title.className = 'text-lg font-semibold text-slate-900';
  title.textContent = `Welcome back, ${profile.full_name || 'staff member'}`;

  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-6 text-slate-600';
  const role = profile.role.replaceAll('_', ' ');
  const department = profile.department ? ` · ${profile.department}` : '';
  const date = currentDate ? ` · ${currentDate}` : '';
  description.textContent = `${role}${department}${date}`;

  const supportingText = document.createElement('p');
  supportingText.className = 'mt-4 text-sm leading-6 text-slate-700';
  supportingText.textContent = summary ?? 'Here is your NCARMS workspace overview.';

  section.append(title, description, supportingText);
  return section;
}
