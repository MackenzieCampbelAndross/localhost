import React from 'react';
import { DevService } from '../types';
import { useLocalHostStore } from '../core/localhost_store';
import { Play, Square, RotateCw, ExternalLink, Terminal, FileCode, Cpu, HardDrive, Globe, Server, Database, Cog } from 'lucide-react';

interface ServiceCardProps {
  service: DevService;
  onOpenLogs: (service: DevService) => void;
  onOpenEnv: (service: DevService) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onOpenLogs, onOpenEnv }) => {
  const { startService, stopService, restartService } = useLocalHostStore();
  const isRunning = service.status === 'RUNNING';

  const getTypeIcon = () => {
    switch (service.type) {
      case 'FRONTEND':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'BACKEND':
        return <Server className="w-4 h-4 text-purple-400" />;
      case 'DATABASE':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'WORKER':
      default:
        return <Cog className="w-4 h-4 text-amber-400" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg ${
      isRunning
        ? 'bg-slate-900/90 border-slate-800 hover:border-purple-500/50'
        : 'bg-slate-950/60 border-slate-800/60 opacity-75'
    }`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
              {getTypeIcon()}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-slate-100 truncate">{service.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {service.type}
                </span>
                {service.port > 0 && (
                  <span className="text-[10px] font-mono font-bold text-purple-300">
                    :{service.port}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {service.status}
            </span>
          </div>
        </div>

        {/* Command & Target URL */}
        <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 truncate">
          <span className="text-slate-500">$ </span>
          <span>{service.command}</span>
        </div>

        {/* Telemetry Metrics */}
        {isRunning && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" /> CPU
              </div>
              <div className="font-mono font-bold text-slate-200">{service.cpuPercent}%</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" /> Memory
              </div>
              <div className="font-mono font-bold text-slate-200">{service.memoryMb} MB</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400">PID / Uptime</div>
              <div className="font-mono font-bold text-slate-200">
                {service.pid} • {formatUptime(service.uptimeSeconds)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          {isRunning ? (
            <button
              onClick={() => stopService(service.id)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-semibold flex items-center gap-1 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => startService(service.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center gap-1 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          )}

          <button
            onClick={() => restartService(service.id)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Restart process"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          {service.targetUrl && (
            <a
              href={service.localDomain ? `http://${service.localDomain}` : service.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
              title="Open in Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onOpenLogs(service)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
            title="View Live Logs"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenEnv(service)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
            title="Edit Environment (.env)"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
