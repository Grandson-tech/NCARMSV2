import { NAVIGATION_ITEMS } from '../config/navigation.js';
import { BRANDING } from '../config/branding.js';
import { loadFragment } from '../shared/loader.js';

const ICONS = {
  home: '<svg class="h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m3 12 9-9 9 9v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" /></svg>',
  users: '<svg class="h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17-8a4 4 0 1 0 0-8m-3 10a4 4 0 0 1 3 3.87V21" /></svg>',
  chart: '<svg class="h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" /></svg>',
  settings: '<svg class="h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.4 2.4-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.1h-3.4v-.1a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.4-2.4.06-.06A1.7 1.7 0 0 0 6.04 15 1.7 1.7 0 0 0 4.5 13.96h-.1v-3.4h.1A1.7 1.7 0 0 0 6.04 9.52a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.4-2.4.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.02 4v-.1h3.4V4a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.4 2.4-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.1v3.4h-.1A1.7 1.7 0 0 0 19.4 15Z" /></svg>',
  logout: '<svg class="h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 17l5-5-5-5m5 5H3m8-8v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1" /></svg>',
};

function renderNavigation(activeItem) {
  const navigation = document.querySelector('#sidebar-navigation');
  const groups = [
    { label: 'Records', ids: ['dashboard', 'students', 'documents'] },
    { label: 'Operations', ids: ['reports'] },
    { label: 'Admin', ids: ['settings', 'logout'] },
  ];
  const renderItem = (item) => {
    const isActive = item.id === activeItem;
    const classes = isActive
      ? 'bg-white/[0.07] text-white shadow-none ring-1 ring-inset ring-white/[0.03]'
      : 'text-slate-300 hover:bg-white/[0.045] hover:text-white';
    const current = isActive ? ' aria-current="page"' : '';

    const action = item.action ? ` data-action="${item.action}"` : '';
    return `<li><a class="flex h-11 items-center gap-3 border-l-2 border-transparent px-3.5 text-sm font-medium tracking-[-0.005em] transition-all duration-200 ${isActive ? '!border-amber-500' : ''} ${classes}" href="${item.href}"${action}${current}>${ICONS[item.icon]}<span>${item.label}</span></a></li>`;
  };
  navigation.innerHTML = groups.map((group) => {
    const items = group.ids
      .map((id) => NAVIGATION_ITEMS.find((item) => item.id === id))
      .filter(Boolean)
      .map(renderItem)
      .join('');
    return `<li class="${group.label === 'Records' ? '' : 'mt-6'}"><p class="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">${group.label}</p><ul class="space-y-1">${items}</ul></li>`;
  }).join('');
}

function renderBreadcrumbs(breadcrumbs) {
  const list = document.querySelector('#breadcrumb-list');
  list.innerHTML = breadcrumbs.map((item, index) => {
    const isCurrent = index === breadcrumbs.length - 1;
    const separator = index ? '<span class="text-slate-400" aria-hidden="true">/</span>' : '';
    const value = isCurrent
      ? `<span class="truncate font-medium text-slate-700" aria-current="page">${item}</span>`
      : `<span class="truncate">${item}</span>`;
    return `<li class="flex min-w-0 items-center gap-2">${separator}${value}</li>`;
  }).join('');
}

function formatDashboardDate() {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
}

function initialiseDashboardHeaderMeta() {
  const date = document.querySelector('#dashboard-current-date');
  const status = document.querySelector('#dashboard-cycle-status');
  if (!date || !status) return;

  date.dateTime = new Date().toISOString().slice(0, 10);
  date.textContent = formatDashboardDate();

  const updateCycleStatus = () => {
    const currentCycle = document.querySelector('[data-summary-value="currentAttachmentCycle"]')?.textContent?.trim();
    if (!currentCycle || currentCycle === '—') return false;
    status.querySelector('[data-dashboard-cycle-name]').textContent = currentCycle;
    status.hidden = false;
    return true;
  };

  if (updateCycleStatus()) return;
  const observer = new MutationObserver(() => {
    if (updateCycleStatus()) observer.disconnect();
  });
  observer.observe(document.querySelector('#page-content'), { childList: true, subtree: true });
}

