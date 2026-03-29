import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  safeJsonParse,
  safeJsonStringify,
  generateRequestId,
  generateSessionId,
  generateShortId,
  isValidRequestId,
  isValidSessionId,
} from '../src/utils/index.js';

describe('Utilities - safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const json = '{"name": "test", "value": 123}';
    const result = safeJsonParse<{ name: string; value: number }>(json);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('test');
      expect(result.value.value).toBe(123);
    }
  });

  it('should handle invalid JSON', () => {
    const json = '{invalid json}';
    const result = safeJsonParse(json);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('JSON parse failed');
    }
  });

  it('should parse arrays', () => {
    const json = '[1, 2, 3, 4, 5]';
    const result = safeJsonParse<number[]>(json);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(5);
      expect(result.value[0]).toBe(1);
    }
  });

  it('should parse null', () => {
    const json = 'null';
    const result = safeJsonParse(json);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });
});

describe('Utilities - safeJsonStringify', () => {
  it('should stringify object', () => {
    const obj = { name: 'test', value: 123 };
    const result = safeJsonStringify(obj);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"name":"test","value":123}');
    }
  });

  it('should stringify with pretty print', () => {
    const obj = { name: 'test' };
    const result = safeJsonStringify(obj, true);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('\n');
      expect(result.value).toContain('  "name"');
    }
  });

  it('should handle circular references', () => {
    const obj: any = { name: 'test' };
    obj.self = obj; // Circular reference

    const result = safeJsonStringify(obj);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('JSON stringify failed');
    }
  });
});

describe('Utilities - ID Generation', () => {
  describe('generateRequestId', () => {
    it('should generate valid request ID', () => {
      const id = generateRequestId();

      expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
      expect(id.startsWith('req_')).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
    });

    it('should be valid according to validator', () => {
      const id = generateRequestId();
      expect(isValidRequestId(id)).toBe(true);
    });
  });

  describe('generateSessionId', () => {
    it('should generate valid session ID', () => {
      const id = generateSessionId();

      expect(id).toMatch(/^sess_[a-z0-9]+_[a-z0-9]+$/);
      expect(id.startsWith('sess_')).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).not.toBe(id2);
    });

    it('should be valid according to validator', () => {
      const id = generateSessionId();
      expect(isValidSessionId(id)).toBe(true);
    });
  });

  describe('generateShortId', () => {
    it('should generate ID of specified length', () => {
      const id = generateShortId(12);
      expect(id).toHaveLength(12);
    });

    it('should generate ID with default length', () => {
      const id = generateShortId();
      expect(id).toHaveLength(8);
    });

    it('should only contain lowercase alphanumeric', () => {
      const id = generateShortId(20);
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateShortId();
      const id2 = generateShortId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('ID Validators', () => {
    it('should validate correct request ID', () => {
      expect(isValidRequestId('req_abc123_def456')).toBe(true);
    });

    it('should reject invalid request ID', () => {
      expect(isValidRequestId('invalid')).toBe(false);
      expect(isValidRequestId('sess_abc123_def456')).toBe(false);
      expect(isValidRequestId('req_ABC_DEF')).toBe(false); // uppercase not allowed
    });

    it('should validate correct session ID', () => {
      expect(isValidSessionId('sess_abc123_def456')).toBe(true);
    });

    it('should reject invalid session ID', () => {
      expect(isValidSessionId('invalid')).toBe(false);
      expect(isValidSessionId('req_abc123_def456')).toBe(false);
      expect(isValidSessionId('sess_ABC_DEF')).toBe(false); // uppercase not allowed
    });
  });
});

describe('Utilities - Environment', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should export env utilities', async () => {
    const { getEnvVar, isProduction, isDevelopment, isTest } = await import(
      '../src/utils/env.js'
    );

    expect(typeof getEnvVar).toBe('function');
    expect(typeof isProduction).toBe('function');
    expect(typeof isDevelopment).toBe('function');
    expect(typeof isTest).toBe('function');
  });

  it('should detect test environment', async () => {
    const { isTest } = await import('../src/utils/env.js');
    expect(isTest()).toBe(true);
  });

  it('should get environment variable with default', async () => {
    const { getEnvVar } = await import('../src/utils/env.js');

    process.env.TEST_VAR = 'test-value';
    expect(getEnvVar('TEST_VAR')).toBe('test-value');

    expect(getEnvVar('NON_EXISTENT_VAR', 'default')).toBe('default');
  });
});
