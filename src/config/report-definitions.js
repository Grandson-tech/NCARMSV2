export const REPORT_DEFINITIONS = Object.freeze([
  {
    id: 'student-attachment-records',
    title: 'Student Attachment Records',
    description: 'View student attachment records and their current placement details.',
    columns: [
      { key: 'studentName', label: 'Student' },
      { key: 'studentNumber', label: 'Student Number' },
      { key: 'department', label: 'Department' },
      { key: 'attachmentCycle', label: 'Attachment Cycle' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'recordStatus', label: 'Status' },
    ],
  },
  {
    id: 'department-summary',
    title: 'Department Summary',
    description: 'View active and archived attachment record totals by department.',
    columns: [
      { key: 'department', label: 'Department' },
      { key: 'activeRecords', label: 'Active Records' },
      { key: 'archivedRecords', label: 'Archived Records' },
      { key: 'totalRecords', label: 'Total Records' },
    ],
  },
  {
    id: 'document-summary',
    title: 'Document Summary',
    description: 'View document totals grouped by document type.',
    columns: [
      { key: 'documentType', label: 'Document Type' },
      { key: 'documentCount', label: 'Documents' },
      { key: 'latestUpload', label: 'Latest Upload' },
    ],
  },
  {
    id: 'attachment-cycle-summary',
    title: 'Attachment Cycle Summary',
    description: 'View active and archived attachment record totals by cycle.',
    columns: [
      { key: 'attachmentCycle', label: 'Attachment Cycle' },
      { key: 'activeRecords', label: 'Active Records' },
      { key: 'archivedRecords', label: 'Archived Records' },
      { key: 'totalRecords', label: 'Total Records' },
      { key: 'earliestStart', label: 'Earliest Start' },
      { key: 'latestEnd', label: 'Latest End' },
    ],
  },
]);

export function getReportDefinition(reportId) {
  return REPORT_DEFINITIONS.find((report) => report.id === reportId) ?? null;
}
