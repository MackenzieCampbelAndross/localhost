import { create } from 'zustand';
import { DevService, PortBinding, ProxyRoute, ServiceType } from '../types';
import { ProcessManager } from './process_manager';
import { PortScanner } from './port_scanner';
import { ProxyRouter } from './proxy_router';

interface LocalHostStore {
  services: DevService[];
  portBindings: PortBinding[];
  proxyRoutes: ProxyRoute[];
  selectedServiceId: string | null;

  // Actions
  setSelectedServiceId: (id: string | null) => void;
  startService: (id: string) => void;
  stopService: (id: string) => void;
  restartService: (id: string) => void;
  startAllServices: () => void;
  stopAllServices: () => void;
  scanPorts: () => void;
  killProcess: (pid: number) => void;
  updateServiceEnv: (id: string, envVars: Record<string, string>) => void;
  addService: (data: {
    name: string;
    type: ServiceType;
    port: number;
    command: string;
    workDir: string;
    envVars?: Record<string, string>;
  }) => void;
  deleteService: (id: string) => void;
  addProxyRoute: (domain: string, targetPort: number, ssl?: boolean) => boolean;
  deleteProxyRoute: (id: string) => void;
  tickTelemetry: () => void;
}

const INITIAL_SERVICES: DevService[] = [
  {
    id: 'srv-web',
    name: 'Creston Web UI',
    type: 'FRONTEND',
    port: 3000,
    targetUrl: 'http://localhost:3000',
    localDomain: 'app.creston.test',
    command: 'npm run dev',
    workDir: '/frontend',
    envVars: {
      VITE_API_URL: 'http://localhost:8000',
      PORT: '3000',
      NODE_ENV: 'development'
    },
    status: 'RUNNING',
    health: 'HEALTHY',
    pid: 4120,
    cpuPercent: 2.4,
    memoryMb: 142,
    uptimeSeconds: 840,
    logs: [
      '[10:00:00 AM] [INFO] Starting Creston Web UI with command "npm run dev"...',
      '[10:00:02 AM] [SUCCESS] Ready on http://localhost:3000 (PID: 4120)',
      '[10:00:15 AM] [Vite] 12 modules transformed in 420ms'
    ]
  },
  {
    id: 'srv-api',
    name: 'Creston Core API',
    type: 'BACKEND',
    port: 8000,
    targetUrl: 'http://localhost:8000',
    localDomain: 'api.creston.test',
    command: 'uvicorn main:app --reload --port 8000',
    workDir: '/backend',
    envVars: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/creston',
      REDIS_URL: 'redis://localhost:6379/0',
      SECRET_KEY: 'local_dev_secret_creston',
      DEBUG: 'True'
    },
    status: 'RUNNING',
    health: 'HEALTHY',
    pid: 5832,
    cpuPercent: 3.1,
    memoryMb: 185,
    uptimeSeconds: 835,
    logs: [
      '[10:00:01 AM] [INFO] Starting Creston Core API with uvicorn...',
      '[10:00:03 AM] [SUCCESS] Application startup complete. Uvicorn running on http://127.0.0.1:8000',
      '[10:02:10 AM] [HTTP] 200 GET /api/v1/health - 4ms'
    ]
  },
  {
    id: 'srv-db',
    name: 'PostgreSQL 16 Engine',
    type: 'DATABASE',
    port: 5432,
    targetUrl: 'postgresql://localhost:5432',
    command: 'docker run -p 5432:5432 postgres:16',
    workDir: '/infrastructure',
    envVars: {
      POSTGRES_DB: 'creston',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres_secure_password'
    },
    status: 'RUNNING',
    health: 'HEALTHY',
    pid: 2190,
    cpuPercent: 0.8,
    memoryMb: 240,
    uptimeSeconds: 1200,
    logs: [
      '[09:55:00 AM] [Postgres] database system is ready to accept connections',
      '[09:55:01 AM] [Postgres] socket: 5432'
    ]
  },
  {
    id: 'srv-worker',
    name: 'Async Background Worker',
    type: 'WORKER',
    port: 0, // No listening port
    targetUrl: '',
    command: 'celery -A tasks worker --loglevel=info',
    workDir: '/backend',
    envVars: {
      CONCURRENCY: '4',
      CELERY_BROKER_URL: 'redis://localhost:6379/0'
    },
    status: 'STOPPED',
    health: 'DOWN',
    cpuPercent: 0,
    memoryMb: 0,
    uptimeSeconds: 0,
    logs: ['[09:30:00 AM] [INFO] Worker process stopped.']
  }
];

