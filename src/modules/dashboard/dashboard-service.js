import { selectRows } from '../../../supabase/database.js';
import { loadActiveAttachmentCycle } from '../settings/attachment-cycle-service.js';

const STUDENT_COLUMNS = 'id, passport_photo_url, full_name, university, department_id, created_at, departments(name)';
const DEPARTMENT_COLUMNS = 'id, name';

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function newestFirst(first, second) {
  return new Date(second.created_at || 0) - new Date(first.created_at || 0);
}

export async function loadDashboardStatistics() {
  const [students, departments, activeCycle] = await Promise.all([
    selectRows('students', { columns: STUDENT_COLUMNS }),
    selectRows('departments', { columns: DEPARTMENT_COLUMNS }),
    loadActiveAttachmentCycle(),
  ]);
  const departmentNames = new Map(departments.map((department) => [department.id, department.name]));
  const departmentCounts = new Map(departments.map((department) => [department.id, 0]));
  const universityCounts = new Map();
  students.forEach((student) => {
    if (departmentCounts.has(student.department_id)) departmentCounts.set(student.department_id, departmentCounts.get(student.department_id) + 1);
    const university = String(student.university ?? '').trim();
    if (university) universityCounts.set(university, (universityCounts.get(university) ?? 0) + 1);
  });
  const newestStudents = [...students].sort(newestFirst);
  return Object.freeze({
    totalStudents: students.length,
    departmentCount: departments.length,
    universityCount: universityCounts.size,
    currentAttachmentCycle: activeCycle ? `${activeCycle.name} ${activeCycle.year}` : '—',
    hasActiveAttachmentCycle: Boolean(activeCycle),
    departments: departments.map((department) => ({ id: department.id, name: department.name ?? '—', studentCount: departmentCounts.get(department.id) ?? 0 })).sort((first, second) => second.studentCount - first.studentCount || first.name.localeCompare(second.name)),
    universities: [...universityCounts.entries()].map(([name, count]) => ({ name, count })).sort((first, second) => first.name.localeCompare(second.name)),
    recentStudents: newestStudents.slice(0, 5).map((student) => ({
      id: student.id,
      passportPhotoUrl: student.passport_photo_url,
      fullName: student.full_name ?? '—',
      university: student.university ?? '—',
      department: student.departments?.name ?? departmentNames.get(student.department_id) ?? '—',
      registeredAt: formatDate(student.created_at),
    })),
  });
}
