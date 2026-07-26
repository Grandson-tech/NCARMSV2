import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseDocumentDetails } from './document-details-controller.js';

async function initialiseDocumentDetailsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseDocumentDetails();
}

initialiseDocumentDetailsPage().catch((error) => {
  console.error('NCARMS document details page could not be initialised.', error);
});
