// Progress checkpoint: edited 2026-02-10 — optimized performance with useMemo
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Zap } from 'lucide-react';
import { Transaction, FraudRing } from '../types';

interface GeolocationMapProps {
  transactions: Transaction[];
  fraudRings: FraudRing[];
}

interface MapLocation {
  city: string;
  lat: number;
  lng: number;
  count: number;
  fraudCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Simulated India map locations (normalized to canvas coordinates)
const LOCATION_MAP: Record<string, { lat: number; lng: number; display: string }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777, display: 'Mumbai' },
  'Delhi': { lat: 28.7041, lng: 77.1025, display: 'Delhi' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, display: 'Bangalore' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, display: 'Hyderabad' },
  'Chennai': { lat: 13.0827, lng: 80.2707, display: 'Chennai' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, display: 'Kolkata' },
  'Pune': { lat: 18.5204, lng: 73.8567, display: 'Pune' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, display: 'Ahmedabad' }
};

export const GeolocationMap = memo(function GeolocationMap({ transactions, fraudRings }: GeolocationMapProps) {
  // Memoize all calculations to prevent recalculation on every render
  const locationData = useMemo(() => {
    const fraudFingerprints = new Set(fraudRings.map(r => r.fingerprint));
    const locationStats: Map<string, MapLocation> = new Map();

    // Aggregate locations
    transactions.forEach(tx => {
      const city = tx.location.city;
      if (!locationStats.has(city)) {
        locationStats.set(city, {
          city,
          lat: tx.location.latitude,
          lng: tx.location.longitude,
          count: 0,
          fraudCount: 0,
          riskLevel: 'low'
        });
      }

      const loc = locationStats.get(city)!;
      loc.count++;
      if (fraudFingerprints.has(tx.jlynFingerprint)) {
        loc.fraudCount++;
      }

      // Determine risk level
      const fraudRate = loc.fraudCount / loc.count;
      if (fraudRate > 0.3) loc.riskLevel = 'high';
      else if (fraudRate > 0.1) loc.riskLevel = 'medium';
      else loc.riskLevel = 'low';
    });

    return Array.from(locationStats.values()).sort((a, b) => b.count - a.count);
  }, [transactions.length, fraudRings.length]);

  // Memoize impossible travel detection
  const impossibleTravelDetected = useMemo(() => {
    const cardLocations: Map<string, { city: string; timestamp: number }[]> = new Map();
    transactions.forEach(tx => {
      if (!cardLocations.has(tx.card)) {
        cardLocations.set(tx.card, []);
      }
      cardLocations.get(tx.card)!.push({ city: tx.location.city, timestamp: tx.timestamp });
    });

    return Array.from(cardLocations.values()).some(locations => {
      for (let i = 1; i < locations.length; i++) {
        const prevLoc = LOCATION_MAP[locations[i - 1].city];
        const currLoc = LOCATION_MAP[locations[i].city];
        const timeDiff = locations[i].timestamp - locations[i - 1].timestamp;

        if (timeDiff < 300000) { // 5 minutes
          if (prevLoc && currLoc) {
            const distance = Math.sqrt(
              Math.pow(currLoc.lat - prevLoc.lat, 2) + Math.pow(currLoc.lng - prevLoc.lng, 2)
            );
            if (distance > 1) return true; // Impossible travel
          }
        }
      }
      return false;
    });
  }, [transactions.length]);

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-indigo-500/20 p-5 flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Geolocation Heatmap
          </h3>
          {impossibleTravelDetected && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
              <Zap className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-300 font-semibold">Impossible Travel Detected</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">{locationData.length} cities • {transactions.length} transactions</p>
      </div>

      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {locationData.map(loc => {
            const fraudRate = loc.fraudCount / loc.count;
            const riskColor = loc.riskLevel === 'high' 
              ? 'from-red-500/20 border-red-500/30' 
              : loc.riskLevel === 'medium' 
              ? 'from-yellow-500/20 border-yellow-500/30'
              : 'from-green-500/20 border-green-500/30';

            return (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-gradient-to-r ${riskColor} to-slate-800/30 border rounded-lg p-3 flex-shrink-0`}
              >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-bold">{loc.city}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      loc.riskLevel === 'high' ? 'bg-red-500/30 text-red-300'
                      : loc.riskLevel === 'medium' ? 'bg-yellow-500/30 text-yellow-300'
                      : 'bg-green-500/30 text-green-300'
                    }`}>
                      {loc.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <p>Transactions: <span className="font-semibold text-white">{loc.count}</span></p>
                    <p>Fraud Detected: <span className="font-semibold text-red-400">{loc.fraudCount}</span></p>
                    <p>Fraud Rate: <span className="font-semibold">{(fraudRate * 100).toFixed(1)}%</span></p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {impossibleTravelDetected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300">
            Detected impossible travel patterns: same card used in multiple cities within 5 minutes, exceeding physical travel distance.
          </p>
        </motion.div>
      )}
    </div>
  );
});
