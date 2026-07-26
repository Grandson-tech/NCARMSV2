import { selectRows } from '../../../supabase/database.js';

const STUDENT_REPORT_COLUMNS = 'id, passport_photo_url, full_name, student_number, department_id, university, attachment_cycle_id, archived, created_at, departments(name), attachment_cycles(name, year)';
const DEPARTMENT_COLUMNS = 'id, name';
const ATTACHMENT_CYCLE_COLUMNS = 'id, name, year, is_active';

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatCycle(cycle) {
  return cycle ? `${cycle.name} ${cycle.year}` : 'Not provided';
}

function normaliseStudent(student) {
  return Object.freeze({
    id: student.id,
    passportPhotoUrl: student.passport_photo_url,
    fullName: student.full_name ?? 'Not provided',
    studentNumber: student.student_number ?? 'Not provided',
    departmentId: student.department_id,
    department: student.departments?.name ?? 'Not provided',
    university: student.university ?? 'Not provided',
    attachmentCycleId: student.attachment_cycle_id,
    attachmentCycle: formatCycle(student.attachment_cycles),
    archived: Boolean(student.archived),
    status: student.archived ? 'Archived' : 'Active',
    registrationDate: formatDate(student.created_at),
    registrationDateValue: student.created_at ? String(student.created_at).slice(0, 10) : '',
  });
}

export async function loadReportsWorkspace() {
  const [students, departments, attachmentCycles] = await Promise.all([
    selectRows('students', { columns: STUDENT_REPORT_COLUMNS }),
    selectRows('departments', { columns: DEPARTMENT_COLUMNS }),
    selectRows('attachment_cycles', { columns: ATTACHMENT_CYCLE_COLUMNS }),
  ]);
  return Object.freeze({
    students: students.map(normaliseStudent),
    departments: departments
      .map(({ id, name }) => ({ value: id, label: name ?? 'Unnamed department' }))
      .sort((first, second) => first.label.localeCompare(second.label)),
    attachmentCycles: attachmentCycles
      .map(({ id, name, year }) => ({ value: id, label: year ? `${name} ${year}` : name ?? 'Unnamed attachment cycle' }))
      .sort((first, second) => first.label.localeCompare(second.label)),
    activeAttachmentCycle: attachmentCycles.find((cycle) => cycle.is_active) ?? null,
  });
}

export function filterReportStudents(students, { departmentId = '', university = '', attachmentCycleId = '', dateFrom = '', dateTo = '' } = {}) {
  return students.filter((student) => {
    if (departmentId && student.departmentId !== departmentId) return false;
    if (university && student.university !== university) return false;
    if (attachmentCycleId && student.attachmentCycleId !== attachmentCycleId) return false;
    if (dateFrom && (!student.registrationDateValue || student.registrationDateValue < dateFrom)) return false;
    if (dateTo && (!student.registrationDateValue || student.registrationDateValue > dateTo)) return false;
    return true;
  });
}

export function createReportSummary(students, activeAttachmentCycle) {
  return Object.freeze({
    totalStudents: students.length,
    activeStudents: students.filter((student) => !student.archived).length,
    archivedStudents: students.filter((student) => student.archived).length,
    departmentsRepresented: new Set(students.map((student) => student.departmentId).filter(Boolean)).size,
    universitiesRepresented: new Set(students.map((student) => student.university).filter((value) => value && value !== 'Not provided')).size,
    currentActiveAttachmentCycle: activeAttachmentCycle ? formatCycle(activeAttachmentCycle) : 'Not available',
  });
}
