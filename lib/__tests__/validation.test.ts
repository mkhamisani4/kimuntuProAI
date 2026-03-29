/**
 * Tests for Input Validation Functions
 * Tests the validation helpers used in wizard steps
 */

// Email validation (from Step5ContactSocial)
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation (from Step5ContactSocial)
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

describe('isValidEmail', () => {
  it('should accept valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@company.co.uk')).toBe(true);
    expect(isValidEmail('hello+tag@domain.org')).toBe(true);
    expect(isValidEmail('info@sub.domain.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
    expect(isValidEmail('test@example')).toBe(false);
  });

  it('should accept empty string (optional field)', () => {
    expect(isValidEmail('')).toBe(true);
  });

  it('should handle edge cases', () => {
    expect(isValidEmail('a@b.c')).toBe(true); // Minimum valid email
    expect(isValidEmail('test@localhost.localdomain')).toBe(true);
  });
});

describe('isValidUrl', () => {
  it('should accept valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://www.example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    expect(isValidUrl('https://example.com:8080/path')).toBe(true);
  });

  it('should accept social media URLs', () => {
    expect(isValidUrl('https://instagram.com/username')).toBe(true);
    expect(isValidUrl('https://linkedin.com/company/name')).toBe(true);
    expect(isValidUrl('https://twitter.com/handle')).toBe(true);
    expect(isValidUrl('https://facebook.com/page')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false); // Missing protocol
    expect(isValidUrl('www.example.com')).toBe(false); // Missing protocol
    expect(isValidUrl('ht!tp://example.com')).toBe(false); // Invalid protocol
    expect(isValidUrl('://example.com')).toBe(false); // Missing protocol name
  });

  it('should accept empty string (optional field)', () => {
    expect(isValidUrl('')).toBe(true);
  });

  it('should handle URLs with special characters', () => {
    expect(isValidUrl('https://example.com/path%20with%20spaces')).toBe(true);
    expect(isValidUrl('https://example.com/path#anchor')).toBe(true);
  });

  it('should accept localhost URLs', () => {
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('http://127.0.0.1:8080')).toBe(true);
  });
});

describe('Combined validation scenarios', () => {
  it('should validate contact form data', () => {
    const contactData = {
      email: 'contact@company.com',
      instagram: 'https://instagram.com/company',
      linkedin: 'https://linkedin.com/company/name',
    };

    expect(isValidEmail(contactData.email)).toBe(true);
    expect(isValidUrl(contactData.instagram)).toBe(true);
    expect(isValidUrl(contactData.linkedin)).toBe(true);
  });

  it('should reject invalid contact form data', () => {
    const invalidData = {
      email: 'invalid email',
      instagram: 'instagram.com/company', // Missing protocol
      linkedin: 'not a url',
    };

    expect(isValidEmail(invalidData.email)).toBe(false);
    expect(isValidUrl(invalidData.instagram)).toBe(false);
    expect(isValidUrl(invalidData.linkedin)).toBe(false);
  });

  it('should accept optional fields being empty', () => {
    const emptyData = {
      email: '',
      instagram: '',
      linkedin: '',
    };

    expect(isValidEmail(emptyData.email)).toBe(true);
    expect(isValidUrl(emptyData.instagram)).toBe(true);
    expect(isValidUrl(emptyData.linkedin)).toBe(true);
  });
});
