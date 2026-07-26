import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseEditStudent } from './edit-student-controller.js';

async function initialiseEditStudentPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseEditStudent();
}

initialiseEditStudentPage().catch((error) => {
  console.error('NCARMS edit student page could not be initialised.', error);
});
