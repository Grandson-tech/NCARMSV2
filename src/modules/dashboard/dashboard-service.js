import { selectRows } from '../../../supabase/database.js';
import { getActiveCycle } from '../../shared/active-cycle-manager.js';
import { formatUniversityName } from '../../shared/normalize-university.js';

const STUDENT_COLUMNS = 'id, passport_photo_url, full_name, university, department_id, attachment_cycle_id, created_at, departments(name)';
const DEPARTMENT_COLUMNS = 'id, name';
let departmentCache = null;
let departmentRequest = null;

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function newestFirst(first, second) {
  return new Date(second.created_at || 0) - new Date(first.created_at || 0);
}

async function loadDashboardDepartments() {
  if (departmentCache) return departmentCache;
  if (!departmentRequest) {
    departmentRequest = selectRows('departments', { columns: DEPARTMENT_COLUMNS })
      .then((departments) => {
        departmentCache = departments;
        return departmentCache;
      })
      .finally(() => { departmentRequest = null; });
  }
  return departmentRequest;
}

export async function loadDashboardStatistics({ activeCycle = null } = {}) {
  const cycle = activeCycle ?? await getActiveCycle();
  const [students, departments] = await Promise.all([
    cycle ? selectRows('students', { columns: STUDENT_COLUMNS, filters: { attachment_cycle_id: cycle.id } }) : Promise.resolve([]),
    loadDashboardDepartments(),
  ]);
  const departmentNames = new Map(departments.map((department) => [department.id, department.name]));
  const departmentCounts = new Map(departments.map((department) => [department.id, 0]));
  const universityCounts = new Map();
  students.forEach((student) => {
    if (departmentCounts.has(student.department_id)) departmentCounts.set(student.department_id, departmentCounts.get(student.department_id) + 1);
    const university = formatUniversityName(student.university);
    if (university) universityCounts.set(university, (universityCounts.get(university) ?? 0) + 1);
  });
  const newestStudents = [...students].sort(newestFirst);
  return Object.freeze({
    totalStudents: students.length,
    departmentCount: [...departmentCounts.values()].filter((count) => count > 0).length,
    universityCount: universityCounts.size,
    currentAttachmentCycle: cycle ? `${cycle.name} ${cycle.year}` : '—',
    hasActiveAttachmentCycle: Boolean(cycle),
    departments: departments.map((department) => ({ id: department.id, name: department.name ?? '—', studentCount: departmentCounts.get(department.id) ?? 0 })).filter((department) => department.studentCount > 0).sort((first, second) => second.studentCount - first.studentCount || first.name.localeCompare(second.name)),
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
