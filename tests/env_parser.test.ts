import { describe, it, expect } from 'vitest';
import { EnvParser } from '../src/core/env_parser';

describe('EnvParser', () => {
  it('parses raw .env string with quotes and comments', () => {
    const raw = `
# Core Database Config
DATABASE_URL="postgresql://user:pass@localhost:5432/creston"
PORT=3000
DEBUG=true
# Commented line
SECRET_KEY='my-secret-key-123'
`;
    const parsed = EnvParser.parse(raw);

    expect(parsed.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/creston');
    expect(parsed.PORT).toBe('3000');
    expect(parsed.DEBUG).toBe('true');
    expect(parsed.SECRET_KEY).toBe('my-secret-key-123');
  });

  it('serializes key-value pairs back to standard .env string', () => {
    const vars = {
      API_URL: 'http://localhost:8000',
      APP_NAME: 'Creston Local',
      TIMEOUT: '5000'
    };

    const serialized = EnvParser.serialize(vars);
    expect(serialized).toContain('API_URL=http://localhost:8000');
    expect(serialized).toContain('APP_NAME="Creston Local"'); // Has space, quoted
    expect(serialized).toContain('TIMEOUT=5000');
  });
});
