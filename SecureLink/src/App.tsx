// Progress checkpoint: edited 2026-02-10 — integrated geolocation, merchant risk, timeline, analytics, search (5 new features)
import { useState, useEffect, useRef } from 'react';
import { Zap, Eye } from 'lucide-react';
import { ParticleBackground } from './components/ParticleBackground';
import { MetricsBar } from './components/MetricsBar';
import { BankStream } from './components/BankStream';
import { FraudGraph } from './components/FraudGraph';
import { FederatedLearning } from './components/FederatedLearning';
import { JlynDemo } from './components/JlynDemo';
import { FraudAlert } from './components/FraudAlert';
import { TransactionDetail } from './components/TransactionDetail';
import { SettingsPanel } from './components/SettingsPanel';
import { GeolocationMap } from './components/GeolocationMap';
import { FraudRingTimeline } from './components/FraudRingTimeline';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TransactionSearch } from './components/TransactionSearch';
import { Transaction, Metrics, FraudRing } from './types';
import { generateTransaction, generateFraudRing } from './utils/transactionSimulator';
import { FraudDetectionEngine } from './utils/fraudDetection';
import { merchantDatabase } from './utils/merchantDatabase';
import { SIMULATION_CONFIG } from './config/constants';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudRings, setFraudRings] = useState<FraudRing[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    transactionsAnalyzed: 0,
    fraudBlocked: 0,
    moneySaved: 0,
    jlynFingerprintsGenerated: 0,
    activeFraudRings: 0
  });
  const [currentAlert, setCurrentAlert] = useState<FraudRing | null>(null);
  const [showJlynDemo, setShowJlynDemo] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(SIMULATION_CONFIG.DEFAULT_TRANSACTION_SPEED);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'geolocation' | 'timeline' | 'search'>('overview');

  const detectionEngineRef = useRef(new FraudDetectionEngine());
  const fraudRingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transactionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fraudRingInterval = SIMULATION_CONFIG.FRAUD_RING_INTERVAL_MIN + Math.random() * SIMULATION_CONFIG.FRAUD_RING_INTERVAL_JITTER;

    fraudRingTimerRef.current = setInterval(() => {
      if (!isSimulationRunning) return;
      
      const fraudTransactions = generateFraudRing();

      fraudTransactions.forEach((tx, index) => {
        setTimeout(() => {
          setTransactions(prev => [...prev, tx]);

          const ring = detectionEngineRef.current.addTransaction(tx);

          if (ring && index === fraudTransactions.length - 1) {
            setFraudRings(prev => [...prev, ring]);
            setCurrentAlert(ring);

            // Record fraud incidents in merchant database
            fraudTransactions.forEach(fraudTx => {
              merchantDatabase.recordFraudIncident(fraudTx.merchant, Date.now());
            });

            setMetrics(prev => ({
              ...prev,
              fraudBlocked: prev.fraudBlocked + fraudTransactions.length,
              moneySaved: prev.moneySaved + fraudTransactions.reduce((sum, t) => sum + t.amount, 0),
              activeFraudRings: detectionEngineRef.current.getActiveRingCount()
            }));

            setTimeout(() => setCurrentAlert(null), SIMULATION_CONFIG.FRAUD_ALERT_DISPLAY_TIME);
          }
        }, index * 500);
      });
    }, fraudRingInterval);

    return () => {
      if (fraudRingTimerRef.current) {
        clearInterval(fraudRingTimerRef.current);
      }
    };
  }, [isSimulationRunning]);

  useEffect(() => {
    if (!isSimulationRunning) {
      if (transactionIntervalRef.current) {
        clearInterval(transactionIntervalRef.current);
      }
      return;
    }

    const interval = setInterval(() => {
      const tx = generateTransaction(false);
      setTransactions(prev => [...prev.slice(-99), tx]); // Keep only last 100 transactions

      detectionEngineRef.current.addTransaction(tx);

      // Record legitimate transaction in merchant database
      merchantDatabase.recordTransaction(tx.merchant, tx.amount);

      setMetrics(prev => ({
        ...prev,
        transactionsAnalyzed: prev.transactionsAnalyzed + 1,
        jlynFingerprintsGenerated: prev.jlynFingerprintsGenerated + 1
      }));
    }, simulationSpeed);

    transactionIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [simulationSpeed, isSimulationRunning]);

  const fraudFingerprints = new Set(fraudRings.map(ring => ring.fingerprint));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1435] to-[#0a0e27] text-white overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SecureLink
              </h1>
              <p className="text-sm text-gray-400">Cross-Bank Fraud Detection System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJlynDemo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Jlyn Demo</span>
            </button>
            <SettingsPanel 
              simulationSpeed={simulationSpeed}
              onSpeedChange={setSimulationSpeed}
              isRunning={isSimulationRunning}
              onToggleRun={() => setIsSimulationRunning(!isSimulationRunning)}
            />
          </div>
        </div>

        <MetricsBar metrics={metrics} />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-purple-500/20">
          {['overview', 'analytics', 'geolocation', 'timeline', 'search'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <BankStream
                bank="HDFC"
                transactions={transactions}
                fraudFingerprints={fraudFingerprints}
                onTransactionClick={setSelectedTransaction}
              />
              <BankStream
                bank="ICICI"
                transactions={transactions}
                fraudFingerprints={fraudFingerprints}
                onTransactionClick={setSelectedTransaction}
              />
              <BankStream
                bank="SBI"
                transactions={transactions}
                fraudFingerprints={fraudFingerprints}
                onTransactionClick={setSelectedTransaction}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-[500px]">
                <FraudGraph transactions={transactions} fraudRings={fraudRings} />
              </div>
              <div className="h-[500px]">
                <FederatedLearning fingerprintsShared={metrics.jlynFingerprintsGenerated} />
              </div>
            </div>
          </>
        )}

        {/* Analytics Dashboard Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <AnalyticsDashboard transactions={transactions} fraudRings={fraudRings} />
          </div>
        )}

        {/* Geolocation Map Tab */}
        {activeTab === 'geolocation' && (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <GeolocationMap transactions={transactions} fraudRings={fraudRings} />
          </div>
        )}

        {/* Fraud Ring Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <FraudRingTimeline fraudRings={fraudRings} allTransactions={transactions} />
          </div>
        )}

        {/* Transaction Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <TransactionSearch 
              transactions={transactions}
              onSelect={setSelectedTransaction}
            />
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="inline-block bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-400">
              SecureLink by <span className="text-purple-400 font-semibold">Team Xcalibur</span> | Powered by{' '}
              <span className="text-blue-400 font-semibold">Jlyn Cipher</span>
            </span>
          </div>
        </div>
      </div>

      <JlynDemo isOpen={showJlynDemo} onClose={() => setShowJlynDemo(false)} />
      <FraudAlert ring={currentAlert} onClose={() => setCurrentAlert(null)} />
      <TransactionDetail 
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        isFraudRing={selectedTransaction ? fraudFingerprints.has(selectedTransaction.jlynFingerprint) : false}
      />
    </div>
  );
}

export default App;
