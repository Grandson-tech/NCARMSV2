import { getCachedStaffProfile } from '../../auth/staff-access.js';
import { createAttachmentCycleDialog } from '../../components/attachment-cycle-dialog.js';
import { createAttachmentCycleTable } from '../../components/attachment-cycle-table.js';
import { createConfirmationDialog, getDialogFocusableElements } from '../../components/confirmation-dialog.js';
import { createDetailItem } from '../../components/detail-item.js';
import { createDetailSection } from '../../components/detail-section.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { setFieldError } from '../../components/form-field.js';
import {
  activateAttachmentCycle,
  createAttachmentCycle,
  deleteAttachmentCycle,
  loadAttachmentCycles,
  updateAttachmentCycle,
} from './attachment-cycle-service.js';

function value(input) {
  return input === null || input === undefined || input === '' ? 'Not provided' : String(input);
}

function formatDate(input) {
  if (!input || Number.isNaN(new Date(input).getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(input));
}

function createCycleSection() {
  const section = document.createElement('section');
  section.className = 'mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6';
  section.setAttribute('aria-labelledby', 'attachment-cycle-management-heading');
  const header = document.createElement('div');
  header.className = 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between';
  const headingGroup = document.createElement('div');
  const heading = document.createElement('h2');
  heading.id = 'attachment-cycle-management-heading';
  heading.className = 'text-lg font-semibold text-slate-900';
  heading.textContent = 'Attachment Cycle Management';
  const description = document.createElement('p');
  description.className = 'mt-1 text-sm leading-6 text-slate-600';
  description.textContent = 'Manage the attachment cycles used by NCARMS.';
  headingGroup.append(heading, description);
  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.dataset.attachmentCycleAction = 'create';
  createButton.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  createButton.textContent = 'Create Cycle';
  header.append(headingGroup, createButton);
  const feedback = document.createElement('div');
  feedback.className = 'mt-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  const tableSlot = document.createElement('div');
  tableSlot.className = 'mt-4';
  section.append(header, feedback, tableSlot);
  return { section, feedback, tableSlot };
}

function getFocusable(dialog) {
  return getDialogFocusableElements(dialog);
}

function bindDialog({ dialog, cancel, initialFocus, trigger }) {
  const close = () => {
    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    trigger?.focus();
  };
  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = getFocusable(dialog);
    const first = items[0];
    const last = items.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  cancel.addEventListener('click', close);
  dialog.addEventListener('keydown', onKeydown);
  dialog.classList.remove('hidden');
  dialog.classList.add('flex');
  initialFocus?.focus();
  return () => {
    cancel.removeEventListener('click', close);
    dialog.removeEventListener('keydown', onKeydown);
    dialog.remove();
  };
}

function readCycleValues(form) {
  return {
    name: form.elements['attachment-cycle-name'].value.trim(),
    year: form.elements['attachment-cycle-year'].value,
    startMonth: form.elements['attachment-cycle-start-month'].value,
    endMonth: form.elements['attachment-cycle-end-month'].value,
    activateImmediately: form.elements['attachment-cycle-activate'].checked,
  };
}

function validateCycleForm(form) {
  const values = readCycleValues(form);
  const errors = [
    ['attachment-cycle-name', values.name ? '' : 'Cycle name is required.'],
    ['attachment-cycle-year', Number.isInteger(Number(values.year)) && Number(values.year) >= 2000 && Number(values.year) <= 2200 ? '' : 'Enter a valid year.'],
    ['attachment-cycle-start-month', Number(values.startMonth) >= 1 && Number(values.startMonth) <= 12 ? '' : 'Select a valid start month.'],
    ['attachment-cycle-end-month', Number(values.endMonth) >= 1 && Number(values.endMonth) <= 12 ? '' : 'Select a valid end month.'],
  ];
  errors.forEach(([name, message]) => setFieldError(form.elements[name], message));
  return !errors.some(([, message]) => message);
}

export async function initialiseSettings() {
  const content = document.querySelector('#settings-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading settings', message: 'Preparing your account settings.' });
  try {
    const profile = await getCachedStaffProfile();
    const accountSection = createDetailSection({
      id: 'account-settings-heading',
      title: 'Account Information',
      items: [
        createDetailItem({ label: 'Full Name', value: value(profile.full_name) }),
        createDetailItem({ label: 'Email', value: value(profile.email) }),
        createDetailItem({ label: 'Role', value: value(profile.role) }),
        createDetailItem({ label: 'Department', value: value(profile.department) }),
        createDetailItem({ label: 'Profile Created', value: formatDate(profile.created_at) }),
      ],
    });
    const { section, feedback, tableSlot } = createCycleSection();
    content.replaceChildren(accountSection, section);
    let cycles = [];

    const refreshCycles = async () => {
      tableSlot.replaceChildren(createPageState({ type: 'loading', title: 'Loading attachment cycles', message: 'Retrieving attachment cycle records.' }));
      try {
        cycles = await loadAttachmentCycles();
        tableSlot.replaceChildren(createAttachmentCycleTable(cycles));
      } catch {
        tableSlot.replaceChildren(createPageState({ type: 'error', title: 'Attachment cycles unavailable', message: 'Attachment cycle records could not be retrieved. Please try again.' }));
      }
    };

    const openCycleDialog = (mode, trigger, cycle = null) => {
      const { dialog, form, feedback: dialogFeedback, cancel, submit } = createAttachmentCycleDialog({ mode, cycle });
      const dispose = bindDialog({ dialog, cancel, initialFocus: form.elements['attachment-cycle-name'], trigger });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormFeedback(dialogFeedback);
        if (!validateCycleForm(form)) {
          form.querySelector('[aria-invalid="true"]')?.focus();
          return;
        }
        setButtonLoading(submit, true, mode === 'edit' ? 'Saving…' : 'Creating…');
        try {
          const values = readCycleValues(form);
          if (mode === 'edit') await updateAttachmentCycle(cycle.id, values);
          else await createAttachmentCycle(values);
          showFormFeedback(feedback, mode === 'edit' ? 'Attachment cycle updated successfully.' : 'Attachment cycle created successfully.', 'success');
          dispose();
          await refreshCycles();
        } catch {
          showFormFeedback(dialogFeedback, 'Unable to save the attachment cycle. Please try again.');
          setButtonLoading(submit, false);
        }
      });
    };

    const openConfirmation = (trigger, { title, message, confirmLabel, onConfirm }) => {
      const { dialog, cancel, confirm } = createConfirmationDialog({ id: 'attachment-cycle-confirmation', title, message, confirmLabel });
      const dispose = bindDialog({ dialog, cancel, initialFocus: cancel, trigger });
      confirm.addEventListener('click', async () => {
        setButtonLoading(confirm, true, 'Processing…');
        cancel.disabled = true;
        try {
          await onConfirm();
          dispose();
          await refreshCycles();
        } catch (error) {
          dispose();
          showFormFeedback(feedback, error?.code === 'ATTACHMENT_CYCLE_IN_USE'
            ? 'This attachment cycle is currently assigned to student records and cannot be deleted.'
            : 'Unable to complete the attachment cycle action. Please try again.');
        }
      });
    };

    section.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-attachment-cycle-action]');
      if (!trigger || !section.contains(trigger) || trigger.disabled) return;
      const action = trigger.dataset.attachmentCycleAction;
      const cycle = cycles.find((item) => item.id === trigger.dataset.attachmentCycleId);
      if (action === 'create') openCycleDialog('create', trigger);
      else if (action === 'edit' && cycle) openCycleDialog('edit', trigger, cycle);
      else if (action === 'activate' && cycle) {
        openConfirmation(trigger, {
          title: 'Activate Attachment Cycle',
          message: `Make ${cycle.name} (${cycle.year}) the active attachment cycle?`,
          confirmLabel: 'Activate',
          onConfirm: async () => {
            await activateAttachmentCycle(cycle.id);
            showFormFeedback(feedback, 'Attachment cycle activated successfully.', 'success');
          },
        });
      } else if (action === 'delete' && cycle) {
        openConfirmation(trigger, {
          title: 'Delete Attachment Cycle',
          message: `Permanently delete ${cycle.name} (${cycle.year})? This action cannot be undone.`,
          confirmLabel: 'Delete Cycle',
          onConfirm: async () => {
            await deleteAttachmentCycle(cycle.id);
            showFormFeedback(feedback, 'Attachment cycle deleted successfully.', 'success');
          },
        });
      }
    });
    await refreshCycles();
  } catch {
    content.replaceChildren(createPageState({
      type: 'error',
      title: 'Settings unavailable',
      message: 'Your account settings could not be loaded. Please refresh the page or try again later.',
    }));
  }
}
