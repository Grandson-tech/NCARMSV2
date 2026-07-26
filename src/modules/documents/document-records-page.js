import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseDocumentRecords } from './document-records-controller.js';

async function initialiseDocumentRecordsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseDocumentRecords();
}

initialiseDocumentRecordsPage().catch((error) => {
  console.error('NCARMS document records page could not be initialised.', error);
});
