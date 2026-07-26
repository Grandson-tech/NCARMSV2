import { selectRows, updateRows } from '../../../supabase/database.js';
import { getAuthState } from '../../auth/auth-state.js';
import { removePassportPhoto, uploadPassportPhoto } from '../../shared/passport-photo-storage.js';

const EDITABLE_STUDENT_COLUMNS = [
  'id', 'passport_photo_url', 'full_name', 'student_number', 'department_id', 'attachment_cycle_id',
  'email', 'phone', 'national_id', 'university', 'course', 'skills',
  'attachment_start_date', 'attachment_end_date', 'placement_reference',
].join(', ');
const EDITABLE_STUDENT_COLUMNS_WITH_CYCLE = `${EDITABLE_STUDENT_COLUMNS}, attachment_cycles(name, year)`;

export async function loadEditableStudent(id) {
  const students = await selectRows('students', { columns: EDITABLE_STUDENT_COLUMNS_WITH_CYCLE, filters: { id } });
  if (students.length === 0) return null;
  if (students.length !== 1) throw new Error('Student query returned an unexpected result.');
  return students[0];
}

export async function updateStudentRecord(id, payload, { passportPhoto = null, currentPassportPhotoUrl = null } = {}) {
  const userId = getAuthState().user?.id;
  if (!userId) throw new Error('An authenticated user is required.');
  const newPassportPhotoUrl = passportPhoto ? await uploadPassportPhoto(passportPhoto) : null;
  const updates = {
    ...payload,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };
  if (newPassportPhotoUrl) updates.passport_photo_url = newPassportPhotoUrl;

  let record;
  try {
    const records = await updateRows('students', updates, { filters: { id }, columns: 'id' });
    record = records?.[0];
    if (!record?.id) throw new Error('Student record update did not return an identifier.');
  } catch (error) {
    if (newPassportPhotoUrl) await removePassportPhoto(newPassportPhotoUrl).catch(() => {});
    throw error;
  }

  if (newPassportPhotoUrl && currentPassportPhotoUrl && currentPassportPhotoUrl !== newPassportPhotoUrl) {
    try {
      await removePassportPhoto(currentPassportPhotoUrl);
    } catch (error) {
      try {
        await updateRows('students', {
          passport_photo_url: currentPassportPhotoUrl,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        }, { filters: { id }, columns: 'id' });
      } finally {
        await removePassportPhoto(newPassportPhotoUrl).catch(() => {});
      }
      throw error;
    }
  }
  return record;
}
