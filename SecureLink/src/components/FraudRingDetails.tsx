// Progress checkpoint: edited 2026-02-10 — Fraud Ring Details with enhanced stability and error handling
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { FraudRing, Transaction } from '../types';

interface FraudRingDetailsProps {
  fraudRings: FraudRing[];
  allTransactions: Transaction[];
}

export const FraudRingDetails = memo(function FraudRingDetails({ fraudRings, allTransactions }: FraudRingDetailsProps) {
  // Cache the transaction grouping to prevent recalculation on every render
  const ringTransactions = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    
    if (!fraudRings || fraudRings.length === 0) return grouped;
    if (!allTransactions || allTransactions.length === 0) return grouped;
    
    fraudRings.forEach(ring => {
      if (!ring || !ring.fingerprint) return;
      const txs = allTransactions
        .filter(tx => tx && tx.jlynFingerprint === ring.fingerprint)
        .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
      if (txs.length > 0) {
        grouped.set(ring.fingerprint, txs);
      }
    });
    
    return grouped;
  }, [fraudRings.length, allTransactions.length]); // Depend on counts, not arrays

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-indigo-500/20 p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Fraud Ring Details
        </h3>
        <p className="text-xs text-gray-400">{fraudRings?.length || 0} detected rings</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {fraudRings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No fraud rings detected yet
          </div>
        ) : (
          fraudRings.map((ring, ringIdx) => {
            const transactions = ringTransactions.get(ring.fingerprint) || [];
            
            return (
              <motion.div
                key={ring.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/50 border border-red-500/30 rounded-lg p-4 flex-shrink-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-bold text-sm">Ring #{ringIdx + 1}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-1">{ring.fingerprint.slice(0, 16)}...</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-400">
                      {transactions.length} transactions
                    </span>
                    <p className="text-xs text-gray-400">{ring.banksInvolved.join(', ')}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 ml-2 border-l border-red-500/40 pl-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="relative">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-800" />
                      <div className="flex items-start justify-between text-xs">
                        <div>
                          <p className="text-gray-300 font-semibold">{tx.merchant}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formatDate(tx.timestamp)} {formatTime(tx.timestamp)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                              {tx.bank}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-700 text-gray-300 rounded text-xs">
                              ₹{tx.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 font-bold">{tx.riskScore}</span>
                          </div>
                          <p className="text-gray-500 mt-1 text-xs">Card: {tx.card.slice(-4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ring Summary */}
                <div className="mt-3 pt-3 border-t border-red-500/20 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="text-white font-bold">
                      ₹{transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Risk</p>
                    <p className="text-white font-bold">
                      {(transactions.reduce((sum, tx) => sum + tx.riskScore, 0) / transactions.length).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="text-white font-bold text-xs">
                      {transactions.length > 1 
                        ? ((transactions[transactions.length - 1]?.timestamp - transactions[0]?.timestamp) / 60000).toFixed(0) + 'm'
                        : '0m'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
});