const INITIAL_PROXY_ROUTES: ProxyRoute[] = [
  {
    id: 'route-1',
    localDomain: 'app.creston.test',
    targetPort: 3000,
    sslEnabled: true,
    certStatus: 'VALID',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'route-2',
    localDomain: 'api.creston.test',
    targetPort: 8000,
    sslEnabled: true,
    certStatus: 'VALID',
    createdAt: Date.now() - 3600000
  }
];

export const useLocalHostStore = create<LocalHostStore>((set, get) => ({
  services: INITIAL_SERVICES,
  portBindings: PortScanner.scanPortBindings(INITIAL_SERVICES),
  proxyRoutes: INITIAL_PROXY_ROUTES,
  selectedServiceId: null,

  setSelectedServiceId: (selectedServiceId) => set({ selectedServiceId }),

  startService: (id) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? ProcessManager.startService(s) : s))
    }));
    get().scanPorts();
  },

  stopService: (id) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? ProcessManager.stopService(s) : s))
    }));
    get().scanPorts();
  },

  restartService: (id) => {
    const s = get().services.find((serv) => serv.id === id);
    if (!s) return;
    const stopped = ProcessManager.stopService(s);
    const restarted = ProcessManager.startService(stopped);
    set((state) => ({
      services: state.services.map((serv) => (serv.id === id ? restarted : serv))
    }));
    get().scanPorts();
  },

  startAllServices: () => {
    set((state) => ({
      services: state.services.map((s) =>
        s.status !== 'RUNNING' ? ProcessManager.startService(s) : s
      )
    }));
    get().scanPorts();
  },

  stopAllServices: () => {
    set((state) => ({
      services: state.services.map((s) =>
        s.status === 'RUNNING' ? ProcessManager.stopService(s) : s
      )
    }));
    get().scanPorts();
  },

  scanPorts: () => {
    const bindings = PortScanner.scanPortBindings(get().services);
    set({ portBindings: bindings });
  },

  killProcess: (pid) => {
    // If a registered service has this PID, stop it
    set((state) => ({
      services: state.services.map((s) =>
        s.pid === pid ? ProcessManager.stopService(s) : s
      ),
      portBindings: state.portBindings.filter((b) => b.pid !== pid)
    }));
  },

  updateServiceEnv: (id, envVars) => {
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, envVars: { ...envVars } } : s
      )
    }));
  },

  addService: (data) => {
    const newService: DevService = {
      id: `srv-${Date.now()}`,
      name: data.name,
      type: data.type,
      port: data.port,
      targetUrl: data.port > 0 ? `http://localhost:${data.port}` : '',
      command: data.command,
      workDir: data.workDir,
      envVars: data.envVars || {},
      status: 'STOPPED',
      health: 'DOWN',
      cpuPercent: 0,
      memoryMb: 0,
      uptimeSeconds: 0,
      logs: ['Service registered. Ready to start.']
    };

    set((state) => ({ services: [...state.services, newService] }));
  },

  deleteService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id)
    }));
    get().scanPorts();
  },

  addProxyRoute: (domain, targetPort, ssl = true) => {
    if (!ProxyRouter.isValidLocalDomain(domain)) {
      return false;
    }
    const route = ProxyRouter.createRoute(domain, targetPort, ssl);
    set((state) => ({ proxyRoutes: [...state.proxyRoutes, route] }));
    return true;
  },

  deleteProxyRoute: (id) => {
    set((state) => ({
      proxyRoutes: state.proxyRoutes.filter((r) => r.id !== id)
    }));
  },

  tickTelemetry: () => {
    set((state) => ({
      services: state.services.map((s) => ProcessManager.generateTelemetryTick(s))
    }));
  }
}));
