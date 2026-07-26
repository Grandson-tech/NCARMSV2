const TONES = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function showFormFeedback(element, message, tone = 'error') {
  element.className = `rounded-control border p-4 text-sm shadow-surface ${TONES[tone] ?? TONES.error}`;
  element.textContent = message;
  element.hidden = false;
}

export function clearFormFeedback(element) {
  element.textContent = '';
  element.hidden = true;
}
