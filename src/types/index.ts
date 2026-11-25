/**
 * Domain types and models for LocalHost (Local Development Environment Manager).
 */

export type ServiceType = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'CONTAINER' | 'WORKER';

export type ServiceStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'STARTING' | 'RESTARTING';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';

export interface DevService {
  id: string;
  name: string;
  type: ServiceType;
  port: number;
  targetUrl: string;
  localDomain?: string; // e.g. "api.creston.test"
  command: string;
  workDir: string;
  envVars: Record<string, string>;
  status: ServiceStatus;
  health: HealthStatus;
  pid?: number;
  cpuPercent: number; // 0 to 100
  memoryMb: number;
  uptimeSeconds: number;
  logs: string[];
}

export interface PortBinding {
  port: number;
  pid: number;
  processName: string;
  serviceId?: string;
  hasConflict: boolean;
}

export interface ProxyRoute {
  id: string;
  localDomain: string; // e.g. "app.creston.test"
  targetPort: number;
  sslEnabled: boolean;
  certStatus: 'VALID' | 'SELF_SIGNED' | 'EXPIRED';
  createdAt: number;
}
