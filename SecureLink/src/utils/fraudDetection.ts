import { Transaction, FraudRing } from '../types';
import { fingerprintsMatch } from './jlynCipher';

const FINGERPRINT_WINDOW_MS = 60000;

export class FraudDetectionEngine {
  private recentTransactions: Transaction[] = [];
  private detectedRings: FraudRing[] = [];

  addTransaction(transaction: Transaction): FraudRing | null {
    this.recentTransactions.push(transaction);

    this.cleanupOldTransactions();

    const matchingTransactions = this.findMatchingFingerprints(transaction);

    if (matchingTransactions.length >= 2) {
      const ring = this.createFraudRing(matchingTransactions);
      this.detectedRings.push(ring);
      return ring;
    }

    return null;
  }

  private findMatchingFingerprints(transaction: Transaction): Transaction[] {
    const matches = [transaction];

    for (const tx of this.recentTransactions) {
      if (tx.id === transaction.id) continue;

      if (fingerprintsMatch(tx.jlynFingerprint, transaction.jlynFingerprint)) {
        if (tx.bank !== transaction.bank) {
          matches.push(tx);
        }
      }
    }

    return matches;
  }

  private createFraudRing(transactions: Transaction[]): FraudRing {
    const uniqueBanks = Array.from(new Set(transactions.map(tx => tx.bank)));

    return {
      id: `RING${Date.now()}${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
      fingerprint: transactions[0].jlynFingerprint,
      transactions,
      timestamp: Date.now(),
      banksInvolved: uniqueBanks
    };
  }

  private cleanupOldTransactions(): void {
    const cutoff = Date.now() - FINGERPRINT_WINDOW_MS;
    this.recentTransactions = this.recentTransactions.filter(
      tx => tx.timestamp > cutoff
    );
  }

  getRecentRings(limit: number = 5): FraudRing[] {
    return this.detectedRings.slice(-limit);
  }

  getActiveRingCount(): number {
    const cutoff = Date.now() - FINGERPRINT_WINDOW_MS;
    return this.detectedRings.filter(ring => ring.timestamp > cutoff).length;
  }
}
