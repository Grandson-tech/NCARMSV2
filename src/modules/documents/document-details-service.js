import { selectRows } from '../../../supabase/database.js';
import { createSignedFileUrl, downloadFile } from '../../../supabase/storage.js';
import { DOCUMENT_STORAGE_BUCKET } from '../../config/document-storage.js';

const DOCUMENT_COLUMNS = [
  'id',
  'student_id',
  'document_type',
  'mime_type',
  'uploaded_by',
  'uploaded_at',
  'bucket',
  'path',
  'original_file_name',
].join(', ');

const DOCUMENT_COLUMNS_WITH_STUDENT = `${DOCUMENT_COLUMNS}, students(full_name)`;
const PREVIEW_EXPIRY_SECONDS = 300;

function relationshipUnavailable(error) {
  return error?.code === 'PGRST200' || error?.code === 'PGRST201';
}

function supportsPreview(mimeType) {
  return mimeType?.startsWith('image/') || mimeType === 'application/pdf';
}

async function fetchDocument(documentId) {
  try {
    const documents = await selectRows('documents', {
      columns: DOCUMENT_COLUMNS_WITH_STUDENT,
      filters: { id: documentId },
    });
    return documents[0] ?? null;
  } catch (error) {
    if (!relationshipUnavailable(error)) throw error;
    const documents = await selectRows('documents', {
      columns: DOCUMENT_COLUMNS,
      filters: { id: documentId },
    });
    return documents[0] ?? null;
  }
}

async function getPreviewUrl(document) {
  if (!supportsPreview(document.mime_type)) return null;
  try {
    const result = await createSignedFileUrl(DOCUMENT_STORAGE_BUCKET, document.path, PREVIEW_EXPIRY_SECONDS);
    return result?.signedUrl ?? null;
  } catch {
    return null;
  }
}

function presentDocument(document, previewUrl) {
  return Object.freeze({
    id: document.id,
    studentId: document.student_id,
    studentName: document.students?.full_name ?? document.student_id,
    documentType: document.document_type,
    mimeType: document.mime_type,
    uploadedBy: document.uploaded_by,
    uploadedAt: document.uploaded_at,
    storagePath: document.path,
    originalFileName: document.original_file_name,
    previewUrl,
  });
}

export async function loadDocumentDetails(documentId) {
  const document = await fetchDocument(documentId);
  if (!document) return null;
  return presentDocument(document, await getPreviewUrl(document));
}

export async function downloadDocumentById(documentId) {
  const document = await fetchDocument(documentId);
  if (!document) throw new Error('Document not found.');
  const blob = await downloadFile(DOCUMENT_STORAGE_BUCKET, document.path);
  return Object.freeze({
    blob,
    originalFileName: document.original_file_name,
    previewUrl: await getPreviewUrl(document),
  });
}
