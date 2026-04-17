export const CONTACT_EMAIL = 'contact@kimuntu.ai';

export function buildSupportMailto({ name, email, subject, message }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanSubject = (subject || '').trim() || 'Support request';
  const cleanMessage = (message || '').trim();

  const body = [
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    '',
    'Message:',
    cleanMessage,
  ].join('\n');

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Kimuntu Support] ${cleanSubject}`)}&body=${encodeURIComponent(body)}`;
}
