import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseCreateStudent } from './create-student-controller.js';

async function initialiseCreateStudentPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseCreateStudent();
}

initialiseCreateStudentPage().catch((error) => {
  console.error('NCARMS create student page could not be initialised.', error);
});
