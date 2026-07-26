import { selectRows } from '../../../supabase/database.js';

const STUDENT_DETAILS_COLUMNS = [
  'id', 'passport_photo_url', 'full_name', 'student_number', 'university', 'course',
  'department_id', 'attachment_cycle_id', 'attachment_start_date', 'attachment_end_date', 'archived',
].join(', ');
const STUDENT_DETAILS_COLUMNS_WITH_RELATIONSHIPS = `${STUDENT_DETAILS_COLUMNS}, departments(name), attachment_cycles(name, year)`;

export async function loadStudentDetails(id) {
  const students = await selectRows('students', { columns: STUDENT_DETAILS_COLUMNS_WITH_RELATIONSHIPS, filters: { id } });
  if (students.length === 0) return null;
  if (students.length !== 1) throw new Error('Student query returned an unexpected result.');
  const student = students[0];
  const cycle = student.attachment_cycles;
  return Object.freeze({
    id: student.id,
    passportPhotoUrl: student.passport_photo_url,
    fullName: student.full_name,
    studentNumber: student.student_number,
    university: student.university,
    course: student.course,
    department: student.departments?.name ?? 'Unknown department',
    attachmentCycle: cycle ? `${cycle.name} ${cycle.year}` : 'Not provided',
    attachmentStartDate: student.attachment_start_date,
    attachmentEndDate: student.attachment_end_date,
    archived: Boolean(student.archived),
  });
}
