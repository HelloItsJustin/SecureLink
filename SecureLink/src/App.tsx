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
import { FraudRingDetails } from './components/FraudRingDetails';
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
        {/* Fancy SecureDoc Header */}
        <div className="mb-8 float-animation">
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 rounded-2xl blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-2xl" />
            
            {/* Main content */}
            <div className="relative px-8 py-8 border border-purple-500/30 rounded-2xl bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-lg header-glow">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left side - Logo and Text */}
                <div className="flex items-center gap-5 flex-1">
                  <div className="relative logo-glow">
                    {/* Logo glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75" />
                    <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                      SecureLink
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                      <p className="text-sm md:text-base text-gray-300 font-medium">Advanced Cross-Bank Fraud Detection</p>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Powered by Jlyn Cipher • Real-time Protection</p>
                  </div>
                </div>

                {/* Right side - Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowJlynDemo(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/30 to-blue-500/30 hover:from-purple-500/50 hover:to-blue-500/50 border border-purple-500/50 hover:border-purple-500/80 rounded-lg transition-all duration-300 group shadow-lg hover:shadow-purple-500/20"
                  >
                    <Eye className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-semibold whitespace-nowrap">Jlyn Demo</span>
                  </button>
                  <SettingsPanel 
                    simulationSpeed={simulationSpeed}
                    onSpeedChange={setSimulationSpeed}
                    isRunning={isSimulationRunning}
                    onToggleRun={() => setIsSimulationRunning(!isSimulationRunning)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <MetricsBar metrics={metrics} />

        {/* Tab Navigation */}
        <div className="relative mb-8">
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
            {['overview', 'analytics', 'geolocation', 'timeline', 'search'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative px-4 py-3 font-semibold whitespace-nowrap transition-all duration-300 text-sm md:text-base ${
                  activeTab === tab
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500/20 via-purple-500/0 to-purple-500/20" />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[500px] rounded-xl overflow-hidden border border-purple-500/20">
                <FraudGraph transactions={transactions} fraudRings={fraudRings} />
              </div>
              <div className="h-[500px] rounded-xl overflow-hidden border border-purple-500/20">
                <FederatedLearning fingerprintsShared={metrics.jlynFingerprintsGenerated} />
              </div>
            </div>
          </>
        )}

        {/* Analytics Dashboard Tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fadeIn bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 min-h-screen">
            <AnalyticsDashboard transactions={transactions} fraudRings={fraudRings} />
          </div>
        )}

        {/* Geolocation Map Tab */}
        {activeTab === 'geolocation' && (
          <div className="animate-fadeIn bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 min-h-screen">
            <GeolocationMap transactions={transactions} fraudRings={fraudRings} />
          </div>
        )}

        {/* Fraud Ring Details Tab */}
        {activeTab === 'timeline' && (
          <div className="animate-fadeIn bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 min-h-screen">
            <FraudRingDetails fraudRings={fraudRings} allTransactions={transactions} />
          </div>
        )}

        {/* Transaction Search Tab */}
        {activeTab === 'search' && (
          <div className="animate-fadeIn bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 min-h-screen">
            <TransactionSearch 
              transactions={transactions}
              onSelect={setSelectedTransaction}
            />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-purple-500/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 p-4 rounded-lg bg-gradient-to-r from-slate-900/40 via-slate-800/30 to-slate-900/40">
            <div>
              <span>SecureLink by <span className="text-purple-400 font-semibold">Team Xcalibur</span></span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-purple-500/20" />
            <div>
              <span>Powered by <span className="text-blue-400 font-semibold">Jlyn Cipher</span></span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-purple-500/20" />
            <div>
              <span>v1.0 • Real-time & Secure</span>
            </div>
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
