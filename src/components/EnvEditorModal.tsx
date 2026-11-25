import React, { useState } from 'react';
import { DevService } from '../types';
import { useLocalHostStore } from '../core/localhost_store';
import { EnvParser } from '../core/env_parser';
import { X, FileCode, Plus, Trash2, Save } from 'lucide-react';

interface EnvEditorModalProps {
  service: DevService | null;
  onClose: () => void;
}

export const EnvEditorModal: React.FC<EnvEditorModalProps> = ({ service, onClose }) => {
  const { updateServiceEnv } = useLocalHostStore();
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');
  const [envVars, setEnvVars] = useState<Record<string, string>>(() => service?.envVars || {});
  const [rawText, setRawText] = useState(() => (service ? EnvParser.serialize(service.envVars) : ''));
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  if (!service) return null;

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const updated = { ...envVars, [newKey.trim()]: newValue.trim() };
    setEnvVars(updated);
    setRawText(EnvParser.serialize(updated));
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteKey = (key: string) => {
    const updated = { ...envVars };
    delete updated[key];
    setEnvVars(updated);
    setRawText(EnvParser.serialize(updated));
  };

  const handleSave = () => {
    let finalEnv = envVars;
    if (activeTab === 'raw') {
      finalEnv = EnvParser.parse(rawText);
    }
    updateServiceEnv(service.id, finalEnv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Environment Variables (.env): {service.name}
            </h2>
            <p className="text-xs text-slate-400">Configure runtime credentials, database strings, and port offsets</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('visual');
              setEnvVars(EnvParser.parse(rawText));
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'visual'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Visual Key-Value Grid
          </button>
          <button
            onClick={() => {
              setActiveTab('raw');
              setRawText(EnvParser.serialize(envVars));
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'raw'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Raw .env Text File
          </button>
        </div>

        {activeTab === 'visual' ? (
          <div className="space-y-4">
            {/* Add Pair Form */}
            <form onSubmit={handleAddPair} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="VARIABLE_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
              <input
                type="text"
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>

            {/* Existing Keys Table */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {Object.entries(envVars).map(([k, v]) => (
                <div
                  key={k}
                  className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3 truncate pr-2 font-mono">
                    <span className="font-bold text-purple-300 truncate">{k}</span>
                    <span className="text-slate-300 truncate">{v}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(k)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <textarea
              rows={10}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Environment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
