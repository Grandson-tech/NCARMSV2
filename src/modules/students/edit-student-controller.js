import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { createNotFoundState } from '../../components/not-found-state.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { createStudentForm } from '../../components/student-form.js';
import { loadEditableStudent, updateStudentRecord } from './edit-student-service.js';
import { loadDepartmentOptions } from './department-service.js';
import { createStudentPayload, validateStudentForm } from './student-form-data.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function showNotFound(content, title, message) {
  content.replaceChildren(createNotFoundState({ title, message, backHref: 'student-records.html', backLabel: 'Back to Student Records' }));
}

function initialValues(student) {
  return {
    fullName: student.full_name,
    studentNumber: student.student_number,
    departmentId: student.department_id,
    email: student.email,
    phone: student.phone,
    nationalId: student.national_id,
    university: student.university,
    course: student.course,
    skills: student.skills,
    placementReference: student.placement_reference,
    attachmentStartDate: student.attachment_start_date,
    attachmentEndDate: student.attachment_end_date,
  };
}

export async function initialiseEditStudent() {
  const content = document.querySelector('#edit-student-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading student record', message: 'Preparing the record for editing.' });
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id || !UUID_PATTERN.test(id)) {
    showNotFound(content, 'Invalid student record', 'The student record identifier is invalid.');
    return;
  }
  try {
    const [student, departments] = await Promise.all([loadEditableStudent(id), loadDepartmentOptions()]);
    if (!student) { showNotFound(content, 'Student record not found', 'Student record not found.'); return; }
    const form = createStudentForm({ mode: 'edit', initialValues: initialValues(student), photoUrl: student.passport_photo_url, departments, attachmentCycle: { label: student.attachment_cycles ? `${student.attachment_cycles.name} ${student.attachment_cycles.year}` : 'Not provided' } });
    content.replaceChildren(form);
    const feedback = form.querySelector('[data-student-feedback]');
    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFormFeedback(feedback);
      if (!validateStudentForm(form)) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
      setButtonLoading(submitButton, true, 'Saving…');
      const passportPhoto = form.elements['passport-photo']?.files?.[0] ?? null;
      try {
        const record = await updateStudentRecord(
          id,
          createStudentPayload(form, { includeStudentNumber: false }),
          { passportPhoto, currentPassportPhotoUrl: student.passport_photo_url },
        );
        showFormFeedback(feedback, 'Student record updated successfully. Redirecting…', 'success');
        window.setTimeout(() => window.location.assign(`student-details.html?id=${encodeURIComponent(record.id)}`), 300);
      } catch {
        showFormFeedback(feedback, passportPhoto
          ? 'Unable to replace the passport photo and save changes. The existing photo was retained.'
          : 'Unable to update the student record. Please try again.');
        setButtonLoading(submitButton, false);
      }
    });
  } catch {
    content.replaceChildren(createPageState({ type: 'error', title: 'Student record unavailable', message: 'The student record could not be retrieved. Please refresh the page or try again later.' }));
  }
}
