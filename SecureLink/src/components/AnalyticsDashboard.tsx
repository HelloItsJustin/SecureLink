// Progress checkpoint: edited 2026-02-10 — optimized performance with useMemo
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Transaction, FraudRing, AnalyticsData, BankName } from '../types';

interface AnalyticsDashboardProps {
  transactions: Transaction[];
  fraudRings: FraudRing[];
}

const MERCHANT_CATEGORIES: Record<string, string> = {
  'Amazon India': 'E-Commerce',
  'Flipkart': 'E-Commerce',
  'Swiggy': 'Food & Delivery',
  'Zomato': 'Food & Delivery',
  'BookMyShow': 'Entertainment',
  'MakeMyTrip': 'Travel',
  'BigBasket': 'Groceries',
  'PayTM Mall': 'E-Commerce',
  'Myntra': 'Fashion',
  'Ajio': 'Fashion',
  'Nykaa': 'Beauty',
  'FirstCry': 'Baby Products',
  'PVR Cinemas': 'Entertainment',
  'Dominos': 'Food & Dining',
  'Pizza Hut': 'Food & Dining',
  'Starbucks': 'Food & Dining',
  'KFC': 'Food & Dining',
  'McDonald\'s': 'Food & Dining',
  'Uber India': 'Transport',
  'Ola Cabs': 'Transport'
};

function generateAnalytics(transactions: Transaction[], fraudRings: FraudRing[]): AnalyticsData {
  const fraudFingerprints = new Set(fraudRings.map(r => r.fingerprint));
  const fraudTransactions = transactions.filter(tx => fraudFingerprints.has(tx.jlynFingerprint));

  const fraudByBank: Record<BankName, number> = { HDFC: 0, ICICI: 0, SBI: 0 };
  const fraudByCategory: Record<string, number> = {};
  const fraudByHour: Record<number, number> = {};

  fraudTransactions.forEach(tx => {
    fraudByBank[tx.bank]++;
    const category = MERCHANT_CATEGORIES[tx.merchant] || 'Other';
    fraudByCategory[category] = (fraudByCategory[category] || 0) + 1;

    const hour = new Date(tx.timestamp).getHours();
    fraudByHour[hour] = (fraudByHour[hour] || 0) + 1;
  });

  return {
    totalTransactions: transactions.length,
    fraudDetectionRate: (fraudTransactions.length / transactions.length) * 100,
    fraudByBank,
    fraudByMerchantCategory: fraudByCategory,
    fraudByTimeOfDay: fraudByHour,
    averageRiskScore: transactions.reduce((sum, tx) => sum + tx.riskScore, 0) / transactions.length
  };
}

export const AnalyticsDashboard = memo(function AnalyticsDashboard({ transactions, fraudRings }: AnalyticsDashboardProps) {
  // Memoize analytics calculation to prevent expensive recalculation
  const analytics = useMemo(() => generateAnalytics(transactions, fraudRings), [transactions.length, fraudRings.length]);

  const topFraudCategories = useMemo(
    () => Object.entries(analytics.fraudByMerchantCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
    [analytics]
  );

  const peakFraudHours = useMemo(
    () => Object.entries(analytics.fraudByTimeOfDay)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2),
    [analytics]
  );

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-indigo-500/20 p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Advanced Analytics
        </h3>
        <p className="text-xs text-gray-400">Real-time fraud patterns & statistics</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3"
          >
            <p className="text-xs text-gray-400 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{analytics.totalTransactions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
          >
            <p className="text-xs text-gray-400 mb-1">Fraud Detection Rate</p>
            <p className="text-2xl font-bold text-red-300">{analytics.fraudDetectionRate.toFixed(2)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3"
          >
            <p className="text-xs text-gray-400 mb-1">Avg Risk Score</p>
            <p className="text-2xl font-bold text-yellow-300">{analytics.averageRiskScore.toFixed(1)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
          >
            <p className="text-xs text-gray-400 mb-1">Fraud Rings Detected</p>
            <p className="text-2xl font-bold text-green-300">{fraudRings.length}</p>
          </motion.div>
        </div>

        {/* Fraud by Bank */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
        >
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            Fraud Distribution by Bank
          </h4>
          <div className="space-y-2">
            {Object.entries(analytics.fraudByBank).map(([bank, count]) => (
              <div key={bank}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-300 font-semibold">{bank}</span>
                  <span className="text-white font-bold">{count} incidents</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    style={{
                      width: `${(count / Math.max(1, Object.values(analytics.fraudByBank).reduce((a, b) => Math.max(a, b)))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Fraud Categories */}
        {topFraudCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
          >
            <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Top Fraud Categories
            </h4>
            <div className="space-y-2">
              {topFraudCategories.map(([category, count], idx) => (
                <div key={category} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">#{idx + 1} {category}</span>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded font-bold">
                    {count} cases
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Peak Fraud Hours */}
        {peakFraudHours.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
          >
            <h4 className="text-white font-bold text-sm mb-2">Peak Fraud Hours</h4>
            <div className="space-y-1 text-xs">
              {peakFraudHours.map(([hour, count]) => (
                <p key={hour} className="text-gray-300">
                  <span className="font-semibold">{hour}:00 - {(parseInt(hour) + 1) % 24}:00</span>: {count} incidents
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});
