import React, { useState, useEffect } from 'react';
import { useLocalHostStore } from './core/localhost_store';
import { DevService, ServiceType } from './types';
import { Header } from './components/Header';
import { ServiceCard } from './components/ServiceCard';
import { PortConflictScanner } from './components/PortConflictScanner';
import { LogViewerModal } from './components/LogViewerModal';
import { EnvEditorModal } from './components/EnvEditorModal';
import { ProxyRoutingModal } from './components/ProxyRoutingModal';
import { Server, Plus, X } from 'lucide-react';

export const App: React.FC = () => {
  const { services, addService, tickTelemetry } = useLocalHostStore();
  const [activeLogService, setActiveLogService] = useState<DevService | null>(null);
  const [activeEnvService, setActiveEnvService] = useState<DevService | null>(null);
  const [isPortScannerOpen, setIsPortScannerOpen] = useState(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  // New Service Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ServiceType>('FRONTEND');
  const [newPort, setNewPort] = useState(5173);
  const [newCommand, setNewCommand] = useState('npm run dev');
  const [newWorkDir, setNewWorkDir] = useState('/');

  // Telemetry tick loop
  useEffect(() => {
    const timer = setInterval(() => {
      tickTelemetry();
    }, 1500);

    return () => clearInterval(timer);
  }, [tickTelemetry]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCommand.trim()) return;

    addService({
      name: newName.trim(),
      type: newType,
      port: Number(newPort),
      command: newCommand.trim(),
      workDir: newWorkDir.trim()
    });

    setNewName('');
    setIsAddServiceOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenPortScanner={() => setIsPortScannerOpen(true)}
        onOpenProxyRoutes={() => setIsProxyModalOpen(true)}
        onOpenNewService={() => setIsAddServiceOpen(true)}
      />

      {/* Main Studio View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-200">
              Configured Services & Daemons ({services.length})
            </span>
            <span className="text-slate-600">•</span>
            <span>Real-time local development orchestration & process telemetry</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onOpenLogs={(s) => setActiveLogService(s)}
              onOpenEnv={(s) => setActiveEnvService(s)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-600 bg-slate-950/80">
        <p>LocalHost • Local Development Environment Manager • Autonomous Software Production Pipeline</p>
      </footer>

      {/* Modals */}
      <PortConflictScanner
        isOpen={isPortScannerOpen}
        onClose={() => setIsPortScannerOpen(false)}
      />

      <ProxyRoutingModal
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
      />

      <LogViewerModal
        service={activeLogService}
        onClose={() => setActiveLogService(null)}
      />

      <EnvEditorModal
        service={activeEnvService}
        onClose={() => setActiveEnvService(null)}
      />

      {/* Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddServiceOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-100">Register New Service</h2>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Admin Portal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Service Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ServiceType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="FRONTEND">Frontend (UI)</option>
                    <option value="BACKEND">Backend (API)</option>
                    <option value="DATABASE">Database</option>
                    <option value="WORKER">Worker / Queue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Port</label>
                  <input
                    type="number"
                    min="0"
                    max="65535"
                    value={newPort}
                    onChange={(e) => setNewPort(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Start Command</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. npm run dev or python main.py"
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
