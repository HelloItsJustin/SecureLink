// Progress checkpoint: edited 2026-02-10 — incremental work
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../types';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  isFraudRing?: boolean;
  onClick?: () => void;
}

export const TransactionCard = memo(function TransactionCard({ transaction, isFraudRing, onClick }: TransactionCardProps) {
  const getRiskColor = () => {
    if (transaction.riskScore >= 71) return 'from-pink-500/20 to-red-500/20 border-pink-500/50';
    if (transaction.riskScore >= 31) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
    return 'from-green-500/20 to-emerald-500/20 border-green-500/50';
  };

  const getRiskIcon = () => {
    if (transaction.riskScore >= 71) return <AlertCircle className="w-4 h-4 text-pink-500" />;
    if (transaction.riskScore >= 31) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <Shield className="w-4 h-4 text-green-500" />;
  };

  const getRiskTextColor = () => {
    if (transaction.riskScore >= 71) return 'text-pink-500';
    if (transaction.riskScore >= 31) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -2 }}
      className={`relative bg-gradient-to-br ${getRiskColor()} backdrop-blur-xl border rounded-lg p-3 mb-2 overflow-hidden group cursor-pointer transition-all shadow-md hover:shadow-lg hover:border-opacity-100`}
      style={{
        boxShadow: isFraudRing ? '0 0 20px rgba(230, 73, 128, 0.5)' : undefined
      }}
      onClick={onClick}
    >
      {isFraudRing && (
        <motion.div
          className="absolute inset-0 bg-pink-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <motion.div whileHover={{ scale: 1.2 }}>
                {getRiskIcon()}
              </motion.div>
              <span className="text-white font-bold text-sm truncate">{transaction.merchant}</span>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(transaction.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-right ml-2">
            <div className="text-white font-bold whitespace-nowrap">₹{transaction.amount.toLocaleString()}</div>
            <div className={`text-xs font-semibold ${getRiskTextColor()}`}>
              Risk: {transaction.riskScore}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-2 mb-2 border border-slate-700/50 group-hover:border-slate-600/70 transition-colors">
          <div className="text-xs text-gray-400 mb-1">Jlyn Fingerprint</div>
          <div className="font-mono text-xs text-blue-400 break-all">
            {transaction.jlynFingerprint.slice(0, 20)}...
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <div>Card: •••• {transaction.card.slice(-4)}</div>
          <div>Device: {transaction.device}</div>
        </div>

        <div className="mt-2 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
          <div className="text-xs text-gray-300 mb-1 font-semibold">AI Reasoning:</div>
          <ul className="text-xs text-gray-400 space-y-0.5">
            {transaction.aiReasoning.slice(0, 2).map((reason, idx) => (
              <li key={idx}>• {reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
});
