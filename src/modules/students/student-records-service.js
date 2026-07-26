import { selectRows } from '../../../supabase/database.js';

const STUDENT_RECORD_COLUMNS = [
  'id',
  'passport_photo_url',
  'full_name',
  'student_number',
  'university',
  'course',
  'department_id',
  'attachment_cycle_id',
  'national_id',
  'phone',
  'attachment_start_date',
  'attachment_end_date',
  'archived',
].join(', ');

const STUDENT_RECORD_COLUMNS_WITH_RELATIONSHIPS = `${STUDENT_RECORD_COLUMNS}, departments(name), attachment_cycles(name, year)`;

function relationshipUnavailable(error) {
  return error?.code === 'PGRST200' || error?.code === 'PGRST201';
}

function normaliseStudent(student) {
  return {
    ...student,
    departmentName: student.departments?.name ?? null,
    attachmentCycle: student.attachment_cycles
      ? `${student.attachment_cycles.name} ${student.attachment_cycles.year}`
      : null,
  };
}

/**
 * Loads student records for a selected archive view.
 * Use `archived: null` when a future view needs both active and archived records.
 */
export async function loadStudentRecords({ archived = null } = {}) {
  const filters = archived === null ? {} : { archived };
  try {
    const students = await selectRows('students', { columns: STUDENT_RECORD_COLUMNS_WITH_RELATIONSHIPS, filters });
    return students.map(normaliseStudent);
  } catch (error) {
    if (!relationshipUnavailable(error)) throw error;
    const students = await selectRows('students', { columns: STUDENT_RECORD_COLUMNS, filters });
    return students.map(normaliseStudent);
  }
}

export async function loadStudentRecordFilterOptions() {
  const [departments, attachmentCycles] = await Promise.all([
    selectRows('departments', { columns: 'id, name' }),
    selectRows('attachment_cycles', { columns: 'id, name, year' }),
  ]);

  return Object.freeze({
    departments: departments
      .map(({ id, name }) => ({ value: id, label: name ?? 'Unnamed department' }))
      .sort((first, second) => first.label.localeCompare(second.label)),
    attachmentCycles: attachmentCycles
      .map(({ id, name, year }) => ({ value: id, label: year ? `${name} ${year}` : name ?? 'Unnamed attachment cycle' }))
      .sort((first, second) => first.label.localeCompare(second.label)),
  });
}

function searchableValue(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function filterStudentRecords(students, { search = '', departmentId = '', university = '', attachmentCycleId = '', archived = 'all' } = {}) {
  const searchTerm = searchableValue(search);
  return students.filter((student) => {
    if (departmentId && student.department_id !== departmentId) return false;
    if (university && student.university !== university) return false;
    if (attachmentCycleId && student.attachment_cycle_id !== attachmentCycleId) return false;
    if (archived === 'active' && student.archived) return false;
    if (archived === 'archived' && !student.archived) return false;
    if (!searchTerm) return true;
    return [
      student.full_name,
      student.student_number,
      student.national_id,
      student.phone,
      student.university,
      student.course,
    ].some((value) => searchableValue(value).includes(searchTerm));
  });
}
