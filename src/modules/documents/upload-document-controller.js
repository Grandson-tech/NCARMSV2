import { DOCUMENT_TYPES } from '../../config/document-types.js';
import { MAX_DOCUMENT_UPLOAD_BYTES } from '../../config/document-upload.js';
import { createDocumentUploadForm } from '../../components/document-upload-form.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setFieldError } from '../../components/form-field.js';
import { setButtonLoading } from '../../components/loading-button.js';
import { setUploadProgress } from '../../components/upload-progress.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { createDetailItem } from '../../components/detail-item.js';
import { createDetailSection } from '../../components/detail-section.js';
import { createNotFoundState } from '../../components/not-found-state.js';
import { loadUploadStudentOptions, uploadDocumentRecord } from './upload-document-service.js';
import { loadStudentDetails } from '../students/student-details-service.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function createStudentSummary(student) {
  const summary = createDetailSection({
    id: 'upload-student-summary-heading',
    title: 'Student Summary',
    items: [
      createDetailItem({ label: 'Full Name', value: student.fullName }),
      createDetailItem({ label: 'Student Number', value: student.studentNumber }),
      createDetailItem({ label: 'Department', value: student.department }),
      createDetailItem({ label: 'Attachment Cycle', value: student.attachmentCycle }),
    ],
  });
  summary.classList.add('mb-6');
  return summary;
}

function createRegistrationSuccessBanner() {
  const banner = document.createElement('section');
  banner.className = 'mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800';
  banner.tabIndex = -1;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');

  const title = document.createElement('h2');
  title.className = 'font-medium';
  title.textContent = 'Student created successfully.';
  const message = document.createElement('p');
  message.className = 'mt-1 leading-6';
  message.textContent = "Complete registration by uploading the student's attachment documents.";
  banner.append(title, message);
  return banner;
}

function validateUploadForm(form) {
  const student = form.elements['document-student-id'];
  const documentType = form.elements['document-type'];
  const fileInput = form.elements['document-file'];
  const file = fileInput.files?.[0] ?? null;
  const errors = [
    [student, student.value ? '' : 'Select a student.'],
    [documentType, documentType.value ? '' : 'Select a document type.'],
    [fileInput, !file ? 'Select a file to upload.' : file.size === 0 ? 'The selected file is empty.' : file.size > MAX_DOCUMENT_UPLOAD_BYTES ? 'The selected file must be 10 MB or smaller.' : ''],
  ];
  errors.forEach(([input, message]) => setFieldError(input, message));
  return !errors.some(([, message]) => message);
}

export async function initialiseUploadDocument() {
  const content = document.querySelector('#upload-document-content');
  if (!content) return;
  renderPageState(content, {
    type: 'loading',
    title: 'Loading upload form',
    message: 'Preparing the document upload workspace.',
  });

  const requestedStudentId = new URLSearchParams(window.location.search).get('student');
  if (requestedStudentId && !UUID_PATTERN.test(requestedStudentId)) {
    content.replaceChildren(createNotFoundState({
      title: 'Invalid student record',
      message: 'The student record identifier is invalid.',
      backHref: 'documents.html',
      backLabel: 'Back to Documents',
    }));
    return;
  }

  try {
    const selectedStudent = requestedStudentId ? await loadStudentDetails(requestedStudentId) : null;
    if (requestedStudentId && !selectedStudent) {
      content.replaceChildren(createNotFoundState({
        title: 'Student record not found',
        message: 'The requested student record could not be found.',
        backHref: 'documents.html',
        backLabel: 'Back to Documents',
      }));
      return;
    }
    const students = selectedStudent
      ? [{ id: selectedStudent.id, fullName: selectedStudent.fullName, studentNumber: selectedStudent.studentNumber }]
      : await loadUploadStudentOptions();
    const form = createDocumentUploadForm({
      students,
      documentTypes: DOCUMENT_TYPES,
      selectedStudentId: selectedStudent?.id,
      registrationCompletion: Boolean(selectedStudent),
    });
    const registrationBanner = selectedStudent ? createRegistrationSuccessBanner() : null;
    content.replaceChildren(...(selectedStudent ? [registrationBanner, createStudentSummary(selectedStudent), form] : [form]));
    registrationBanner?.focus();
    const feedback = form.querySelector('#document-upload-feedback');
    const progress = form.querySelector('[data-upload-progress-message]')?.parentElement;
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFormFeedback(feedback);
      if (!validateUploadForm(form)) {
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      const studentId = form.elements['document-student-id'].value;
      const documentType = form.elements['document-type'].value;
      const file = form.elements['document-file'].files[0];
      setButtonLoading(submitButton, true, 'Uploading…');
      setUploadProgress(progress, { active: true, message: 'Uploading and saving document…' });
      try {
        const record = await uploadDocumentRecord({ studentId, documentType, file });
        showFormFeedback(feedback, 'Document uploaded successfully. Redirecting…', 'success');
        setUploadProgress(progress, { active: false });
        window.setTimeout(() => window.location.assign(`student-details.html?id=${encodeURIComponent(record.student_id)}`), 300);
      } catch {
        setUploadProgress(progress, { active: false });
        showFormFeedback(feedback, 'Unable to upload the document. Please try again.');
        setButtonLoading(submitButton, false);
      }
    });
  } catch {
    content.replaceChildren(createPageState({
      type: 'error',
      title: 'Upload form unavailable',
      message: 'The document upload form could not be prepared. Please refresh the page.',
    }));
  }
}
