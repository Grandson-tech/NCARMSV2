import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { createStudentForm } from '../../components/student-form.js';
import { createStudentRecord } from './create-student-service.js';
import { loadDepartmentOptions } from './department-service.js';
import { createStudentPayload, validateStudentForm } from './student-form-data.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { loadActiveAttachmentCycle } from '../settings/attachment-cycle-service.js';

export async function initialiseCreateStudent() {
  const content = document.querySelector('#create-student-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading student form', message: 'Preparing department options.' });
  let departments;
  let activeCycle;
  try {
    [departments, activeCycle] = await Promise.all([loadDepartmentOptions(), loadActiveAttachmentCycle()]);
    if (!activeCycle) throw new Error('No active attachment cycle.');
  } catch {
    content.replaceChildren(createPageState({ type: 'error', title: 'Student form unavailable', message: 'Department options could not be retrieved. Please refresh the page.' }));
    return;
  }
  const form = createStudentForm({ departments, attachmentCycle: { label: `${activeCycle.name} ${activeCycle.year}` } });
  content.replaceChildren(form);
  const feedback = form.querySelector('#create-student-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormFeedback(feedback);
    if (!validateStudentForm(form)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setButtonLoading(submitButton, true, 'Saving…');
    const passportPhoto = form.elements['passport-photo']?.files?.[0] ?? null;
    try {
      const record = await createStudentRecord(createStudentPayload(form, { attachmentCycle: activeCycle }), passportPhoto);
      showFormFeedback(feedback, 'Student record created successfully. Redirecting…', 'success');
      window.setTimeout(() => window.location.assign(`upload-document.html?student=${encodeURIComponent(record.id)}`), 300);
    } catch {
      showFormFeedback(feedback, passportPhoto
        ? 'Unable to upload the passport photo and create the student record. No student record was saved.'
        : 'Unable to create the student record. Please try again.');
      setButtonLoading(submitButton, false);
    }
  });
}
