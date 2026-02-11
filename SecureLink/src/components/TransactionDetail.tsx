// Progress checkpoint: edited 2026-02-10 — incremental work
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertCircle, AlertTriangle, Clock, Building2, CreditCard, Smartphone } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionDetailProps {
  transaction: Transaction | null;
  onClose: () => void;
  isFraudRing?: boolean;
}

export const TransactionDetail = memo(function TransactionDetail({
  transaction,
  onClose,
  isFraudRing = false
}: TransactionDetailProps) {
  if (!transaction) return null;

  const getRiskColor = () => {
    if (transaction.riskScore >= 71) return 'from-red-500/20 to-pink-500/20 border-red-500/30';
    if (transaction.riskScore >= 31) return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
    return 'from-emerald-500/20 to-green-500/20 border-green-500/30';
  };

  const getRiskLabel = () => {
    if (transaction.riskScore >= 71) return 'High Risk - Fraud Detected';
    if (transaction.riskScore >= 31) return 'Medium Risk - Suspicious';
    return 'Low Risk - Safe';
  };

  const getRiskIcon = () => {
    if (transaction.riskScore >= 71) return <AlertCircle className="w-6 h-6 text-red-400" />;
    if (transaction.riskScore >= 31) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    return <Shield className="w-6 h-6 text-green-400" />;
  };

  const getRiskTextColor = () => {
    if (transaction.riskScore >= 71) return 'text-red-400';
    if (transaction.riskScore >= 31) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-gradient-to-br ${getRiskColor()} border backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {getRiskIcon()}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Transaction Details</h2>
                <p className={`text-sm font-semibold ${getRiskTextColor()}`}>
                  {getRiskLabel()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Fraud Ring Indicator */}
          {isFraudRing && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 font-semibold text-sm">
                This transaction is part of a detected fraud ring across multiple banks
              </p>
            </div>
          )}

          {/* Risk Score */}
          <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-semibold">Risk Assessment</span>
              <span className={`text-3xl font-bold ${getRiskTextColor()}`}>{transaction.riskScore}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  transaction.riskScore >= 71
                    ? 'bg-red-500'
                    : transaction.riskScore >= 31
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${transaction.riskScore}%` }}
              />
            </div>
          </div>

          {/* Transaction Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Transaction ID */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-1">Transaction ID</p>
              <p className="text-white font-mono text-sm break-all">{transaction.id}</p>
            </div>

            {/* Amount */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-1">Amount</p>
              <p className="text-white font-bold text-lg">{formatAmount(transaction.amount)}</p>
            </div>

            {/* Bank */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <p className="text-gray-400 text-xs font-semibold">Bank</p>
              </div>
              <p className="text-white font-semibold">{transaction.bank}</p>
            </div>

            {/* Merchant */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-1">Merchant</p>
              <p className="text-white font-semibold">{transaction.merchant}</p>
            </div>

            {/* Card */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <p className="text-gray-400 text-xs font-semibold">Card</p>
              </div>
              <p className="text-white font-mono font-semibold">
                **** **** **** {transaction.card.slice(-4)}
              </p>
            </div>

            {/* Device */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <p className="text-gray-400 text-xs font-semibold">Device ID</p>
              </div>
              <p className="text-white font-mono text-sm break-all">{transaction.device}</p>
            </div>

            {/* Date/Time */}
            <div className="sm:col-span-2 bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-400" />
                <p className="text-gray-400 text-xs font-semibold">Date & Time</p>
              </div>
              <p className="text-white font-semibold">{formatDate(transaction.timestamp)}</p>
            </div>
          </div>

          {/* Jlyn Fingerprint */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-2">Jlyn Fingerprint</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
              <p className="text-purple-300 font-mono text-xs break-all leading-relaxed">
                {transaction.jlynFingerprint}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Unique cryptographic signature of this transaction for cross-bank fraud detection
              </p>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">AI Analysis & Reasoning</h3>
            <div className="space-y-2">
              {transaction.aiReasoning.map((reason, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                transaction.riskScore >= 71
                  ? 'bg-red-500/30 text-red-300'
                  : transaction.riskScore >= 31
                  ? 'bg-yellow-500/30 text-yellow-300'
                  : 'bg-green-500/30 text-green-300'
              }`}>
                {transaction.riskScore >= 71 ? 'Blocked' : transaction.riskScore >= 31 ? 'Under Review' : 'Approved'}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Details
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
