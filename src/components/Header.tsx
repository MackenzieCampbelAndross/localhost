import React from 'react';
import { useLocalHostStore } from '../core/localhost_store';
import { Server, Play, Square, Network, ShieldCheck, Plus, Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenPortScanner: () => void;
  onOpenProxyRoutes: () => void;
  onOpenNewService: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPortScanner,
  onOpenProxyRoutes,
  onOpenNewService
}) => {
  const {
    services,
    portBindings,
    startAllServices,
    stopAllServices,
    scanPorts
  } = useLocalHostStore();

  const runningServices = services.filter((s) => s.status === 'RUNNING');
  const totalCpu = runningServices.reduce((acc, s) => acc + s.cpuPercent, 0).toFixed(1);
  const totalMem = runningServices.reduce((acc, s) => acc + s.memoryMb, 0);
  const conflictCount = portBindings.filter((p) => p.hasConflict).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-purple-900/30 px-6 py-4 space-y-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                LocalHost
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Local Development Environment & Service Manager</p>
          </div>
        </div>

        {/* Global Cluster Metrics */}
        <div className="flex items-center gap-6 text-xs bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400">Services:</span>{' '}
            <strong className="text-purple-300">{runningServices.length} / {services.length}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">CPU:</span>{' '}
            <strong className="text-slate-200">{totalCpu}%</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">RAM:</span>{' '}
            <strong className="text-slate-200">{totalMem} MB</strong>
          </div>
        </div>

        {/* Quick Operations */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={startAllServices}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start All</span>
          </button>

          <button
            onClick={stopAllServices}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop All</span>
          </button>

          <button
            onClick={onOpenPortScanner}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              conflictCount > 0
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Ports ({portBindings.length})</span>
          </button>

          <button
            onClick={onOpenProxyRoutes}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Proxy & SSL</span>
          </button>

          <button
            onClick={onOpenNewService}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>
    </header>
  );
};
