/**
 * Configuration constants for SecureLink
 */

export const SIMULATION_CONFIG = {
  FRAUD_RING_INTERVAL_MIN: 30000,
  FRAUD_RING_INTERVAL_JITTER: 15000,
  DEFAULT_TRANSACTION_SPEED: 800,
  MIN_TRANSACTION_SPEED: 200,
  MAX_TRANSACTION_SPEED: 2000,
  FINGERPRINT_WINDOW_MS: 120000,
  FRAUD_ALERT_DISPLAY_TIME: 8000,
};

export const UI_CONFIG = {
  PARTICLE_COUNT: 50,
  PARTICLE_CONNECTION_DISTANCE: 150,
  PARTICLE_OPACITY: 0.5,
  GRAPH_NODE_DISTANCE: 80,
  GRAPH_CHARGE_STRENGTH: -200,
  GRAPH_COLLISION_RADIUS: 20,
};

export const BANK_CONFIG = {
  HDFC: { color: '#004C8F', gradient: 'from-blue-600 to-blue-800' },
  ICICI: { color: '#F15A29', gradient: 'from-orange-600 to-red-700' },
  SBI: { color: '#22409A', gradient: 'from-green-600 to-emerald-800' },
};

export const RISK_LEVELS = {
  HIGH: { threshold: 71, color: 'pink', bgGradient: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/50' },
  MEDIUM: { threshold: 31, color: 'yellow', bgGradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/50' },
  LOW: { threshold: 0, color: 'green', bgGradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/50' },
};

export const MERCHANTS = [
  'Amazon India', 'Flipkart', 'Swiggy', 'Zomato', 'BookMyShow',
  'MakeMyTrip', 'BigBasket', 'PayTM Mall', 'Myntra', 'Ajio',
  'Nykaa', 'FirstCry', 'PVR Cinemas', 'Dominos', 'Pizza Hut',
  'Starbucks', 'KFC', 'McDonald\'s', 'Uber India', 'Ola Cabs'
];

export const AI_REASONING = {
  SAFE: [
    'Transaction amount within normal range',
    'Merchant has good reputation score',
    'Device fingerprint matches historical pattern',
    'Location consistent with user profile',
    'Time of transaction aligns with user behavior'
  ],
  SUSPICIOUS: [
    'Unusual spending pattern detected',
    'New merchant not in user history',
    'Device fingerprint partially matches known fraud',
    'Transaction velocity elevated',
    'Amount slightly above average threshold'
  ],
  FRAUD: [
    'Device fingerprint matches known fraud ring',
    'Transaction pattern identical to flagged activity',
    'Multiple rapid transactions across merchants',
    'Location anomaly detected',
    'Card used in impossible travel scenario',
    'Jlyn fingerprint collision with flagged transaction'
  ]
};
