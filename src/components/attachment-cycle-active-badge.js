export function createAttachmentCycleActiveBadge(isActive) {
  const badge = document.createElement('span');
  badge.className = isActive
    ? 'ncarms-badge bg-emerald-50 text-emerald-800 ring-emerald-600/20'
    : 'ncarms-badge bg-slate-100 text-slate-700 ring-slate-500/20';
  badge.textContent = isActive ? 'ACTIVE' : 'Inactive';
  return badge;
}
