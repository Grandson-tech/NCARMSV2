import { DOCUMENT_TYPES } from './document-types.js';

export { DOCUMENT_TYPES } from './document-types.js';

export const DOCUMENT_STATUS_OPTIONS = Object.freeze([
  { value: 'pending', label: 'Pending', className: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
  { value: 'verified', label: 'Verified', className: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20' },
  { value: 'rejected', label: 'Rejected', className: 'bg-red-50 text-red-800 ring-red-600/20' },
  { value: 'archived', label: 'Archived', className: 'bg-slate-100 text-slate-700 ring-slate-500/20' },
]);

export const DOCUMENT_FILTERS = Object.freeze([
  { id: 'document-filter-type', label: 'Document Type', options: DOCUMENT_TYPES.map((type) => ({ value: type, label: type })) },
  { id: 'document-filter-status', label: 'Status', options: DOCUMENT_STATUS_OPTIONS },
]);

export function getDocumentStatusOption(status) {
  return DOCUMENT_STATUS_OPTIONS.find((option) => option.value === status) ?? null;
}