function initialiseInteractions() {
  const sidebar = document.querySelector('#app-sidebar');
  const toggle = document.querySelector('#sidebar-toggle');
  const overlay = document.querySelector('#sidebar-overlay');
  const profileToggle = document.querySelector('#profile-menu-toggle');
  const profileMenu = document.querySelector('#profile-menu');
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  const closeSidebar = () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openSidebar = () => {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const closeProfileMenu = () => {
    profileMenu.classList.add('hidden');
    profileToggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => (toggle.getAttribute('aria-expanded') === 'true' ? closeSidebar() : openSidebar()));
  overlay.addEventListener('click', closeSidebar);
  profileToggle.addEventListener('click', () => {
    profileMenu.classList.toggle('hidden');
    profileToggle.setAttribute('aria-expanded', String(!profileMenu.classList.contains('hidden')));
  });
  document.addEventListener('click', (event) => {
    if (!profileMenu.contains(event.target) && !profileToggle.contains(event.target)) closeProfileMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSidebar();
      closeProfileMenu();
    }
  });
  desktopQuery.addEventListener('change', () => {
    if (desktopQuery.matches) closeSidebar();
  });
}

export async function initialiseLayout() {
  const shell = document.querySelector('#app-shell');
  if (!shell) return;

  const pageContentTemplate = document.querySelector('#page-content-template');
  const title = shell.dataset.pageTitle || 'NCARMS';
  const isDashboard = shell.dataset.activeNavigation === 'dashboard';
  const breadcrumbs = (shell.dataset.breadcrumbs || title).split('|').map((item) => item.trim()).filter(Boolean);
  shell.innerHTML = `
    <div id="sidebar-slot" class="flex shrink-0 bg-slate-950"></div>
    <button id="sidebar-overlay" class="fixed inset-0 z-30 hidden bg-slate-900/50 lg:hidden" type="button" aria-label="Close navigation menu"></button>
    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <div id="topbar-slot"></div>
      <main class="flex-1 bg-workspace px-4 py-6 md:px-6 md:py-7 lg:px-8 lg:py-8" tabindex="-1">
        <div class="mx-auto w-full max-w-7xl">
          <div class="mb-7 md:mb-8">${isDashboard ? `<p class="mb-2 max-w-4xl text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">${BRANDING.departmentName}</p>` : ''}<h1 id="page-title" class="text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[2rem]"></h1>${isDashboard ? '<div id="dashboard-page-meta" class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2"><time id="dashboard-current-date" class="text-sm font-medium text-slate-500"></time><span class="hidden h-4 w-px bg-slate-300 sm:block" aria-hidden="true"></span><span id="dashboard-cycle-status" class="inline-flex items-center gap-1.5 rounded-control bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200" hidden><span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span><span data-dashboard-cycle-name></span><span aria-hidden="true">•</span><span>Active</span></span></div>' : ''}</div>
          <div id="page-content"></div>
        </div>
      </main>
      <div id="footer-slot" class="bg-white px-4 md:px-6"></div>
    </div>`;

  await Promise.all([
    loadFragment(document.querySelector('#sidebar-slot'), '../layouts/sidebar.html'),
    loadFragment(document.querySelector('#topbar-slot'), '../layouts/topbar.html'),
    loadFragment(document.querySelector('#footer-slot'), '../layouts/footer.html'),
  ]);

  document.title = `${title} | ${BRANDING.abbreviation} — ${BRANDING.departmentName}`;
  document.querySelector('#page-title').textContent = title;
  renderBreadcrumbs(breadcrumbs);
  renderNavigation(shell.dataset.activeNavigation);
  if (pageContentTemplate) {
    document.querySelector('#page-content').replaceChildren(pageContentTemplate.content.cloneNode(true));
  }
  if (isDashboard) initialiseDashboardHeaderMeta();
  initialiseInteractions();
}
