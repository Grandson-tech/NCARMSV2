export function createDocumentPreview({ previewUrl, mimeType, fileName }) {
  const container = document.createElement('div');
  container.className = 'overflow-hidden rounded-md border border-slate-200 bg-slate-50';
  const canPreviewImage = Boolean(previewUrl && mimeType?.startsWith('image/'));
  const canPreviewPdf = Boolean(previewUrl && mimeType === 'application/pdf');

  if (canPreviewImage) {
    const image = document.createElement('img');
    image.src = previewUrl;
    image.alt = `Preview of ${fileName || 'document'}`;
    image.className = 'max-h-[32rem] w-full object-contain';
    container.append(image);
    return container;
  }

  if (canPreviewPdf) {
    const frame = document.createElement('iframe');
    frame.src = previewUrl;
    frame.title = `Preview of ${fileName || 'document'}`;
    frame.className = 'h-[32rem] w-full bg-white';
    container.append(frame);
    return container;
  }

  const placeholder = document.createElement('p');
  placeholder.className = 'p-4 text-sm leading-6 text-slate-600';
  placeholder.textContent = 'Preview is not available for this document type.';
  container.append(placeholder);
  return container;
}
