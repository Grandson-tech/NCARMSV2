export function createDocumentEmptyState({ uploadHref = null } = {}) {
  const container = document.createElement('section');
  container.className = 'py-8 text-center';
  container.setAttribute('aria-labelledby', 'document-empty-state-title');

  const heading = document.createElement('h3');
  heading.id = 'document-empty-state-title';
  heading.className = 'text-sm font-medium text-slate-900';
  heading.textContent = 'No documents found';

  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-6 text-slate-500';
  description.textContent = 'Documents will appear here after they are uploaded.';

  const uploadButton = uploadHref ? document.createElement('a') : document.createElement('button');
  if (uploadHref) uploadButton.href = uploadHref;
  else {
    uploadButton.type = 'button';
    uploadButton.disabled = true;
  }
  uploadButton.className = uploadHref
    ? 'mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    : 'mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50';
  uploadButton.textContent = 'Upload Document';

  container.append(heading, description, uploadButton);
  return container;
}
