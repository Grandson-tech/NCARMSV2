import { createDetailItem } from '../../components/detail-item.js';
import { createDetailSection } from '../../components/detail-section.js';
import { createDocumentTable, renderDocumentRows, renderDocumentTableEmpty, renderDocumentTableState } from '../../components/document-table.js';
import { createNotFoundState } from '../../components/not-found-state.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { createStudentPhoto } from '../../components/student-photo.js';
import { triggerBrowserDownload } from '../../shared/file-download.js';
import { initialiseArchiveStudentController } from './archive-student-controller.js';
import { loadStudentDetails } from './student-details-service.js';
import { initialiseDeleteDocumentController } from '../documents/delete-document-controller.js';
import { initialiseDocumentDownloadController } from '../documents/document-download-controller.js';
import { downloadDocumentById } from '../documents/document-details-service.js';
import { loadDocumentRecords } from '../documents/document-records-service.js';
import { clearFormFeedback, showFormFeedback } from '../../components/form-feedback.js';
import { setButtonLoading } from '../../components/loading-button.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function value(input) { return input === null || input === undefined || input === '' ? 'Not provided' : String(input); }

function formatDate(input) {
  if (!input || Number.isNaN(new Date(input).getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(input));
}

function backLink() {
  const link = document.createElement('a');
  link.href = 'student-records.html';
  link.className = 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  link.textContent = 'Back to Student Records';
  return link;
}

function editLink(studentId) {
  const link = document.createElement('a');
  link.href = `edit-student.html?id=${encodeURIComponent(studentId)}`;
  link.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  link.textContent = 'Edit Student';
  return link;
}

function archiveButton(studentId, isArchived) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.archiveStudentId = studentId;
  button.disabled = isArchived;
  button.className = 'inline-flex h-10 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  button.textContent = isArchived ? 'Archived' : 'Archive Student';
  return button;
}

function createStudentDocumentsSection(studentId) {
  const section = document.createElement('section');
  section.className = 'mt-6';
  section.setAttribute('aria-labelledby', 'student-documents-heading');
  const heading = document.createElement('h2');
  heading.id = 'student-documents-heading';
  heading.className = 'text-lg font-semibold text-slate-900';
  heading.textContent = 'Documents';
  const description = document.createElement('p');
  description.className = 'mt-1 text-sm leading-6 text-slate-600';
  description.textContent = 'Attachment documents recorded for this student.';
  const table = createDocumentTable();
  table.classList.add('mt-4');
  section.append(heading, description, table);
  renderDocumentTableState(table.querySelector('#document-records-table-body'), 'loading');
  section.dataset.studentId = studentId;
  return section;
}

async function loadStudentDocuments(section, studentId) {
  const tableBody = section.querySelector('#document-records-table-body');
  try {
    const documents = await loadDocumentRecords({ studentId });
    if (documents.length === 0) {
      renderDocumentTableEmpty(tableBody, {
        uploadHref: `upload-document.html?student=${encodeURIComponent(studentId)}`,
      });
    } else {
      renderDocumentRows(tableBody, documents);
    }
  } catch {
    renderDocumentTableState(tableBody, 'error');
  }
}

function initialiseStudentDocumentDownloads(section) {
  const feedback = document.createElement('div');
  feedback.className = 'mb-4';
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  section.prepend(feedback);
  section.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-document-download-id]');
    if (!button || !section.contains(button) || button.disabled) return;
    clearFormFeedback(feedback);
    setButtonLoading(button, true, 'Downloading…');
    try {
      const { blob, originalFileName } = await downloadDocumentById(button.dataset.documentDownloadId);
      triggerBrowserDownload(blob, originalFileName);
      showFormFeedback(feedback, 'Document download started.', 'success');
    } catch {
      showFormFeedback(feedback, 'Unable to download the document. Please try again.');
    } finally {
      setButtonLoading(button, false);
    }
  });
}

function renderDetails(content, student) {
  const fragment = document.createDocumentFragment();
  const profile = document.createElement('section');
  profile.className = 'flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center md:p-6';
  profile.setAttribute('aria-labelledby', 'student-name');
  profile.append(createStudentPhoto({ url: student.passportPhotoUrl, fullName: student.fullName }));
  const profileText = document.createElement('div');
  const name = document.createElement('h2');
  name.id = 'student-name';
  name.className = 'text-lg font-semibold text-slate-900';
  name.textContent = value(student.fullName);
  const number = document.createElement('p');
  number.className = 'mt-1 text-sm text-slate-600';
  number.textContent = `Student number: ${value(student.studentNumber)}`;
  profileText.append(name, number);
  profile.append(profileText);

  const personal = createDetailSection({ id: 'personal-information', title: 'Personal Information', items: [
    createDetailItem({ label: 'Full name', value: value(student.fullName) }),
    createDetailItem({ label: 'Student number', value: value(student.studentNumber) }),
  ] });
  const academic = createDetailSection({ id: 'academic-information', title: 'Academic Information', items: [
    createDetailItem({ label: 'University', value: value(student.university) }),
    createDetailItem({ label: 'Course', value: value(student.course) }),
    createDetailItem({ label: 'Department', value: value(student.department) }),
    createDetailItem({ label: 'Attachment cycle', value: value(student.attachmentCycle) }),
  ] });
  const attachment = createDetailSection({ id: 'attachment-information', title: 'Attachment Information', items: [
    createDetailItem({ label: 'Start date', value: formatDate(student.attachmentStartDate) }),
    createDetailItem({ label: 'End date', value: formatDate(student.attachmentEndDate) }),
    createDetailItem({ label: 'Archived status', value: student.archived ? 'Archived' : 'Not archived' }),
  ] });
  [personal, academic, attachment].forEach((section) => section.classList.add('mt-6'));
  const documents = createStudentDocumentsSection(student.id);
  const actions = document.createElement('section');
  actions.className = 'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end';
  actions.setAttribute('aria-label', 'Student details actions');
  actions.append(backLink(), editLink(student.id), archiveButton(student.id, student.archived));
  fragment.append(profile, personal, academic, attachment, documents, actions);
  content.replaceChildren(fragment);
  return documents;
}

function renderNotFound(content, title, message) {
  content.replaceChildren(createNotFoundState({ title, message, backHref: 'student-records.html', backLabel: 'Back to Student Records' }));
}

export async function initialiseStudentDetails() {
  const content = document.querySelector('#student-details-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading student details', message: 'Retrieving the student record.' });
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id || !UUID_PATTERN.test(id)) {
    renderNotFound(content, 'Invalid student record', 'The student record identifier is invalid.');
    return;
  }
  try {
    const student = await loadStudentDetails(id);
    if (!student) {
      renderNotFound(content, 'Student record not found', 'Student record not found.');
      return;
    }
    const documentsSection = renderDetails(content, student);
    initialiseArchiveStudentController({
      root: content,
      redirectTo: 'student-records.html',
    });
    initialiseDocumentDownloadController({ root: documentsSection });
    initialiseDeleteDocumentController({
      root: documentsSection,
      onSuccess: () => window.location.reload(),
    });
    await loadStudentDocuments(documentsSection, student.id);
  } catch {
    content.replaceChildren(createPageState({ type: 'error', title: 'Student details unavailable', message: 'The student record could not be retrieved. Please refresh the page or try again later.' }));
  }
}
