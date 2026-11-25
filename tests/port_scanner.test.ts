import { describe, it, expect } from 'vitest';
import { PortScanner } from '../src/core/port_scanner';
import { DevService, PortBinding } from '../src/types';

describe('PortScanner', () => {
  const dummyServices: DevService[] = [
    {
      id: 's1',
      name: 'Web UI',
      type: 'FRONTEND',
      port: 3000,
      targetUrl: 'http://localhost:3000',
      command: 'npm run dev',
      workDir: '/',
      envVars: {},
      status: 'RUNNING',
      health: 'HEALTHY',
      pid: 1111,
      cpuPercent: 1.5,
      memoryMb: 120,
      uptimeSeconds: 100,
      logs: []
    }
  ];

  it('scans ports from active running services', () => {
    const bindings = PortScanner.scanPortBindings(dummyServices);
    expect(bindings.length).toBe(1);
    expect(bindings[0].port).toBe(3000);
    expect(bindings[0].pid).toBe(1111);
    expect(bindings[0].hasConflict).toBe(false);
  });

  it('detects port collisions and flags conflicting bindings', () => {
    const externalConflict: PortBinding = {
      port: 3000, // Conflict on port 3000!
      pid: 2222,
      processName: 'node.exe',
      hasConflict: false
    };

    const bindings = PortScanner.scanPortBindings(dummyServices, [externalConflict]);
    expect(bindings.length).toBe(2);

    const conflicts = PortScanner.identifyConflicts(bindings);
    expect(conflicts.length).toBe(2);
    expect(conflicts.every((c) => c.port === 3000)).toBe(true);
  });

  it('generates OS process kill commands accurately', () => {
    expect(PortScanner.generateKillCommand(4321, 'win32')).toBe('taskkill /PID 4321 /F');
    expect(PortScanner.generateKillCommand(4321, 'posix')).toBe('kill -9 4321');
  });
});
