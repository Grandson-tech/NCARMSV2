import { selectRows } from '../../../supabase/database.js';

const DOCUMENT_COLUMNS = [
  'id',
  'student_id',
  'document_type',
  'uploaded_by',
  'uploaded_at',
  'original_file_name',
].join(', ');

const DOCUMENT_COLUMNS_WITH_RELATIONSHIPS = `${DOCUMENT_COLUMNS}, students(full_name), staff_profiles(full_name)`;

function normaliseDocument(document) {
  return {
    ...document,
    studentName: document.students?.full_name ?? null,
    uploaderName: document.staff_profiles?.full_name ?? null,
  };
}

function searchableValue(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function filterDocumentRecords(documents, { search = '', documentType = '', status = '' } = {}) {
  const searchTerm = searchableValue(search);
  return documents.filter((document) => {
    if (documentType && document.document_type !== documentType) return false;
    if (status && document.status !== undefined && document.status !== status) return false;
    if (!searchTerm) return true;
    return [
      document.studentName,
      document.document_type,
      document.original_file_name,
      document.uploaderName,
    ].some((value) => searchableValue(value).includes(searchTerm));
  });
}

function relationshipUnavailable(error) {
  return error?.code === 'PGRST200' || error?.code === 'PGRST201';
}

export async function loadDocumentRecords({ studentId = null } = {}) {
  const filters = studentId ? { student_id: studentId } : {};
  try {
    const documents = await selectRows('documents', { columns: DOCUMENT_COLUMNS_WITH_RELATIONSHIPS, filters });
    return documents.map(normaliseDocument);
  } catch (error) {
    if (!relationshipUnavailable(error)) throw error;
    const documents = await selectRows('documents', { columns: DOCUMENT_COLUMNS, filters });
    return documents.map(normaliseDocument);
  }
}
