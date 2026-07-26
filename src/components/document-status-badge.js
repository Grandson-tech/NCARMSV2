import { getDocumentStatusOption } from '../config/documents.js';

export function createDocumentStatusBadge(status) {
  const option = getDocumentStatusOption(status);
  const badge = document.createElement('span');
  badge.className = `ncarms-badge ${option?.className ?? 'bg-slate-100 text-slate-700 ring-slate-500/20'}`;
  badge.textContent = option?.label ?? 'Not available';
  return badge;
}
