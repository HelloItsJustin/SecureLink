import { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, TrendingUp, Fingerprint, AlertTriangle } from 'lucide-react';
import { Metrics } from '../types';

interface MetricsBarProps {
  metrics: Metrics;
}

export const MetricsBar = memo(function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">
              {metrics.transactionsAnalyzed.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Transactions</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-xl border border-pink-500/30 rounded-xl p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 bg-pink-500/20 rounded-lg flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">
              {metrics.fraudBlocked}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Fraud Blocked</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">
              ₹{(metrics.moneySaved / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Money Saved</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
            <Fingerprint className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">
              {metrics.jlynFingerprintsGenerated.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Jlyn Fingerprints</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-orange-500/30 rounded-xl p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">
              {metrics.activeFraudRings}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Active Rings</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
