import React from 'react';
import { useLocalHostStore } from '../core/localhost_store';
import { PortScanner } from '../core/port_scanner';
import { X, Network, AlertTriangle, Skull, RefreshCw } from 'lucide-react';

interface PortConflictScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortConflictScanner: React.FC<PortConflictScannerProps> = ({ isOpen, onClose }) => {
  const { portBindings, killProcess, scanPorts } = useLocalHostStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Port Conflict Inspector</h2>
              <p className="text-xs text-slate-400">Scan active port allocations and terminate rogue listening processes</p>
            </div>
          </div>

          <button
            onClick={scanPorts}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-semibold"
            title="Refresh port scan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Port Bindings Table */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {portBindings.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No active listening ports discovered.
            </p>
          ) : (
            <div className="space-y-2">
              {portBindings.map((binding, idx) => (
                <div
                  key={`${binding.port}-${binding.pid}-${idx}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    binding.hasConflict
                      ? 'bg-rose-950/40 border-rose-600/60 text-rose-200 shadow-md shadow-rose-950/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-purple-300 w-16">
                      :{binding.port}
                    </span>

                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{binding.processName}</span>
                        {binding.hasConflict && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                            <AlertTriangle className="w-3 h-3" /> Conflict Detected
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        PID: {binding.pid} • Command: {PortScanner.generateKillCommand(binding.pid)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => killProcess(binding.pid)}
                    className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title={`Kill Process ${binding.pid}`}
                  >
                    <Skull className="w-3.5 h-3.5 text-rose-400" />
                    <span>Kill Process</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
