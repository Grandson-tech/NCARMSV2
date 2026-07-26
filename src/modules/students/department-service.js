import { selectRows } from '../../../supabase/database.js';

const DEPARTMENT_COLUMNS = 'id, name';

export async function loadDepartmentOptions() {
  const departments = await selectRows('departments', { columns: DEPARTMENT_COLUMNS });
  return departments
    .map((department) => ({ id: department.id, name: department.name }))
    .sort((first, second) => String(first.name ?? '').localeCompare(String(second.name ?? '')));
}
