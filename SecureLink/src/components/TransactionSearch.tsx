// Progress checkpoint: edited 2026-02-10 — incremental work
import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionSearchProps {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
}

interface Filters {
  searchText: string;
  bankFilter: string;
  minAmount: number;
  maxAmount: number;
  minRisk: number;
  maxRisk: number;
}

export const TransactionSearch = memo(function TransactionSearch({ transactions, onSelect }: TransactionSearchProps) {
  const [filters, setFilters] = useState<Filters>({
    searchText: '',
    bankFilter: '',
    minAmount: 0,
    maxAmount: 100000,
    minRisk: 0,
    maxRisk: 100
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = !filters.searchText || 
        tx.id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        tx.card.slice(-4).includes(filters.searchText) ||
        tx.device.toLowerCase().includes(filters.searchText.toLowerCase());

      const matchesBank = !filters.bankFilter || tx.bank === filters.bankFilter;
      const matchesAmount = tx.amount >= filters.minAmount && tx.amount <= filters.maxAmount;
      const matchesRisk = tx.riskScore >= filters.minRisk && tx.riskScore <= filters.maxRisk;

      return matchesSearch && matchesBank && matchesAmount && matchesRisk;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, filters]);

  const resetFilters = () => {
    setFilters({
      searchText: '',
      bankFilter: '',
      minAmount: 0,
      maxAmount: 100000,
      minRisk: 0,
      maxRisk: 100
    });
  };

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-indigo-500/20 p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-green-400" />
          Transaction Search & Filter
        </h3>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID, merchant, card, or device..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            className="w-full pl-9 pr-10 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 text-sm"
          />
          {filters.searchText && (
            <button
              onClick={() => setFilters({ ...filters, searchText: '' })}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
        >
          <Filter className="w-3 h-3" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 mb-4 space-y-3"
          >
            {/* Bank Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Bank</label>
              <select
                value={filters.bankFilter}
                onChange={(e) => setFilters({ ...filters, bankFilter: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-green-500/50"
              >
                <option value="">All Banks</option>
                <option value="HDFC">HDFC</option>
                <option value="ICICI">ICICI</option>
                <option value="SBI">SBI</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Amount Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: Number(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  max="1000000"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: Number(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

            {/* Risk Score Range */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Risk Score Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.minRisk}
                  onChange={(e) => setFilters({ ...filters, minRisk: Number(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.maxRisk}
                  onChange={(e) => setFilters({ ...filters, maxRisk: Number(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="w-full py-1 bg-slate-700/50 hover:bg-slate-700 text-xs text-gray-300 rounded transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-3">
          Showing <span className="font-bold text-white">{filteredTransactions.length}</span> results
        </p>

        {filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No transactions found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map(tx => (
              <motion.button
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelect(tx)}
                className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-green-500/30 rounded-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-400 group-hover:text-gray-300">{tx.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    tx.riskScore >= 71 ? 'bg-red-500/30 text-red-300'
                    : tx.riskScore >= 31 ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-green-500/30 text-green-300'
                  }`}>
                    {tx.riskScore}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div>
                    <p className="font-semibold">{tx.merchant}</p>
                    <p className="text-gray-500">Card: {tx.card.slice(-4)} • {tx.bank}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{tx.amount.toLocaleString('en-IN')}</p>
                    <p className="text-gray-500">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
