# SecureLink - Architecture & Project Structure

## Project Overview

SecureLink is a modern React-based cross-bank fraud detection system designed for real-time transaction monitoring, fraud pattern analysis, and merchant risk assessment. The architecture is modular, performant, and extensible.

---

## Directory Layout

```
SecureLink/
├── src/
│   ├── components/                    # React UI Components
│   │   ├── BankStream.tsx             # Bank transaction streams
│   │   ├── FederatedLearning.tsx      # Cross-bank learning visualization
│   │   ├── FraudAlert.tsx             # Alert notifications
│   │   ├── FraudGraph.tsx             # D3.js network graph
│   │   ├── FraudRingTimeline.tsx      # Fraud progression timeline ⭐ NEW
│   │   ├── GeolocationMap.tsx         # Geographic heatmap ⭐ NEW
│   │   ├── AnalyticsDashboard.tsx     # Analytics dashboard ⭐ NEW
│   │   ├── TransactionSearch.tsx      # Search & filter interface ⭐ NEW
│   │   ├── TransactionDetail.tsx      # Transaction detail modal
│   │   ├── TransactionCard.tsx        # Individual transaction card
│   │   ├── MetricsBar.tsx             # KPI metrics display
│   │   ├── ParticleBackground.tsx     # Animated background
│   │   ├── JlynDemo.tsx               # Cipher demo modal
│   │   └── SettingsPanel.tsx          # Simulation controls
│   │
│   ├── config/
│   │   └── constants.ts               # Simulation & UI configuration
│   │
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces ⭐ EXTENDED
│   │
│   ├── utils/
│   │   ├── fraudDetection.ts          # Fraud detection engine
│   │   ├── jlynCipher.ts              # Jlyn fingerprinting algorithm
│   │   ├── merchantDatabase.ts        # Merchant risk scoring ⭐ NEW
│   │   └── transactionSimulator.ts    # Transaction generator ⭐ UPDATED
│   │
│   ├── App.tsx                        # Main app component ⭐ UPDATED
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Global styles
│   └── vite-env.d.ts                  # Vite type definitions
│
├── public/
│   └── index.html                     # HTML template
│
├── dist/                              # Build output (gitignored)
├── node_modules/                      # Dependencies (gitignored)
│
├── eslint.config.js                   # ESLint configuration
├── postcss.config.js                  # PostCSS configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript root config
├── tsconfig.app.json                  # TypeScript app config
├── tsconfig.node.json                 # TypeScript node config
├── vite.config.ts                     # Vite build configuration
├── package.json                       # Dependencies & scripts
├── package-lock.json                  # Dependency lock
├── .gitignore                         # Git ignore rules
├── README.md                          # Project documentation
├── ARCHITECTURE.md                    # This file
└── FEATURE_SUMMARY.md                 # Feature overview
```

---

## Component Architecture

### Presentation Layer Components

#### Overview Tab Components
- **BankStream** - Displays real-time transaction feeds per bank (HDFC, ICICI, SBI)
- **FraudGraph** - D3.js network visualization of fraud connections
- **MetricsBar** - Key performance indicators dashboard
- **FederatedLearning** - Cross-bank learning status
- **FraudAlert** - Alert notification popup

#### New Analytics Features ⭐
- **AnalyticsDashboard** - Real-time fraud metrics, distribution charts
- **GeolocationMap** - Geographic fraud heatmap with impossible travel detection
- **FraudRingTimeline** - Chronological fraud progression visualization
- **TransactionSearch** - Advanced filtering and search interface

#### Modal Components
- **TransactionDetail** - Detailed transaction inspection modal
- **JlynDemo** - Interactive cipher algorithm demonstration
- **SettingsPanel** - Simulation controls panel

#### Utility Components
- **ParticleBackground** - Animated particle network background
- **TransactionCard** - Individual transaction display card

### Application Container
- **App.tsx** - Main container with state management and tab navigation
  - Manages global state (transactions, fraud rings, metrics)
  - Handles tab navigation (Overview, Analytics, Geolocation, Timeline, Search)
  - Integrates all components and data flow

---

## Data Layer Architecture

### Type System

#### Core Interfaces (Defined in `src/types/index.ts`)

