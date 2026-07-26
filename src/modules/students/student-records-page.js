import { initialiseAuthenticatedLayout } from '../../layout/authenticated-layout.js';
import { initialiseStudentRecords } from './student-records-controller.js';

async function initialiseStudentRecordsPage() {
  const isAuthenticated = await initialiseAuthenticatedLayout();
  if (isAuthenticated) await initialiseStudentRecords();
}

initialiseStudentRecordsPage().catch((error) => {
  console.error('NCARMS student records page could not be initialised.', error);
});
