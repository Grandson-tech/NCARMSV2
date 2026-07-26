function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function createStoragePath(prefix, fileName) {
  return `${prefix}/${crypto.randomUUID()}-${safeFileName(fileName)}`;
}

export function createDocumentStoragePath(studentId, fileName) {
  return createStoragePath(`students/${studentId}`, fileName);
}

export function createPassportPhotoStoragePath(fileName) {
  return createStoragePath('passport-photos', fileName);
}
