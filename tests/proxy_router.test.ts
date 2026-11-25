import { describe, it, expect } from 'vitest';
import { ProxyRouter } from '../src/core/proxy_router';

describe('ProxyRouter', () => {
  it('validates local domain naming conventions', () => {
    expect(ProxyRouter.isValidLocalDomain('app.creston.test')).toBe(true);
    expect(ProxyRouter.isValidLocalDomain('api.creston.local')).toBe(true);
    expect(ProxyRouter.isValidLocalDomain('auth.localhost')).toBe(true);

    expect(ProxyRouter.isValidLocalDomain('google.com')).toBe(false);
    expect(ProxyRouter.isValidLocalDomain('invalid_domain_name')).toBe(false);
  });

  it('creates routes and resolves destination URLs', () => {
    const route = ProxyRouter.createRoute('api.creston.test', 8000, true);
    expect(route.localDomain).toBe('api.creston.test');
    expect(route.targetPort).toBe(8000);
    expect(route.certStatus).toBe('VALID');

    const destination = ProxyRouter.resolveDestination([route], 'api.creston.test');
    expect(destination).toBe('https://localhost:8000');
  });
});
