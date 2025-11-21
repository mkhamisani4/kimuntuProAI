/**
 * ID generation utilities
 * Uses timestamp + random for request IDs
 */

/**
 * Generate a unique request ID
 * Format: req_<timestamp>_<random>
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Generate a unique session ID
 * Format: sess_<timestamp>_<random>
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `sess_${timestamp}_${random}`;
}

/**
 * Generate a short random ID
 * @param length - Length of random string (default: 8)
 */
export function generateShortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate request ID format
 */
export function isValidRequestId(id: string): boolean {
  return /^req_[a-z0-9]+_[a-z0-9]+$/.test(id);
}

/**
 * Validate session ID format
 */
export function isValidSessionId(id: string): boolean {
  return /^sess_[a-z0-9]+_[a-z0-9]+$/.test(id);
}
