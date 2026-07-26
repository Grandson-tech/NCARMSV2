import { initialiseAuthenticatedPage } from '../auth/authenticated-page.js';
import { initialiseLayout } from './layout.js';

let initialisationPromise;

export function initialiseAuthenticatedLayout() {
  if (initialisationPromise) return initialisationPromise;

  initialisationPromise = (async () => {
    if (!await initialiseAuthenticatedPage()) return false;
  await initialiseLayout();
    return true;
  })();

  return initialisationPromise;
}

initialiseAuthenticatedLayout().catch((error) => {
  console.error('NCARMS authenticated layout could not be initialised.', error);
});
