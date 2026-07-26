import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseReports } from './reports-controller.js';

async function initialiseReportsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseReports();
}

initialiseReportsPage().catch((error) => {
  console.error('NCARMS reports page could not be initialised.', error);
});
