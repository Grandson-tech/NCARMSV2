const ACTIONS = Object.freeze([
  { label: 'Register Student', href: 'create-student.html', primary: true },
  { label: 'Student Records', href: 'student-records.html' },
  { label: 'Reports', href: 'reports.html' },
  { label: 'Settings', href: 'settings.html' },
]);

export function createDashboardQuickActions() {
  const actions = document.createElement('div');
  actions.className = 'mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2';
  ACTIONS.forEach((action) => {
    const link = document.createElement('a');
    link.href = action.href;
    link.className = action.primary
      ? 'inline-flex h-11 items-center justify-center rounded-control bg-blue-700 px-4 text-sm font-semibold tracking-[-0.005em] text-white shadow-surface hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      : 'inline-flex h-11 items-center justify-center rounded-control border border-slate-300/90 bg-white px-4 text-sm font-medium tracking-[-0.005em] text-slate-700 shadow-surface hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    link.textContent = action.label;
    actions.append(link);
  });
  return actions;
}
