import { insertRows } from '../../../supabase/database.js';
import { removePassportPhoto, uploadPassportPhoto } from '../../shared/passport-photo-storage.js';

export async function createStudentRecord(payload, passportPhoto = null) {
  const passportPhotoUrl = passportPhoto ? await uploadPassportPhoto(passportPhoto) : null;
  try {
    const records = await insertRows('students', {
      ...payload,
      passport_photo_url: passportPhotoUrl,
    }, { columns: 'id' });
    const record = records?.[0];
    if (!record?.id) throw new Error('Student record creation did not return an identifier.');
    return record;
  } catch (error) {
    if (passportPhotoUrl) await removePassportPhoto(passportPhotoUrl).catch(() => {});
    throw error;
  }
}
