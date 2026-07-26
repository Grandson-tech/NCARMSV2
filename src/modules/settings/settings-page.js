import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseSettings } from './settings-controller.js';

async function initialiseSettingsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseSettings();
}

initialiseSettingsPage().catch((error) => {
  console.error('NCARMS settings page could not be initialised.', error);
});
