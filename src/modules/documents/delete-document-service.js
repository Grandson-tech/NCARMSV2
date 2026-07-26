import { deleteRows, selectRows } from '../../../supabase/database.js';
import { removeFiles } from '../../../supabase/storage.js';
import { DOCUMENT_STORAGE_BUCKET } from '../../config/document-storage.js';

const DOCUMENT_STORAGE_COLUMNS = 'id, path';

/**
 * Permanently removes a document file before deleting its metadata record.
 */
export async function deleteDocumentRecord(documentId) {
  const documents = await selectRows('documents', {
    columns: DOCUMENT_STORAGE_COLUMNS,
    filters: { id: documentId },
  });
  const document = documents[0];
  if (!document) throw new Error('Document not found.');

  try {
    await removeFiles(DOCUMENT_STORAGE_BUCKET, [document.path]);
  } catch {
    throw new Error('Unable to delete the document.');
  }

  try {
    await deleteRows('documents', { filters: { id: document.id } });
  } catch {
    throw new Error('Unable to delete the document.');
  }
}
