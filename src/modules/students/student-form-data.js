import { clearFieldErrors, setFieldError } from '../../components/form-field.js';
import { getPassportPhotoValidationMessage } from '../../shared/passport-photo-storage.js';

function trimmedValue(form, name) { return form.elements[name]?.value.trim() ?? ''; }
function optionalValue(value) { return value || null; }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateStudentForm(form) {
  clearFieldErrors(form);
  setFieldError(form.elements['department-id']);
  let valid = true;
  ['full-name', 'student-number', 'department-id'].forEach((id) => {
    const input = form.elements[id];
    if (!input.value.trim()) { setFieldError(input, 'This field is required.'); valid = false; }
  });
  const department = form.elements['department-id'];
  if (department.value && !UUID_PATTERN.test(department.value)) {
    setFieldError(department, 'Select a valid department.');
    valid = false;
  }
  const email = form.elements.email;
  if (email.value.trim() && !email.validity.valid) { setFieldError(email, 'Enter a valid email address.'); valid = false; }
  const startDate = form.elements['attachment-start-date'];
  const endDate = form.elements['attachment-end-date'];
  if (startDate.value && endDate.value && endDate.value < startDate.value) {
    setFieldError(endDate, 'End date cannot be earlier than start date.'); valid = false;
  }
  const photo = form.elements['passport-photo'];
  const photoMessage = getPassportPhotoValidationMessage(photo?.files?.[0]);
  if (photoMessage) { setFieldError(photo, photoMessage); valid = false; }
  return valid;
}

export function createStudentPayload(form, { includeStudentNumber = true, attachmentCycle = null } = {}) {
  const payload = {
    full_name: trimmedValue(form, 'full-name'),
    department_id: trimmedValue(form, 'department-id'),
    email: optionalValue(trimmedValue(form, 'email')),
    phone: optionalValue(trimmedValue(form, 'phone')),
    national_id: optionalValue(trimmedValue(form, 'national-id')),
    university: optionalValue(trimmedValue(form, 'university')),
    course: optionalValue(trimmedValue(form, 'course')),
    skills: optionalValue(trimmedValue(form, 'skills')),
    attachment_start_date: optionalValue(trimmedValue(form, 'attachment-start-date')),
    attachment_end_date: optionalValue(trimmedValue(form, 'attachment-end-date')),
    placement_reference: optionalValue(trimmedValue(form, 'placement-reference')),
  };
  if (attachmentCycle) {
    payload.attachment_cycle_id = attachmentCycle.id;
    payload.attachment_cycle = attachmentCycle.name;
  }
  if (includeStudentNumber) payload.student_number = trimmedValue(form, 'student-number');
  return payload;
}
