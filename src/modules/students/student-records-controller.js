import { createFilterBar, setFilterOptions } from '../../components/filter-bar.js';
import { createPagination, setPaginationSummary } from '../../components/pagination.js';
import { renderPageState } from '../../components/page-state.js';
import { createSearchBar } from '../../components/search-bar.js';
import { initialiseArchiveStudentController } from './archive-student-controller.js';
import { createStudentTable, renderStudentRows, renderStudentTableNoMatches, renderStudentTableState } from '../../components/student-table.js';
import { filterStudentRecords, loadStudentRecordFilterOptions, loadStudentRecords } from './student-records-service.js';

const FILTER_STORAGE_KEY = 'ncarms.student-records.filters';
const FILTERS = Object.freeze([
  { id: 'student-filter-department', label: 'Department', allLabel: 'All Departments' },
  { id: 'student-filter-university', label: 'University', allLabel: 'All Universities' },
  { id: 'student-filter-cycle', label: 'Attachment Cycle', allLabel: 'All Attachment Cycles' },
  { id: 'student-filter-archived', label: 'Archived Status', allLabel: 'All Students' },
]);

function emptyFilters() {
  return { search: '', departmentId: '', university: '', attachmentCycleId: '', archived: 'all' };
}

function readStoredFilters() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(FILTER_STORAGE_KEY));
    return { ...emptyFilters(), ...(stored && typeof stored === 'object' ? stored : {}) };
  } catch {
    return emptyFilters();
  }
}

function persistFilters(filters) {
  window.sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
}

function uniqueUniversityOptions(students) {
  return [...new Set(students.map((student) => String(student.university ?? '').trim()).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second))
    .map((university) => ({ value: university, label: university }));
}

function setControlValues(content, filters) {
  content.querySelector('#student-record-search').value = filters.search;
  content.querySelector('#student-filter-department').value = filters.departmentId;
  content.querySelector('#student-filter-university').value = filters.university;
  content.querySelector('#student-filter-cycle').value = filters.attachmentCycleId;
  content.querySelector('#student-filter-archived').value = filters.archived;
}

function applyDashboardDepartmentFilter(filters, departmentOptions) {
  const departmentId = new URLSearchParams(window.location.search).get('department');
  if (departmentId && departmentOptions.some((option) => option.value === departmentId)) filters.departmentId = departmentId;
}

function validateFilterValues(filters, options, universities) {
  if (!options.departments.some((option) => option.value === filters.departmentId)) filters.departmentId = '';
  if (!options.attachmentCycles.some((option) => option.value === filters.attachmentCycleId)) filters.attachmentCycleId = '';
  if (!universities.some((option) => option.value === filters.university)) filters.university = '';
  if (!['all', 'active', 'archived'].includes(filters.archived)) filters.archived = 'all';
}

export async function initialiseStudentRecords() {
  const content = document.querySelector('#student-records-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading student records', message: 'Preparing the records workspace.' });

  try {
    const fragment = document.createDocumentFragment();
    const introduction = document.createElement('section');
    introduction.setAttribute('aria-labelledby', 'student-records-description');
    const description = document.createElement('p');
    description.id = 'student-records-description';
    description.className = 'text-sm leading-6 text-slate-600';
    description.textContent = 'Manage and maintain student attachment records.';
    introduction.append(description);

    const controls = document.createElement('section');
    controls.className = 'mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
    controls.setAttribute('aria-label', 'Student record search and filters');
    const controlsHeader = document.createElement('div');
    controlsHeader.className = 'mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';
    const createLink = document.createElement('a');
    createLink.href = 'create-student.html';
    createLink.className = 'inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    createLink.textContent = 'Add Student';
    controlsHeader.append(createLink);
    const filterBar = createFilterBar(FILTERS);
    filterBar.classList.add('mt-3');
    controls.append(controlsHeader, createSearchBar({ id: 'student-record-search', label: 'Search student records', placeholder: 'Search by student name or student number...' }), filterBar);

    const recordsSection = document.createElement('section');
    recordsSection.className = 'mt-6';
    recordsSection.setAttribute('aria-label', 'Student records table');
    const recordCounter = document.createElement('p');
    recordCounter.className = 'mb-3 text-sm text-slate-600';
    recordCounter.setAttribute('aria-live', 'polite');
    const table = createStudentTable();
    const pagination = createPagination({ showSummary: false });
    recordsSection.append(recordCounter, table, pagination);
    fragment.append(introduction, controls, recordsSection);
    content.replaceChildren(fragment);

    const tableBody = content.querySelector('#student-records-table-body');
    renderStudentTableState(tableBody, 'loading');
    const [students, options] = await Promise.all([loadStudentRecords(), loadStudentRecordFilterOptions()]);
    const filters = readStoredFilters();
    applyDashboardDepartmentFilter(filters, options.departments);
    setFilterOptions(content.querySelector('#student-filter-department'), options.departments);
    const universityOptions = uniqueUniversityOptions(students);
    setFilterOptions(content.querySelector('#student-filter-university'), universityOptions);
    setFilterOptions(content.querySelector('#student-filter-cycle'), options.attachmentCycles);
    setFilterOptions(content.querySelector('#student-filter-archived'), [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ]);
    validateFilterValues(filters, options, universityOptions);
    setControlValues(content, filters);

    const renderRecords = () => {
      const filteredStudents = filterStudentRecords(students, filters);
      setPaginationSummary(pagination, { shown: filteredStudents.length, total: students.length });
      recordCounter.textContent = `Showing ${filteredStudents.length} of ${students.length} students`;
      if (students.length === 0) renderStudentTableState(tableBody, 'empty');
      else if (filteredStudents.length === 0) renderStudentTableNoMatches(tableBody, clearFilters);
      else renderStudentRows(tableBody, filteredStudents);
    };
    const clearFilters = () => {
      Object.assign(filters, emptyFilters());
      setControlValues(content, filters);
      persistFilters(filters);
      renderRecords();
      content.querySelector('#student-record-search').focus();
    };
    const updateFilters = () => {
      filters.search = content.querySelector('#student-record-search').value;
      filters.departmentId = content.querySelector('#student-filter-department').value;
      filters.university = content.querySelector('#student-filter-university').value;
      filters.attachmentCycleId = content.querySelector('#student-filter-cycle').value;
      filters.archived = content.querySelector('#student-filter-archived').value || 'all';
      persistFilters(filters);
      renderRecords();
    };
    let searchTimer;
    content.querySelector('#student-record-search').addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(updateFilters, 250);
    });
    FILTERS.forEach(({ id }) => content.querySelector(`#${id}`).addEventListener('change', updateFilters));
    initialiseArchiveStudentController({
      root: content,
      onSuccess: async () => {
        const refreshedStudents = await loadStudentRecords();
        students.splice(0, students.length, ...refreshedStudents);
        renderRecords();
      },
    });
    persistFilters(filters);
    renderRecords();
  } catch {
    renderPageState(content, { type: 'error', title: 'Student records unavailable', message: 'The student records workspace could not be prepared. Please refresh the page.' });
  }
}