```typescript
interface Transaction {
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
  location: Geolocation;  // ⭐ NEW
}

interface Geolocation {  // ⭐ NEW
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface FraudRing {
  id: string;
  fingerprint: string;
  transactions: Transaction[];
  timestamp: number;
  banksInvolved: BankName[];
}

interface MerchantProfile {  // ⭐ NEW
  name: string;
  category: string;
  trustScore: number;
  incidentCount: number;
  totalTransactionVolume: number;
  averageTransactionAmount: number;
  lastIncidentTime: number | null;
}

interface AnalyticsData {  // ⭐ NEW
  totalTransactions: number;
  fraudDetectionRate: number;
  fraudByBank: Record<BankName, number>;
  fraudByMerchantCategory: Record<string, number>;
  fraudByTimeOfDay: Record<number, number>;
  averageRiskScore: number;
}

interface Metrics {
  transactionsAnalyzed: number;
  fraudBlocked: number;
  moneySaved: number;
  jlynFingerprintsGenerated: number;
  activeFraudRings: number;
}
```

### Business Logic Layer

#### FraudDetectionEngine (`src/utils/fraudDetection.ts`)
- Maintains rolling window of recent transactions
- Matches Jlyn fingerprints across transactions
- Identifies cross-bank fraud rings (2+ matching transactions from different banks)
- Creates FraudRing entities
- Cleans up stale transactions after 60 seconds

#### Jlyn Cipher (`src/utils/jlynCipher.ts`)
- Generates deterministic transaction fingerprints
- Uses pattern extraction + star map generation + XOR encryption
- Produces hexadecimal fingerprint string
- Secure enough for matching, cannot reverse to transaction details

#### Transaction Simulator (`src/utils/transactionSimulator.ts`)
- **generateTransaction(isFraud, fraudPattern)** - Creates individual transactions
  - Randomly selects bank, merchant, card, device
  - Generates location data ⭐ NEW
  - Calculates risk score based on merchant
  - Applies fraud patterns if specified
- **generateFraudRing()** - Creates 2-3 coordinated fraud transactions
  - Same fingerprint, different banks
  - Different merchants
  - Cross-location fraud patterns ⭐ NEW

#### Merchant Database (`src/utils/merchantDatabase.ts`) ⭐ NEW
- **MerchantRiskDatabase** class tracks 20+ merchants
- **Methods**:
  - `getMerchant(name)` - Get or create merchant profile
  - `recordFraudIncident(name, timestamp)` - Decrement trust, log incident
  - `recordTransaction(name, amount)` - Update volume, increment trust
  - `getHighRiskMerchants()` - Filter merchants with trustScore < 50
- Exports singleton `merchantDatabase` instance

---

## Data Flow Architecture

```
┌─────────────────────────────────────┐
│      App.tsx (State Container)      │
│  - transactions[]                   │
│  - fraudRings[]                     │
│  - metrics{}                        │
│  - activeTab: string                │
└────────────┬────────────────────────┘
             │
      ┌──────┴────────┐
      │               │
      v               v
┌───────────────┐  ┌────────────────────┐
│  Transaction  │  │ FraudDetection     │
│  Simulator    │  │ Engine             │
│  - location   │  │ - fingerprinting   │
│  - fraud ring │  │ - ring detection   │
│  generation   │  │                    │
└───────┬───────┘  └────────┬───────────┘
        │                   │
        └───────────────────┘
                │
                v
    ┌───────────────────────┐
    │  Merchant Database    │
    │ - Trust scoring       │
    │ - Incident tracking   │
    └───────────────────────┘
                │
                v
    ┌───────────────────────────────────────┐
    │     Tab Navigation (Render Layer)     │
    │                                       │
    ├───────────────────────────────────────┤
    │ Overview Tab                          │
    │ ├─ BankStream (3x)                    │
    │ ├─ FraudGraph                         │
    │ └─ FederatedLearning                  │
    │                                       │
    │ Analytics Tab ⭐ NEW                   │
    │ └─ AnalyticsDashboard                 │
    │    (memoized fraud calculations)      │
    │                                       │
    │ Geolocation Tab ⭐ NEW                 │
    │ └─ GeolocationMap                     │
    │    (memoized location aggregation)    │
    │                                       │
    │ Timeline Tab ⭐ NEW                    │
    │ └─ FraudRingTimeline                  │
    │    (memoized transaction grouping)    │
    │                                       │
    │ Search Tab ⭐ NEW                      │
    │ └─ TransactionSearch                  │
    │    (memoized filtering)               │
    └───────────────────────────────────────┘
```

---

## Performance Optimizations

### Component-Level Optimizations
- **React.memo** on all presentation components prevents unnecessary re-renders
- **useMemo** for expensive calculations:
  - Timeline: Transaction grouping by fraud ring
  - Geolocation: Location aggregation and impossible travel detection
  - Analytics: Fraud metrics calculation and sorting

### Algorithm Optimizations
- Transaction windowing: Keep only last 100 transactions in memory
- Squared distance calculations: Avoid expensive `Math.sqrt()` calls
- Efficient Set/Map usage for O(1) lookups

### Rendering Optimizations
- Particle background: O(n²) to O(n·k) optimization
- Flex-shrink and proper overflow handling for list scrolling
- Batch animation transitions with consistent duration

