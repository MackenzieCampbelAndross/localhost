import { DevService, ServiceStatus, HealthStatus } from '../types';

export class ProcessManager {
  /**
   * Start a development service and allocate PID.
   */
  static startService(service: DevService): DevService {
    const pid = Math.floor(2000 + Math.random() * 8000);
    const now = new Date().toLocaleTimeString();
    const startLog = `[${now}] [INFO] Starting ${service.name} with command "${service.command}" on port ${service.port}...`;
    const readyLog = `[${now}] [SUCCESS] Ready on http://localhost:${service.port} (PID: ${pid})`;

    return {
      ...service,
      status: 'RUNNING',
      health: 'HEALTHY',
      pid,
      uptimeSeconds: 1,
      cpuPercent: parseFloat((1.2 + Math.random() * 3.5).toFixed(1)),
      memoryMb: Math.floor(120 + Math.random() * 80),
      logs: [...service.logs, startLog, readyLog]
    };
  }

  /**
   * Terminate a running service.
   */
  static stopService(service: DevService): DevService {
    const now = new Date().toLocaleTimeString();
    const stopLog = `[${now}] [INFO] Process ${service.pid || ''} terminated gracefully. Service stopped.`;

    return {
      ...service,
      status: 'STOPPED',
      health: 'DOWN',
      pid: undefined,
      uptimeSeconds: 0,
      cpuPercent: 0,
      memoryMb: 0,
      logs: [...service.logs, stopLog]
    };
  }

  /**
   * Generate an incremental live log entry for a running service.
   */
  static generateTelemetryTick(service: DevService): DevService {
    if (service.status !== 'RUNNING') return service;

    const now = new Date().toLocaleTimeString();
    let newLog: string | null = null;

    if (Math.random() < 0.3) {
      if (service.type === 'FRONTEND') {
        newLog = `[${now}] [Vite] HMR update /src/App.tsx`;
      } else if (service.type === 'BACKEND') {
        const status = Math.random() < 0.95 ? 200 : 500;
        newLog = `[${now}] [HTTP] ${status} GET /api/v1/health - ${Math.floor(2 + Math.random() * 15)}ms`;
      } else if (service.type === 'DATABASE') {
        newLog = `[${now}] [Postgres] checkpoint complete: wrote 42 buffers (0.1%); 0 WAL file(s) added`;
      } else {
        newLog = `[${now}] [Worker] Job #${Math.floor(Math.random() * 1000)} executed successfully`;
      }
    }

    const cpuDelta = (Math.random() - 0.5) * 1.5;
    const newCpu = Math.max(0.5, Math.min(65, service.cpuPercent + cpuDelta));
    const newMemory = Math.max(80, Math.min(512, service.memoryMb + Math.floor((Math.random() - 0.5) * 4)));

    return {
      ...service,
      uptimeSeconds: service.uptimeSeconds + 1,
      cpuPercent: parseFloat(newCpu.toFixed(1)),
      memoryMb: newMemory,
      logs: newLog ? [...service.logs.slice(-100), newLog] : service.logs
    };
  }
}
