import { PortBinding, DevService } from '../types';

export class PortScanner {
  /**
   * Scan listening ports across services and background processes.
   */
  static scanPortBindings(services: DevService[], simulatedSystemBindings?: PortBinding[]): PortBinding[] {
    const bindings: PortBinding[] = [];

    // Map registered running services
    for (const service of services) {
      if (service.status === 'RUNNING' && service.port > 0) {
        bindings.push({
          port: service.port,
          pid: service.pid || Math.floor(1000 + Math.random() * 9000),
          processName: `${service.name.toLowerCase().replace(/\s+/g, '_')}.exe`,
          serviceId: service.id,
          hasConflict: false
        });
      }
    }

    // Merge system bindings (or mock external conflicts)
    if (simulatedSystemBindings) {
      bindings.push(...simulatedSystemBindings);
    }

    // Detect port collisions
    const portCount = new Map<number, number>();
    for (const b of bindings) {
      portCount.set(b.port, (portCount.get(b.port) || 0) + 1);
    }

    return bindings.map((b) => ({
      ...b,
      hasConflict: (portCount.get(b.port) || 0) > 1
    }));
  }

  /**
   * Identify all active port collisions.
   */
  static identifyConflicts(bindings: PortBinding[]): PortBinding[] {
    return bindings.filter((b) => b.hasConflict);
  }

  /**
   * Format OS kill command for terminal execution (Windows / Unix).
   */
  static generateKillCommand(pid: number, platform: 'win32' | 'posix' = 'win32'): string {
    if (platform === 'win32') {
      return `taskkill /PID ${pid} /F`;
    }
    return `kill -9 ${pid}`;
  }
}
