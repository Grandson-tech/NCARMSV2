const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Creates a reusable accessible confirmation dialog. Controllers own its action.
 */
export function createConfirmationDialog({ id, title, message, confirmLabel }) {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  dialog.setAttribute('aria-describedby', `${id}-description`);

  const panel = document.createElement('div');
  panel.className = 'ncarms-surface w-full max-w-md p-6 shadow-xl';
  const heading = document.createElement('h2');
  heading.id = `${id}-title`;
  heading.className = 'text-lg font-semibold text-slate-900';
  heading.textContent = title;
  const description = document.createElement('p');
  description.id = `${id}-description`;
  description.className = 'mt-2 text-sm leading-6 text-slate-600';
  description.textContent = message;
  const actions = document.createElement('div');
  actions.className = 'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  cancel.textContent = 'Cancel';
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'inline-flex h-10 items-center justify-center rounded-md bg-red-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const label = document.createElement('span');
  label.dataset.buttonLabel = '';
  label.textContent = confirmLabel;
  confirm.append(label);
  actions.append(cancel, confirm);
  panel.append(heading, description, actions);
  dialog.append(panel);
  document.body.append(dialog);
  return { dialog, cancel, confirm };
}

export function getDialogFocusableElements(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
}
