import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Play, Pause } from 'lucide-react';
import { SIMULATION_CONFIG } from '../config/constants';

interface SettingsPanelProps {
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  isRunning?: boolean;
  onToggleRun?: () => void;
}

export const SettingsPanel = memo(function SettingsPanel({
  simulationSpeed,
  onSpeedChange,
  isRunning = true,
  onToggleRun
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 rounded-lg transition-colors group"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-800 border-l border-blue-500/20 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Simulation Speed */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-white">
                      Transaction Speed
                    </label>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {simulationSpeed}ms
                    </span>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 mb-3">
                    <input
                      type="range"
                      min={SIMULATION_CONFIG.MIN_TRANSACTION_SPEED}
                      max={SIMULATION_CONFIG.MAX_TRANSACTION_SPEED}
                      value={simulationSpeed}
                      onChange={(e) => onSpeedChange(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      <span>Fast ({SIMULATION_CONFIG.MIN_TRANSACTION_SPEED}ms)</span>
                      <span>Slow ({SIMULATION_CONFIG.MAX_TRANSACTION_SPEED}ms)</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Controls how frequently new transactions are generated in the simulation.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-slate-700 via-blue-500/20 to-slate-700 my-6" />

                {/* Simulation Control */}
                {onToggleRun && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-white block mb-3">
                      Simulation
                    </label>
                    <button
                      onClick={onToggleRun}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                        isRunning
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause Simulation
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Resume Simulation
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Info Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 mt-6">
                  <h3 className="text-sm font-semibold text-white mb-2">💡 Tips</h3>
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li>• Faster speeds generate more transactions for demo purposes</li>
                    <li>• Watch the metrics update in real-time</li>
                    <li>• Monitor the fraud detection network visualization</li>
                    <li>• Each transaction gets a unique Jlyn fingerprint</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
