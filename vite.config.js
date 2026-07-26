import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        passwordResetRequest: resolve(__dirname, 'pages/reset-password-request.html'),
        passwordReset: resolve(__dirname, 'pages/reset-password.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        studentRecords: resolve(__dirname, 'pages/student-records.html'),
        studentProfile: resolve(__dirname, 'pages/student-profile.html'),
        studentDetails: resolve(__dirname, 'pages/student-details.html'),
        createStudent: resolve(__dirname, 'pages/create-student.html'),
        editStudent: resolve(__dirname, 'pages/edit-student.html'),
        documents: resolve(__dirname, 'pages/documents.html'),
        documentDetails: resolve(__dirname, 'pages/document-details.html'),
        uploadDocument: resolve(__dirname, 'pages/upload-document.html'),
        reports: resolve(__dirname, 'pages/reports.html'),
        settings: resolve(__dirname, 'pages/settings.html'),
      },
    },
  },
});
