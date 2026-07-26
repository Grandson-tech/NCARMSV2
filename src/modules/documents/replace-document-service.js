import { getAuthState } from '../../auth/auth-state.js';
import { DOCUMENT_STORAGE_BUCKET } from '../../config/document-storage.js';
import { selectRows, updateRows } from '../../../supabase/database.js';
import { removeFiles, uploadFile } from '../../../supabase/storage.js';
import { createDocumentStoragePath } from '../../shared/document-storage-path.js';

const REPLACE_DOCUMENT_COLUMNS = 'id, student_id';

async function loadReplacementTarget(documentId) {
  const documents = await selectRows('documents', {
    columns: REPLACE_DOCUMENT_COLUMNS,
    filters: { id: documentId },
  });
  return documents[0] ?? null;
}

export async function replaceDocumentFile({ documentId, file }) {
  const uploadedBy = getAuthState().user?.id;
  if (!uploadedBy) throw new Error('An authenticated staff member is required.');
  const document = await loadReplacementTarget(documentId);
  if (!document) throw new Error('Document not found.');

  const path = createDocumentStoragePath(document.student_id, file.name);
  const mimeType = file.type || 'application/octet-stream';
  await uploadFile(DOCUMENT_STORAGE_BUCKET, path, file, { contentType: mimeType, upsert: false });

  try {
    const records = await updateRows('documents', {
      bucket: DOCUMENT_STORAGE_BUCKET,
      path,
      mime_type: mimeType,
      original_file_name: file.name,
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    }, { filters: { id: documentId }, columns: 'id' });
    if (!records[0]?.id) throw new Error('The replacement document could not be confirmed.');
    return records[0];
  } catch (error) {
    await removeFiles(DOCUMENT_STORAGE_BUCKET, [path]).catch(() => {});
    throw error;
  }
}
