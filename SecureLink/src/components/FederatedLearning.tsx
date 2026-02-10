import { memo } from 'react';
import { motion } from 'framer-motion';
import { Share2, CheckCircle, Lock } from 'lucide-react';

interface FederatedLearningProps {
  fingerprintsShared: number;
}

export const FederatedLearning = memo(function FederatedLearning({ fingerprintsShared }: FederatedLearningProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold text-white">Federated Learning</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Cross-Bank Sharing</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">Active</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Fingerprints Shared</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{fingerprintsShared}</div>
        </div>

        <div className="space-y-2">
          {['HDFC', 'ICICI', 'SBI'].map((bank, idx) => (
            <motion.div
              key={bank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2"
            >
              <span className="text-sm text-gray-300">{bank}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Synced</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Microsoft SEAL</span>
            </div>
            <span className="text-green-400 font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
});
