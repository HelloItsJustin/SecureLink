// Progress checkpoint: edited 2026-02-10 — incremental work
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
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-gradient-to-br from-pink-500/20 via-red-500/15 to-pink-600/20 backdrop-blur-xl border-2 border-pink-500/70 rounded-xl p-5 shadow-2xl hover:shadow-pink-500/30 transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <AlertCircle className="w-6 h-6 text-pink-500 drop-shadow-lg" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">🚨 Fraud Ring Detected!</h3>
                <p className="text-xs text-pink-300 font-medium">Cross-bank pattern match</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="bg-gradient-to-r from-slate-900/70 to-slate-800/50 border border-pink-500/20 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-400 mb-2 font-semibold">Matched Jlyn Fingerprint</div>
            <div className="font-mono text-xs text-pink-300/80 break-all bg-slate-900/50 p-2 rounded border border-slate-700/50">
              {ring.fingerprint.slice(0, 32)}...
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between text-sm bg-slate-900/30 p-2 rounded border border-slate-700/50"
            >
              <span className="text-gray-400 font-medium">Banks Involved:</span>
              <span className="text-white font-semibold">{ring.banksInvolved.join(', ')}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-between text-sm bg-slate-900/30 p-2 rounded border border-slate-700/50"
            >
              <span className="text-gray-400 font-medium">Transactions:</span>
              <span className="text-red-300 font-bold">{ring.transactions.length}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between text-sm bg-slate-900/30 p-2 rounded border border-slate-700/50"
            >
              <span className="text-gray-400 font-medium">Total Amount:</span>
              <span className="text-red-300 font-bold">
                ₹{ring.transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
              </span>
            </motion.div>
          </div>

          <div className="pt-3 border-t border-pink-500/20 text-center">
            <motion.div 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs text-pink-300/90 font-semibold"
            >
              ✓ All transactions blocked automatically
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
