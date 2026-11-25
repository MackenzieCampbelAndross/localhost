import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalHostStore } from '../src/core/localhost_store';

describe('useLocalHostStore', () => {
  it('manages service lifecycle: start, stop, restart', () => {
    const serviceId = useLocalHostStore.getState().services[0].id;

    useLocalHostStore.getState().stopService(serviceId);
    expect(useLocalHostStore.getState().services[0].status).toBe('STOPPED');

    useLocalHostStore.getState().startService(serviceId);
    expect(useLocalHostStore.getState().services[0].status).toBe('RUNNING');

    useLocalHostStore.getState().restartService(serviceId);
    expect(useLocalHostStore.getState().services[0].status).toBe('RUNNING');
  });

  it('adds and deletes custom proxy routes', () => {
    const count = useLocalHostStore.getState().proxyRoutes.length;
    const ok = useLocalHostStore.getState().addProxyRoute('custom.creston.test', 9000, true);

    expect(ok).toBe(true);
    expect(useLocalHostStore.getState().proxyRoutes.length).toBe(count + 1);

    const routeId = useLocalHostStore.getState().proxyRoutes[useLocalHostStore.getState().proxyRoutes.length - 1].id;
    useLocalHostStore.getState().deleteProxyRoute(routeId);
    expect(useLocalHostStore.getState().proxyRoutes.length).toBe(count);
  });

  it('updates environment variables for a service', () => {
    const serviceId = useLocalHostStore.getState().services[0].id;
    useLocalHostStore.getState().updateServiceEnv(serviceId, { NODE_ENV: 'test', PORT: '3000' });

    expect(useLocalHostStore.getState().services[0].envVars.NODE_ENV).toBe('test');
  });
});
