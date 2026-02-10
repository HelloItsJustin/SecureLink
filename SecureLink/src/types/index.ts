// Progress checkpoint: edited 2026-02-10 — incremental work
export type BankName = 'HDFC' | 'ICICI' | 'SBI';

export interface Geolocation {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface Transaction {
  id: string;
  bank: BankName;
  amount: number;
  timestamp: number;
  merchant: string;
  card: string;
  device: string;
  riskScore: number;
  jlynFingerprint: string;
  aiReasoning: string[];
  isFraud: boolean;
  location: Geolocation;
}

export interface FraudRing {
  id: string;
  fingerprint: string;
  transactions: Transaction[];
  timestamp: number;
  banksInvolved: BankName[];
}

export interface MerchantProfile {
  name: string;
  category: string;
  trustScore: number; // 0-100
  incidentCount: number;
  totalTransactionVolume: number;
  averageTransactionAmount: number;
  lastIncidentTime: number | null;
}

export interface AnalyticsData {
  totalTransactions: number;
  fraudDetectionRate: number; // percentage
  fraudByBank: Record<BankName, number>;
  fraudByMerchantCategory: Record<string, number>;
  fraudByTimeOfDay: Record<number, number>;
  averageRiskScore: number;
}

export interface GraphNode {
  id: string;
  type: 'card' | 'merchant' | 'device';
  label: string;
  bank: BankName;
  transactionCount: number;
  totalAmount: number;
  riskScore: number;
}

export interface GraphLink {
  source: string;
  target: string;
  fingerprint: string;
  weight: number;
}

export interface Metrics {
  transactionsAnalyzed: number;
  fraudBlocked: number;
  moneySaved: number;
  jlynFingerprintsGenerated: number;
  activeFraudRings: number;
}
