// Progress checkpoint: edited 2026-02-10 — incremental work
import { MerchantProfile } from '../types';

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

class MerchantRiskDatabase {
  private merchants: Map<string, MerchantProfile> = new Map();

  constructor() {
    this.initializeMerchants();
  }

  private initializeMerchants() {
    Object.entries(MERCHANT_CATEGORIES).forEach(([name, category]) => {
      this.merchants.set(name, {
        name,
        category,
        trustScore: 75 + Math.random() * 25, // 75-100 baseline
        incidentCount: Math.floor(Math.random() * 5),
        totalTransactionVolume: Math.floor(Math.random() * 10000) + 1000,
        averageTransactionAmount: Math.floor(Math.random() * 50000) + 5000,
        lastIncidentTime: null
      });
    });
  }

  getMerchant(name: string): MerchantProfile {
    if (!this.merchants.has(name)) {
      this.merchants.set(name, {
        name,
        category: 'Other',
        trustScore: 60,
        incidentCount: 0,
        totalTransactionVolume: 0,
        averageTransactionAmount: 0,
        lastIncidentTime: null
      });
    }
    return this.merchants.get(name)!;
  }

  recordFraudIncident(merchantName: string, timestamp: number) {
    const merchant = this.getMerchant(merchantName);
    merchant.incidentCount++;
    merchant.trustScore = Math.max(0, merchant.trustScore - 10);
    merchant.lastIncidentTime = timestamp;
  }

  recordTransaction(merchantName: string, amount: number) {
    const merchant = this.getMerchant(merchantName);
    merchant.totalTransactionVolume++;
    merchant.averageTransactionAmount = 
      (merchant.averageTransactionAmount + amount) / 2;
    merchant.trustScore = Math.min(100, merchant.trustScore + 0.1);
  }

  getAllMerchants(): MerchantProfile[] {
    return Array.from(this.merchants.values());
  }

  getMerchantsByTrustScore(): MerchantProfile[] {
    return this.getAllMerchants().sort((a, b) => a.trustScore - b.trustScore);
  }

  getHighRiskMerchants(): MerchantProfile[] {
    return this.getAllMerchants().filter(m => m.trustScore < 50);
  }
}

export const merchantDatabase = new MerchantRiskDatabase();
