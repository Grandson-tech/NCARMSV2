import { createReportFilterBar } from '../../components/report-filter-bar.js';
import { createReportResultsTable, renderReportResults, renderReportResultsState } from '../../components/report-results-table.js';
import { createSummaryCard } from '../../components/summary-card.js';
import { renderPageState } from '../../components/page-state.js';
import { exportCsv } from '../../shared/csv-export.js';
import { createReportSummary, filterReportStudents, loadReportsWorkspace } from './reports-service.js';

const REPORT_COLUMNS = Object.freeze([
  { key: 'fullName', label: 'Student Name' },
  { key: 'studentNumber', label: 'Student Number' },
  { key: 'department', label: 'Department' },
  { key: 'university', label: 'University' },
  { key: 'attachmentCycle', label: 'Attachment Cycle' },
  { key: 'status', label: 'Status' },
  { key: 'registrationDate', label: 'Registration Date' },
]);

const SUMMARY_CARDS = Object.freeze([
  { id: 'totalStudents', title: 'Total Students', description: 'Students matching the current filters.' },
  { id: 'activeStudents', title: 'Active Students', description: 'Non-archived students matching the current filters.' },
  { id: 'archivedStudents', title: 'Archived Students', description: 'Archived students matching the current filters.' },
  { id: 'departmentsRepresented', title: 'Departments Represented', description: 'Departments in the filtered results.' },
  { id: 'universitiesRepresented', title: 'Universities Represented', description: 'Universities in the filtered results.' },
  { id: 'currentActiveAttachmentCycle', title: 'Current Active Attachment Cycle', description: 'Configured through Attachment Cycle Management.' },
]);

function uniqueUniversities(students) {
  return [...new Set(students.map((student) => student.university).filter((value) => value && value !== 'Not provided'))]
    .sort((first, second) => first.localeCompare(second))
    .map((university) => ({ value: university, label: university }));
}

function createActionButton({ label, action, primary = false }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.reportAction = action;
  button.className = primary
    ? 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    : 'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  button.textContent = label;
  return button;
}

function readFilters(content) {
  return {
    departmentId: content.querySelector('#report-filter-department').value,
    university: content.querySelector('#report-filter-university').value,
    attachmentCycleId: content.querySelector('#report-filter-cycle').value,
    dateFrom: content.querySelector('#report-filter-date-from').value,
    dateTo: content.querySelector('#report-filter-date-to').value,
  };
}

export async function initialiseReports() {
  const content = document.querySelector('#reports-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading reports', message: 'Preparing the reporting workspace.' });

  try {
    const workspace = await loadReportsWorkspace();
    const fragment = document.createDocumentFragment();
    const introduction = document.createElement('section');
    introduction.setAttribute('aria-labelledby', 'reports-description');
    const description = document.createElement('p');
    description.id = 'reports-description';
    description.className = 'text-sm leading-6 text-slate-600';
    description.textContent = 'Review filtered student attachment records and prepare operational exports.';
    introduction.append(description);

    const summaryGrid = document.createElement('section');
    summaryGrid.className = 'mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-3';
    summaryGrid.setAttribute('aria-label', 'Report summary');
    const filters = document.createElement('section');
    filters.className = 'mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm print:hidden';
    filters.setAttribute('aria-labelledby', 'report-filters-heading');
    const filtersHeading = document.createElement('h2');
    filtersHeading.id = 'report-filters-heading';
    filtersHeading.className = 'text-base font-semibold text-slate-900';
    filtersHeading.textContent = 'Report Filters';
    const filtersDescription = document.createElement('p');
    filtersDescription.className = 'mt-1 text-sm leading-6 text-slate-600';
    filtersDescription.textContent = 'Filter by department, university, attachment cycle, or registration date.';
    const filterBar = createReportFilterBar({
      departments: workspace.departments,
      universities: uniqueUniversities(workspace.students),
      attachmentCycles: workspace.attachmentCycles,
    });
    filterBar.classList.add('mt-4');
    filters.append(filtersHeading, filtersDescription, filterBar);

    const results = document.createElement('section');
    results.className = 'mt-6';
    results.setAttribute('aria-labelledby', 'report-results-heading');
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden';
    const resultsHeading = document.createElement('h2');
    resultsHeading.id = 'report-results-heading';
    resultsHeading.className = 'text-base font-semibold text-slate-900';
    resultsHeading.textContent = 'Student Attachment Report';
    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap gap-3';
    actions.append(createActionButton({ label: 'Export CSV', action: 'export', primary: true }), createActionButton({ label: 'Print Report', action: 'print' }));
    resultsHeader.append(resultsHeading, actions);
    const printHeading = document.createElement('h2');
    printHeading.className = 'mb-3 hidden text-base font-semibold text-slate-900 print:block';
    printHeading.textContent = 'Student Attachment Report';
    const resultsTable = createReportResultsTable();
    results.append(resultsHeader, printHeading, resultsTable);
    fragment.append(introduction, summaryGrid, filters, results);
    content.replaceChildren(fragment);

    let filteredStudents = [];
    const renderReport = () => {
      filteredStudents = filterReportStudents(workspace.students, readFilters(content));
      const summary = createReportSummary(filteredStudents, workspace.activeAttachmentCycle);
      summaryGrid.replaceChildren(...SUMMARY_CARDS.map((card) => createSummaryCard({ ...card, value: summary[card.id] })));
      if (filteredStudents.length === 0) {
        renderReportResultsState(resultsTable, {
          type: 'empty',
          title: 'No students match the selected filters.',
          message: 'Adjust the report filters to view student records.',
        });
      } else {
        renderReportResults(resultsTable, { title: 'Student Attachment Report', columns: REPORT_COLUMNS, rows: filteredStudents });
      }
    };
    filterBar.addEventListener('change', renderReport);
    content.addEventListener('click', (event) => {
      const button = event.target.closest('[data-report-action]');
      if (!button || !content.contains(button)) return;
      if (button.dataset.reportAction === 'export') {
        exportCsv({ filename: 'ncarms-student-attachment-report.csv', columns: REPORT_COLUMNS, rows: filteredStudents });
      } else if (button.dataset.reportAction === 'print') {
        window.print();
      }
    });
    renderReport();
  } catch {
    renderPageState(content, { type: 'error', title: 'Reports unavailable', message: 'The reporting workspace could not be prepared. Please refresh the page.' });
  }
}
