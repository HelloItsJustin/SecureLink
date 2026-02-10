export type BankName = 'HDFC' | 'ICICI' | 'SBI';

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
}

export interface FraudRing {
  id: string;
  fingerprint: string;
  transactions: Transaction[];
  timestamp: number;
  banksInvolved: BankName[];
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
