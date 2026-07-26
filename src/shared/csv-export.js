import { triggerBrowserDownload } from './file-download.js';

function escapeCsvValue(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportCsv({ filename, columns, rows }) {
  const records = [
    columns.map((column) => escapeCsvValue(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvValue(row[column.key])).join(',')),
  ];
  const blob = new Blob([`\uFEFF${records.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  triggerBrowserDownload(blob, filename);
}
