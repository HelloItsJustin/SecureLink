import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { FraudRing } from '../types';

interface FraudAlertProps {
  ring: FraudRing | null;
  onClose: () => void;
}

export function FraudAlert({ ring, onClose }: FraudAlertProps) {
  if (!ring) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-xl border-2 border-pink-500 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertCircle className="w-6 h-6 text-pink-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">Fraud Ring Detected!</h3>
                <p className="text-xs text-pink-300">Cross-bank pattern match</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
            <div className="text-xs text-gray-400 mb-1">Matched Jlyn Fingerprint</div>
            <div className="font-mono text-sm text-pink-400 break-all">
              {ring.fingerprint}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Banks Involved:</span>
              <span className="text-white font-semibold">{ring.banksInvolved.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Transactions:</span>
              <span className="text-white font-semibold">{ring.transactions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-white font-semibold">
                ₹{ring.transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-pink-500/30">
            <div className="text-xs text-pink-300 text-center">
              All transactions blocked automatically
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
