export const NOTIFICATIONS = [
  { id: 0, type: 'warning', msg: 'High AI usage detected',        detail: 'AI request volume exceeded 150k/day threshold. Consider scaling compute resources.', time: '2 minutes ago' },
  { id: 1, type: 'error',   msg: 'Payment failed for user #12345', detail: 'Stripe charge declined (insufficient funds). User notified via email automatically.', time: '15 minutes ago' },
  { id: 2, type: 'info',    msg: 'New user registration spike',    detail: '3x normal signup rate observed in the last hour. Traffic source: organic search.', time: '1 hour ago' },
  { id: 3, type: 'warning', msg: 'AI service latency high',        detail: 'p95 latency for the AI Chatbot assistant is 4.2 s (normal < 1.5 s). Investigating.', time: '2 hours ago' },
  { id: 4, type: 'success', msg: 'Database backup completed',      detail: 'Full Firestore snapshot saved to Cloud Storage. Retention: 30 days.', time: '3 hours ago' },
];
