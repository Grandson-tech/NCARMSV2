export function createDashboardDepartmentList(departments) {
  const list = document.createElement('ul');
  list.className = 'ncarms-surface mt-5 divide-y divide-slate-200/80 overflow-hidden';
  const header = document.createElement('li');
  header.className = 'grid grid-cols-[minmax(0,1fr)_9rem] items-center gap-4 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500';
  header.innerHTML = '<span>Department</span><span class="text-right">Registered</span>';
  list.append(header);
  if (departments.length === 0) {
    const item = document.createElement('li');
    item.className = 'px-4 py-5 text-sm text-slate-600';
    item.textContent = 'No departments are available.';
    list.append(item);
    return list;
  }
  const highestCount = Math.max(...departments.map((department) => department.studentCount), 1);
  departments.forEach((department) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `student-records.html?department=${encodeURIComponent(department.id)}`;
    link.className = 'grid min-h-[3.4rem] grid-cols-[minmax(0,1fr)_9rem] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500';
    const name = document.createElement('span');
    name.className = 'flex items-center gap-3 font-medium tracking-[-0.005em] text-slate-900';
    name.textContent = department.name;
    name.insertAdjacentHTML('afterbegin', '<span class="h-1.5 w-1.5 shrink-0 rounded-sm bg-blue-900" aria-hidden="true"></span>');
    const count = document.createElement('span');
    count.className = 'flex items-center justify-end gap-3 text-sm font-semibold tabular-nums text-slate-900';
    const width = department.studentCount / highestCount;
    const widthClass = width >= 0.9 ? 'w-full' : width >= 0.7 ? 'w-3/4' : width >= 0.5 ? 'w-1/2' : width >= 0.3 ? 'w-1/3' : 'w-1/4';
    count.innerHTML = `<span class="h-1 w-24 overflow-hidden rounded-full bg-slate-200"><span class="block h-full rounded-full bg-blue-900 ${widthClass} transition-[width] duration-300"></span></span><span>${new Intl.NumberFormat('en-KE').format(department.studentCount)}</span>`;
    link.append(name, count);
    item.append(link);
    list.append(item);
  });
  return list;
}
