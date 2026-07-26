import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseDashboard } from './dashboard-controller.js';

async function initialiseDashboardPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseDashboard();
}

initialiseDashboardPage().catch((error) => {
  console.error('NCARMS dashboard could not be initialised.', error);
});
