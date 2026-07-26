import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseUploadDocument } from './upload-document-controller.js';

async function initialiseUploadDocumentPage() {
  const isRegistrationCompletion = Boolean(new URLSearchParams(window.location.search).get('student'));
  if (isRegistrationCompletion) {
    const shell = document.querySelector('#app-shell');
    shell.dataset.pageTitle = 'Complete Student Registration';
    shell.dataset.breadcrumbs = 'Student Records|Complete Student Registration';
  }
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseUploadDocument();
}

initialiseUploadDocumentPage().catch((error) => {
  console.error('NCARMS upload document page could not be initialised.', error);
});
