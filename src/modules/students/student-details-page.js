import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseStudentDetails } from './student-details-controller.js';

async function initialiseStudentDetailsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseStudentDetails();
}

initialiseStudentDetailsPage().catch((error) => {
  console.error('NCARMS student details page could not be initialised.', error);
});