### Memory Management
- Proper cleanup of timers and intervals on component unmount
- Automatic transaction cleanup after 60 seconds in FraudDetectionEngine
- Cached calculation results with array length dependencies (not array references)

---

## State Management

### Global State (in App.tsx)
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [fraudRings, setFraudRings] = useState<FraudRing[]>([]);
const [metrics, setMetrics] = useState<Metrics>({...});
const [currentAlert, setCurrentAlert] = useState<FraudRing | null>(null);
const [showJlynDemo, setShowJlynDemo] = useState(false);
const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
const [simulationSpeed, setSimulationSpeed] = useState(200);
const [isSimulationRunning, setIsSimulationRunning] = useState(true);
const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'geolocation' | 'timeline' | 'search'>('overview');
```

### Singleton Services
- **merchantDatabase** - Global merchant risk tracking
- **detectionEngineRef** - Fraud detection engine reference

### Effects
- **fraudRingTimer** - Generates fraud rings at regular intervals
- **transactionInterval** - Generates regular transactions at configurable speed
- **simulationSpeed** - Adjusts transaction generation frequency

---

## Configuration

### Simulation Parameters (`src/config/constants.ts`)
```typescript
SIMULATION_CONFIG = {
  FRAUD_RING_INTERVAL_MIN: 15000,        // 15 seconds
  FRAUD_RING_INTERVAL_JITTER: 5000,      // +0-5 seconds random
  DEFAULT_TRANSACTION_SPEED: 200,        // ms between transactions
  MIN_TRANSACTION_SPEED: 50,
  MAX_TRANSACTION_SPEED: 5000,
  FINGERPRINT_WINDOW_MS: 60000,          // 60 second window
  FRAUD_ALERT_DISPLAY_TIME: 8000         // 8 seconds
}
```

---

## Component Interface Patterns

### Parent-Child Communication
- **Props drilling** for configuration and data passing
- **Callback functions** for event handling (onTransactionClick, onSelect)
- **Ref forwarding** for D3 visualization (FraudGraph)

### Tab Navigation Pattern
```typescript
{activeTab === 'overview' && <OverviewContent />}
{activeTab === 'analytics' && <AnalyticsDashboard />}
{activeTab === 'geolocation' && <GeolocationMap />}
{activeTab === 'timeline' && <FraudRingTimeline />}
{activeTab === 'search' && <TransactionSearch />}
```

---

## Feature Expansion Guide

### Adding a New Feature

1. **Create Type Definitions**
   - Add interfaces to `src/types/index.ts`
   - Export from type module

2. **Create Business Logic**
   - Add utility function or class in `src/utils/`
   - Keep logic separate from UI

3. **Create Component**
   - Create new `.tsx` file in `src/components/`
   - Use React.memo for performance
   - Use useMemo for expensive calculations
   - Define clear props interface

4. **Integrate into App.tsx**
   - Import component
   - Add state if needed
   - Add to appropriate tab
   - Wire callbacks

5. **Update Documentation**
   - Update README.md with feature description
   - Document component props
   - Add to this ARCHITECTURE.md

---

## Technology Stack Details

### Core Dependencies
- **react** 18.3.1 - UI framework
- **typescript** 5.5.3 - Type safety
- **vite** 5.4.2 - Build tool

### Styling
- **tailwindcss** 3.4.1 - Utility CSS
- **postcss** 8.4.46 - CSS transformation
- **autoprefixer** 10.4.18 - Browser prefixes

### Visualization
- **d3** 7.9.0 - Network graphs
- **framer-motion** 12.34.0 - Animations
- **lucide-react** 0.344.0 - Icons

### Development
- **eslint** 9.9.1 - Code quality
- **typescript-eslint** 8.3.0 - TS linting

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Build & Deployment

### Development
```bash
npm install
npm run dev    # Starts at http://localhost:5173
```

### Production
```bash
npm run build  # Creates optimized build
npm run preview # Preview production build
```

### Quality Assurance
```bash
npm run lint     # Run ESLint
npm run typecheck # Check TypeScript
```

---

## Future Architecture Improvements

1. **State Management Library**
   - Consider Zustand or Redux for complex state

2. **Testing Framework**
   - Add Vitest + React Testing Library
   - Comprehensive unit test coverage

3. **Error Handling**
   - Implement Error Boundaries
   - Add crash reporting

4. **Performance Monitoring**
   - Add Web Vitals tracking
   - Performance budget monitoring

5. **API Integration**
   - Replace simulator with real API
   - WebSocket for real-time updates
   - GraphQL for flexible queries

---

**Last Updated**: February 10, 2026
**Version**: 1.1.0
