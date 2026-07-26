import { BRANDING } from '../config/branding.js';

export function createDashboardWelcomeToast({ greeting, profile, currentDate, message }) {
  const toast = document.createElement('section');
  toast.className = 'fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm items-start justify-between gap-4 rounded-surface border border-emerald-200 bg-white p-4 text-slate-900 shadow-elevated opacity-0 animate-[dashboard-toast-in_240ms_ease-out_forwards] transition-all duration-300 sm:right-6 sm:top-6 sm:w-full';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  const statusIcon = document.createElement('span');
  statusIcon.className = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700';
  statusIcon.setAttribute('aria-hidden', 'true');
  statusIcon.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" /></svg>';
  const content = document.createElement('div');
  const title = document.createElement('h2');
  title.className = 'text-sm font-semibold tracking-[-0.01em] text-slate-900';
  title.textContent = `${greeting}, ${profile.full_name || 'staff member'}`;
  const department = document.createElement('p');
  department.className = 'mt-1 text-xs leading-5 text-slate-500';
  department.textContent = BRANDING.departmentName;
  const metadata = document.createElement('p');
  metadata.className = 'mt-1 text-sm text-slate-600';
  metadata.textContent = `${String(profile.role || '').replaceAll('_', ' ')} · ${currentDate}`;
  const supportingText = document.createElement('p');
  supportingText.className = 'mt-2 text-sm leading-5 text-slate-600';
  supportingText.textContent = message;
  content.append(title, department, metadata, supportingText);
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2';
  dismiss.setAttribute('aria-label', 'Dismiss welcome message');
  dismiss.textContent = '×';
  toast.append(statusIcon, content, dismiss);
  return { toast, dismiss };
}
