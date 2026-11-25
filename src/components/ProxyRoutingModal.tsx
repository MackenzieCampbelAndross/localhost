import React, { useState } from 'react';
import { useLocalHostStore } from '../core/localhost_store';
import { X, ShieldCheck, Plus, Trash2, Globe, Lock } from 'lucide-react';

interface ProxyRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProxyRoutingModal: React.FC<ProxyRoutingModalProps> = ({ isOpen, onClose }) => {
  const { proxyRoutes, addProxyRoute, deleteProxyRoute } = useLocalHostStore();
  const [domain, setDomain] = useState('');
  const [targetPort, setTargetPort] = useState(3000);
  const [ssl, setSsl] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = addProxyRoute(domain.trim(), Number(targetPort), ssl);
    if (!ok) {
      setError('Domain must end with .test, .local, or .localhost (e.g. app.creston.test)');
      return;
    }
    setDomain('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Local Reverse Proxy & SSL Router</h2>
            <p className="text-xs text-slate-400">Route friendly *.test local domains to development ports</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Add Route Form */}
        <form onSubmit={handleAdd} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Custom Local Domain</label>
              <input
                type="text"
                required
                placeholder="e.g. app.creston.test"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Port</label>
              <input
                type="number"
                required
                min="1000"
                max="65535"
                value={targetPort}
                onChange={(e) => setTargetPort(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ssl}
                onChange={(e) => setSsl(e.target.checked)}
                className="rounded accent-purple-600 w-4 h-4"
              />
              <span className="text-slate-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Issue Local SSL Certificate (HTTPS)
              </span>
            </label>

            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center gap-1 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Route</span>
            </button>
          </div>
        </form>

        {/* Existing Routes */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Virtual Proxy Routes ({proxyRoutes.length})
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {proxyRoutes.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{r.localDomain}</span>
                    {r.sslEnabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-0.5 font-mono">
                        <Lock className="w-2.5 h-2.5" /> SSL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    → http://localhost:{r.targetPort}
                  </div>
                </div>

                <button
                  onClick={() => deleteProxyRoute(r.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
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
