import { getAuthState } from '../../auth/auth-state.js';
import { updateRows } from '../../../supabase/database.js';

export async function archiveStudentRecord(studentId) {
  const userId = getAuthState().user?.id;
  if (!userId) throw new Error('An authenticated staff member is required.');

  const records = await updateRows('students', {
    archived: true,
    archived_at: new Date().toISOString(),
    updated_by: userId,
  }, {
    filters: { id: studentId },
    columns: 'id',
  });

  return records[0] ?? null;
}
