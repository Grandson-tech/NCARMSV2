import { getCachedStaffProfile } from '../../auth/staff-access.js';
import { createDashboardDepartmentList } from '../../components/dashboard-department-list.js';
import { createDashboardListDialog } from '../../components/dashboard-list-dialog.js';
import { createDashboardQuickActions } from '../../components/dashboard-quick-actions.js';
import { createDashboardRecentRegistrations } from '../../components/dashboard-recent-registrations.js';
import { createDashboardWelcomeToast } from '../../components/dashboard-welcome-toast.js';
import { createPageState, renderPageState } from '../../components/page-state.js';
import { createSummaryCard } from '../../components/summary-card.js';
import { loadDashboardStatistics } from './dashboard-service.js';

const SUMMARY_CARD_STRUCTURE = Object.freeze([
  { id: 'totalStudents', title: 'Total Students', description: 'Registered attachment students.', action: 'students', icon: 'students' },
  { id: 'departmentCount', title: 'Departments', description: 'Registered county departments.', action: 'departments', icon: 'departments' },
  { id: 'universityCount', title: 'Universities Represented', description: 'Unique universities from student records.', action: 'universities', icon: 'university' },
  { id: 'currentAttachmentCycle', title: 'Current Active Cycle', description: 'The normalized cycle currently active for student registration.', icon: 'calendar' },
]);

function formatStatistic(value) {
  return typeof value === 'number' ? new Intl.NumberFormat('en-KE').format(value) : value;
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function createDashboardSection({ id, title, description, content, className = '' }) {
  const section = document.createElement('section');
  section.className = `rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6 ${className}`.trim();
  section.setAttribute('aria-labelledby', id);
  const heading = document.createElement('h2');
  heading.id = id;
  heading.className = 'text-lg font-semibold text-slate-900';
  heading.textContent = title;
  const supportingText = document.createElement('p');
  supportingText.className = 'mt-1 text-sm leading-6 text-slate-600';
  supportingText.textContent = description;
  section.append(heading, supportingText, content);
  return section;
}

function initialiseToast(toast, dismissButton) {
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.classList.add('opacity-0');
    window.setTimeout(() => toast.remove(), 300);
  };
  dismissButton.addEventListener('click', dismiss);
  window.setTimeout(dismiss, 8000);
}

function initialiseDialog(dialog, closeButton) {
  let trigger = null;
  const close = () => {
    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    trigger?.focus();
  };
  const open = (source) => {
    trigger = source;
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    closeButton.focus();
  };
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  closeButton.addEventListener('click', close);
  return { open };
}

function activateElement(element) {
  return element && (element.tagName !== 'TR' || element.dataset.studentDetailsId);
}

export async function initialiseDashboard() {
  const content = document.querySelector('#dashboard-content');
  if (!content) return;
  renderPageState(content, { type: 'loading', title: 'Loading dashboard', message: 'Preparing your workspace.' });

  try {
    const [profile, statistics] = await Promise.all([getCachedStaffProfile(), loadDashboardStatistics()]);
    const fragment = document.createDocumentFragment();
    const { toast, dismiss } = createDashboardWelcomeToast({
      greeting: getGreeting(),
      profile,
      currentDate: formatCurrentDate(),
      message: `There are currently ${formatStatistic(statistics.totalStudents)} registered attachment students across ${formatStatistic(statistics.departmentCount)} departments.`,
    });
    fragment.append(toast);

    const overview = document.createElement('section');
    overview.setAttribute('aria-labelledby', 'dashboard-overview-title');
    const heading = document.createElement('h2');
    heading.id = 'dashboard-overview-title';
    heading.className = 'text-lg font-semibold text-slate-900';
    heading.textContent = 'Overview';
    const description = document.createElement('p');
    description.className = 'mt-1 text-sm leading-6 text-slate-600';
    description.textContent = 'Live operational information from registered students, departments, and the configured active attachment cycle.';
    const grid = document.createElement('div');
    grid.className = 'mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4';
    SUMMARY_CARD_STRUCTURE.forEach((card) => grid.append(createSummaryCard({ ...card, value: formatStatistic(statistics[card.id]) })));
    overview.append(heading, description, grid);
    if (!statistics.hasActiveAttachmentCycle) {
      const cycleEmptyState = createPageState({
        type: 'empty',
        title: 'No active attachment cycle',
        message: 'Create and activate an attachment cycle in Settings before registering new students.',
      });
      cycleEmptyState.classList.add('mt-4');
      overview.append(cycleEmptyState);
    }

    const departmentSection = createDashboardSection({
      id: 'dashboard-departments-title',
      title: 'Students by Department',
      description: 'Registered students in each county department.',
      content: createDashboardDepartmentList(statistics.departments),
      className: 'mt-6',
    });
    const recentSection = createDashboardSection({
      id: 'dashboard-recent-registrations-title',
      title: 'Recent Registrations',
      description: 'The five most recently created student records.',
      content: createDashboardRecentRegistrations(statistics.recentStudents),
      className: 'mt-6',
    });
    const quickActions = createDashboardSection({
      id: 'dashboard-quick-actions-title',
      title: 'Quick Actions',
      description: 'Common NCARMS tasks for ICT and HR officers.',
      content: createDashboardQuickActions(),
      className: 'mt-6',
    });
    fragment.append(overview, departmentSection, recentSection, quickActions);
    content.replaceChildren(fragment);
    initialiseToast(toast, dismiss);

    const departmentDialog = createDashboardListDialog({
      id: 'dashboard-department-dialog',
      title: 'Departments',
      items: statistics.departments.map(({ name }) => ({ name })),
    });
    const universityDialog = createDashboardListDialog({
      id: 'dashboard-university-dialog',
      title: 'Universities Represented',
      items: statistics.universities,
      showCount: true,
    });
    const departmentModal = initialiseDialog(departmentDialog.dialog, departmentDialog.close);
    const universityModal = initialiseDialog(universityDialog.dialog, universityDialog.close);

    const handleDashboardAction = (element) => {
      if (!activateElement(element)) return;
      if (element.dataset.dashboardAction === 'students') {
        window.location.assign('student-records.html');
      } else if (element.dataset.dashboardAction === 'departments') {
        departmentModal.open(element);
      } else if (element.dataset.dashboardAction === 'universities') {
        universityModal.open(element);
      } else if (element.dataset.studentDetailsId) {
        window.location.assign(`student-details.html?id=${encodeURIComponent(element.dataset.studentDetailsId)}`);
      }
    };
    content.addEventListener('click', (event) => {
      handleDashboardAction(event.target.closest('[data-dashboard-action], [data-student-details-id]'));
    });
    content.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const element = event.target.closest('[data-dashboard-action], [data-student-details-id]');
      if (!activateElement(element)) return;
      event.preventDefault();
      handleDashboardAction(element);
    });
  } catch {
    content.replaceChildren(createPageState({
      type: 'error',
      title: 'Dashboard unavailable',
      message: 'Your workspace could not be prepared. Please refresh the page or sign in again.',
    }));
  }
}
