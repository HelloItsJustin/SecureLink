// Progress checkpoint: edited 2026-02-10 — incremental work
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, BankName } from '../types';
import { TransactionCard } from './TransactionCard';
import { Building2 } from 'lucide-react';

interface BankStreamProps {
  bank: BankName;
  transactions: Transaction[];
  fraudFingerprints: Set<string>;
  onTransactionClick?: (transaction: Transaction) => void;
}

const bankColors = {
  HDFC: 'from-blue-600 to-blue-800',
  ICICI: 'from-orange-600 to-red-700',
  SBI: 'from-green-600 to-emerald-800'
};

export const BankStream = memo(function BankStream({ bank, transactions, fraudFingerprints, onTransactionClick }: BankStreamProps) {
  const bankTransactions = transactions.filter(tx => tx.bank === bank).slice(-5);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-purple-500/20 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-gradient-to-r ${bankColors[bank]} rounded-none p-4 flex items-center gap-3 shadow-md`}
      >
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{bank} Bank</h3>
          <p className="text-white/80 text-xs">{bankTransactions.length} recent transactions</p>
        </div>
      </motion.div>

      <div className="flex-1 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-x border-b border-transparent p-4 overflow-y-auto scrollbar-hide">
        {bankTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Waiting for transactions...
          </div>
        ) : (
          <div className="space-y-2">
            {bankTransactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <TransactionCard
                  transaction={tx}
                  isFraudRing={fraudFingerprints.has(tx.jlynFingerprint)}
                  onClick={() => onTransactionClick?.(tx)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
