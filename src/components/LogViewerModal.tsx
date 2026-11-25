import React, { useRef, useEffect } from 'react';
import { DevService } from '../types';
import { X, Terminal, Trash2, ArrowDown } from 'lucide-react';

interface LogViewerModalProps {
  service: DevService | null;
  onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({ service, onClose }) => {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [service?.logs]);

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Process Log Stream: {service.name}</span>
              <span className={`w-2 h-2 rounded-full ${service.status === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              PID: {service.pid || 'N/A'} • Port: {service.port || 'None'} • Status: {service.status}
            </p>
          </div>
        </div>

        {/* Dark Terminal Window */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 h-80 overflow-y-auto space-y-1 select-text">
          {service.logs.length === 0 ? (
            <p className="text-slate-600 italic">No output logged yet.</p>
          ) : (
            service.logs.map((line, idx) => (
              <div
                key={idx}
                className={`leading-relaxed ${
                  line.includes('[SUCCESS]') || line.includes('200')
                    ? 'text-emerald-400'
                    : line.includes('[ERROR]') || line.includes('500')
                    ? 'text-rose-400'
                    : line.includes('[INFO]')
                    ? 'text-cyan-300'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
          >
            Close Stream
          </button>
        </div>
      </div>
    </div>
  );
};
