// Progress checkpoint: edited 2026-02-10 — incremental work
import { Transaction, BankName, Geolocation } from '../types';
import { generateTransactionFingerprint } from './jlynCipher';

const BANKS: BankName[] = ['HDFC', 'ICICI', 'SBI'];

const LOCATIONS: Geolocation[] = [
  { city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India' },
  { city: 'Delhi', latitude: 28.7041, longitude: 77.1025, country: 'India' },
  { city: 'Bangalore', latitude: 12.9716, longitude: 77.5946, country: 'India' },
  { city: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, country: 'India' },
  { city: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India' },
  { city: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India' },
  { city: 'Pune', latitude: 18.5204, longitude: 73.8567, country: 'India' },
  { city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, country: 'India' }
];

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
  fraudPattern?: { merchant: string; card: string; device: string; amount: number; fraudRingId?: string; location?: Geolocation }
): Transaction {
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
  const timestamp = Date.now();

  let merchant: string;
  let card: string;
  let device: string;
  let amount: number;
  let location: Geolocation;

  if (isFraudScenario && fraudPattern) {
    merchant = fraudPattern.merchant;
    card = fraudPattern.card;
    device = fraudPattern.device;
    amount = fraudPattern.amount + (Math.random() * 1000 - 500);
    location = fraudPattern.location || LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  } else {
    merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    card = generateCardNumber();
    device = generateDeviceId();
    amount = Math.floor(Math.random() * 100000) + 100;
    location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
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
    isFraud: isFraudScenario,
    location
  };
}

export function generateFraudRing(): Transaction[] {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const card = generateCardNumber();
  const device = generateDeviceId();
  const baseAmount = 25000 + Math.floor(Math.random() * 50000);
  const fraudRingId = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Select locations for the fraud ring (different cities for cross-location fraud)
  const selectedLocations = new Set<Geolocation>();
  while (selectedLocations.size < 2 + Math.floor(Math.random() * 2)) {
    selectedLocations.add(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
  }
  const locations = Array.from(selectedLocations);

  const fraudPattern = { merchant, card, device, amount: baseAmount, fraudRingId };

  const transactions: Transaction[] = [];
  // Generate 2-3 transactions across different banks
  const bankCount = 2 + Math.floor(Math.random() * 2);
  
  // Get unique banks by randomly selecting from the bank list
  const selectedBanks = new Set<BankName>();
  while (selectedBanks.size < bankCount) {
    selectedBanks.add(BANKS[Math.floor(Math.random() * BANKS.length)]);
  }

  let locationIdx = 0;
  for (const bank of selectedBanks) {
    const location = locations[locationIdx % locations.length];
    const tx = generateTransaction(true, { ...fraudPattern, location });
    // Override the bank to ensure cross-bank fraud
    (tx as any).bank = bank;
    transactions.push(tx);
    locationIdx++;
  }

  return transactions;
}
