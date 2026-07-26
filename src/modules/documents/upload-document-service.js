import { getAuthState } from '../../auth/auth-state.js';
import { DOCUMENT_STORAGE_BUCKET } from '../../config/document-storage.js';
import { insertRows, selectRows } from '../../../supabase/database.js';
import { removeFiles, uploadFile } from '../../../supabase/storage.js';
import { createDocumentStoragePath } from '../../shared/document-storage-path.js';

const STUDENT_SELECTOR_COLUMNS = 'id, full_name, student_number';

export async function loadUploadStudentOptions() {
  const students = await selectRows('students', {
    columns: STUDENT_SELECTOR_COLUMNS,
    filters: { archived: false },
  });
  return students
    .map((student) => ({
      id: student.id,
      fullName: student.full_name,
      studentNumber: student.student_number,
    }))
    .sort((first, second) => String(first.fullName ?? '').localeCompare(String(second.fullName ?? '')));
}

export async function uploadDocumentRecord({ studentId, documentType, file }) {
  const uploadedBy = getAuthState().user?.id;
  if (!uploadedBy) throw new Error('An authenticated staff member is required.');

  const path = createDocumentStoragePath(studentId, file.name);
  const mimeType = file.type || 'application/octet-stream';
  await uploadFile(DOCUMENT_STORAGE_BUCKET, path, file, { contentType: mimeType, upsert: false });

  try {
    const records = await insertRows('documents', {
      student_id: studentId,
      document_type: documentType,
      mime_type: mimeType,
      uploaded_by: uploadedBy,
      bucket: DOCUMENT_STORAGE_BUCKET,
      path,
      original_file_name: file.name,
    }, { columns: 'id, student_id' });
    if (!records[0]) throw new Error('The uploaded document record could not be confirmed.');
    return records[0];
  } catch (error) {
    await removeFiles(DOCUMENT_STORAGE_BUCKET, [path]).catch(() => {});
    throw error;
  }
}
