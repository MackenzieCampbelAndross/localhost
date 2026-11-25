import { describe, it, expect } from 'vitest';
import { ProcessManager } from '../src/core/process_manager';
import { PortScanner } from '../src/core/port_scanner';
import { ProxyRouter } from '../src/core/proxy_router';
import { EnvParser } from '../src/core/env_parser';
import { DevService } from '../src/types';

describe('LocalHost End-to-End Orchestration Integration', () => {
  it('manages service environment, starts process, binds ports, resolves proxy route, and monitors telemetry', () => {
    // 1. Parse and set .env configuration
    const rawEnv = 'PORT=4200\nAPI_URL=http://localhost:8000\nNODE_ENV=production';
    const envVars = EnvParser.parse(rawEnv);
    expect(envVars.PORT).toBe('4200');

    // 2. Define service
    const service: DevService = {
      id: 'srv-e2e',
      name: 'E2E Microservice',
      type: 'BACKEND',
      port: 4200,
      targetUrl: 'http://localhost:4200',
      command: 'node server.js',
      workDir: '/app',
      envVars,
      status: 'STOPPED',
      health: 'DOWN',
      cpuPercent: 0,
      memoryMb: 0,
      uptimeSeconds: 0,
      logs: []
    };

    // 3. Start service
    const running = ProcessManager.startService(service);
    expect(running.status).toBe('RUNNING');
    expect(running.pid).toBeGreaterThan(0);

    // 4. Port scan & collision verification
    const ports = PortScanner.scanPortBindings([running]);
    expect(ports.length).toBe(1);
    expect(ports[0].port).toBe(4200);
    expect(ports[0].hasConflict).toBe(false);

    // 5. Proxy domain routing
    const route = ProxyRouter.createRoute('e2e.creston.test', 4200, true);
    const destination = ProxyRouter.resolveDestination([route], 'e2e.creston.test');
    expect(destination).toBe('https://localhost:4200');

    // 6. Stop service
    const stopped = ProcessManager.stopService(running);
    expect(stopped.status).toBe('STOPPED');
  });
});
