import { Transaction, BankName } from '../types';
import { generateTransactionFingerprint } from './jlynCipher';

const BANKS: BankName[] = ['HDFC', 'ICICI', 'SBI'];

const MERCHANTS = [
  'Amazon India',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'BookMyShow',
  'MakeMyTrip',
  'BigBasket',
  'PayTM Mall',
  'Myntra',
  'Ajio',
  'Nykaa',
  'FirstCry',
  'PVR Cinemas',
  'Dominos',
  'Pizza Hut',
  'Starbucks',
  'KFC',
  'McDonald\'s',
  'Uber India',
  'Ola Cabs'
];

const AI_REASONING_SAFE = [
  'Transaction amount within normal range',
  'Merchant has good reputation score',
  'Device fingerprint matches historical pattern',
  'Location consistent with user profile',
  'Time of transaction aligns with user behavior'
];

const AI_REASONING_SUSPICIOUS = [
  'Unusual spending pattern detected',
  'New merchant not in user history',
  'Device fingerprint partially matches known fraud',
  'Transaction velocity elevated',
  'Amount slightly above average threshold'
];

const AI_REASONING_FRAUD = [
  'Device fingerprint matches known fraud ring',
  'Transaction pattern identical to flagged activity',
  'Multiple rapid transactions across merchants',
  'Location anomaly detected',
  'Card used in impossible travel scenario',
  'Jlyn fingerprint collision with flagged transaction'
];

function generateCardNumber(): string {
  const prefix = Math.random() > 0.5 ? '4' : '5';
  return prefix + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateDeviceId(): string {
  return 'DEV' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function calculateRiskScore(
  amount: number,
  merchant: string,
  isFraudScenario: boolean
): { score: number; reasoning: string[] } {
  if (isFraudScenario) {
    return {
      score: 71 + Math.floor(Math.random() * 29),
      reasoning: AI_REASONING_FRAUD.slice(0, 3 + Math.floor(Math.random() * 3))
    };
  }

  if (amount > 50000 || Math.random() > 0.85) {
    return {
      score: 31 + Math.floor(Math.random() * 40),
      reasoning: AI_REASONING_SUSPICIOUS.slice(0, 2 + Math.floor(Math.random() * 3))
    };
  }

  return {
    score: Math.floor(Math.random() * 31),
    reasoning: AI_REASONING_SAFE.slice(0, 2 + Math.floor(Math.random() * 3))
  };
}

export function generateTransaction(
  isFraudScenario: boolean = false,
  fraudPattern?: { merchant: string; card: string; device: string; amount: number; fraudRingId?: string }
): Transaction {
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
  const timestamp = Date.now();

  let merchant: string;
  let card: string;
  let device: string;
  let amount: number;

  if (isFraudScenario && fraudPattern) {
    merchant = fraudPattern.merchant;
    card = fraudPattern.card;
    device = fraudPattern.device;
    amount = fraudPattern.amount + (Math.random() * 1000 - 500);
  } else {
    merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    card = generateCardNumber();
    device = generateDeviceId();
    amount = Math.floor(Math.random() * 100000) + 100;
  }

  // For fraud rings, use the fraud ring ID to ensure matching fingerprints
  let fingerprint: string;
  if (isFraudScenario && fraudPattern?.fraudRingId) {
    const { fingerprint: fp } = generateTransactionFingerprint(
      fraudPattern.amount,
      0, // Use 0 timestamp so all fraud ring transactions match
      merchant,
      card
    );
    fingerprint = fp;
  } else {
    const { fingerprint: fp } = generateTransactionFingerprint(amount, timestamp, merchant, card);
    fingerprint = fp;
  }

  const { score, reasoning } = calculateRiskScore(amount, merchant, isFraudScenario);

  return {
    id: `TXN${timestamp}${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
    bank,
    amount: Math.round(amount),
    timestamp,
    merchant,
    card,
    device,
    riskScore: score,
    jlynFingerprint: fingerprint,
    aiReasoning: reasoning,
    isFraud: isFraudScenario
  };
}

export function generateFraudRing(): Transaction[] {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const card = generateCardNumber();
  const device = generateDeviceId();
  const baseAmount = 25000 + Math.floor(Math.random() * 50000);
  const fraudRingId = Math.random().toString(36).substring(2, 8).toUpperCase();

  const fraudPattern = { merchant, card, device, amount: baseAmount, fraudRingId };

  const transactions: Transaction[] = [];
  // Generate 2-3 transactions across different banks
  const bankCount = 2 + Math.floor(Math.random() * 2);
  
  // Get unique banks by randomly selecting from the bank list
  const selectedBanks = new Set<BankName>();
  while (selectedBanks.size < bankCount) {
    selectedBanks.add(BANKS[Math.floor(Math.random() * BANKS.length)]);
  }

  for (const bank of selectedBanks) {
    const tx = generateTransaction(true, fraudPattern);
    // Override the bank to ensure cross-bank fraud
    (tx as any).bank = bank;
    transactions.push(tx);
  }

  return transactions;
}
