import { describe, it, expect } from 'vitest';
import { ProcessManager } from '../src/core/process_manager';
import { DevService } from '../src/types';

describe('ProcessManager', () => {
  const baseService: DevService = {
    id: 's-api',
    name: 'Backend API',
    type: 'BACKEND',
    port: 8000,
    targetUrl: 'http://localhost:8000',
    command: 'uvicorn main:app',
    workDir: '/',
    envVars: {},
    status: 'STOPPED',
    health: 'DOWN',
    cpuPercent: 0,
    memoryMb: 0,
    uptimeSeconds: 0,
    logs: []
  };

  it('starts services and sets PID, status, and initial logs', () => {
    const started = ProcessManager.startService(baseService);

    expect(started.status).toBe('RUNNING');
    expect(started.health).toBe('HEALTHY');
    expect(started.pid).toBeGreaterThan(0);
    expect(started.logs.length).toBeGreaterThan(0);
  });

  it('stops services gracefully', () => {
    const started = ProcessManager.startService(baseService);
    const stopped = ProcessManager.stopService(started);

    expect(stopped.status).toBe('STOPPED');
    expect(stopped.health).toBe('DOWN');
    expect(stopped.pid).toBeUndefined();
    expect(stopped.cpuPercent).toBe(0);
  });

  it('updates telemetry ticks for running services', () => {
    const started = ProcessManager.startService(baseService);
    const updated = ProcessManager.generateTelemetryTick(started);

    expect(updated.uptimeSeconds).toBe(started.uptimeSeconds + 1);
    expect(updated.cpuPercent).toBeGreaterThan(0);
    expect(updated.memoryMb).toBeGreaterThan(0);
  });
});
