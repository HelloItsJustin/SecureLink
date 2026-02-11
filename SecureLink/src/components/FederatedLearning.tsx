import { memo } from 'react';
import { motion } from 'framer-motion';
import { Share2, CheckCircle, Lock } from 'lucide-react';

interface FederatedLearningProps {
  fingerprintsShared: number;
}

export const FederatedLearning = memo(function FederatedLearning({ fingerprintsShared }: FederatedLearningProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-green-400 animate-glow-pulse" />
        <h3 className="text-lg font-bold text-white">Federated Learning</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 cursor-pointer transition-all hover:border-green-500/50 hover:shadow-green-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 font-medium">Cross-Bank Sharing</span>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </motion.div>
          </div>
          <div className="text-2xl font-bold text-white">Active</div>
          <div className="text-xs text-green-300/70 mt-1">Real-time synchronization enabled</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-lg p-3 cursor-pointer transition-all hover:border-purple-500/50 hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 font-medium">Fingerprints Shared</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{fingerprintsShared}</div>
          <div className="text-xs text-purple-300/70 mt-1">Encrypted & anonymized</div>
        </motion.div>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-gray-300 mb-3">Network Status</div>
          {['HDFC', 'ICICI', 'SBI'].map((bank, idx) => (
            <motion.div
              key={bank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-2 transition-all cursor-pointer border border-slate-700/0 hover:border-slate-600/50"
            >
              <span className="text-sm text-gray-300 font-medium">{bank}</span>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-green-400 font-semibold">Synced</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-xs bg-slate-800/40 rounded-lg p-2">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Encryption</span>
            </div>
            <span className="text-green-400 font-semibold">Microsoft SEAL</span>
          </div>
        </div>
      </div>
    </div>
  );
});
