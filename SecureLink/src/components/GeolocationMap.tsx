// Progress checkpoint: edited 2026-02-11 — interactive map with Leaflet and enhanced markers
import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, Zap, X, TrendingUp } from 'lucide-react';
import { Transaction, FraudRing } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  transactionDetails: Transaction[];
}

interface SelectedLocation {
  city: string;
  lat: number;
  lng: number;
  data: MapLocation;
}

// Custom marker icons with enhanced visual design
const createMarkerIcon = (riskLevel: 'low' | 'medium' | 'high', count: number) => {
  const colors = {
    low: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    medium: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    high: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
  };
  
  const color = colors[riskLevel];
  const size = Math.min(50, 28 + Math.log(count + 1) * 4);
  const emoji = riskLevel === 'high' ? '⚠️' : riskLevel === 'medium' ? '⚡' : '✓';
  
  return L.divIcon({
    className: 'custom-marker-enhanced',
    html: `<div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));"><div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color.glow}; animation: pulse-glow 2s ease-in-out infinite;"></div><div style="position: absolute; width: 85%; height: 85%; border-radius: 50%; background: linear-gradient(135deg, ${color.primary}, ${color.primary}dd); border: 3px solid white; box-shadow: 0 0 20px ${color.glow}, inset 0 0 10px rgba(255,255,255,0.3);"><div style="position: absolute; top: 2px; left: 2px; width: 30%; height: 30%; border-radius: 50%; background: rgba(255,255,255,0.4);"></div><div style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: ${size * 0.35}px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${emoji}</div></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)]
  });
};

export const GeolocationMap = memo(function GeolocationMap({ transactions, fraudRings }: GeolocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Memoize all calculations to prevent recalculation on every render
  const locationData = useMemo(() => {
    const fraudFingerprints = new Set(fraudRings.filter(r => r && r.fingerprint).map(r => r.fingerprint));
    const locationStats: Map<string, MapLocation> = new Map();

    // Aggregate locations
    transactions.forEach(tx => {
      if (!tx || !tx.location) return;
      
      const city = tx.location.city;
      if (!locationStats.has(city)) {
        locationStats.set(city, {
          city,
          lat: tx.location.latitude,
          lng: tx.location.longitude,
          count: 0,
          fraudCount: 0,
          riskLevel: 'low',
          transactionDetails: []
        });
      }

      const loc = locationStats.get(city)!;
      loc.count++;
      loc.transactionDetails.push(tx);
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
  }, [transactions, fraudRings]);

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
        const timeDiff = locations[i].timestamp - locations[i - 1].timestamp;
        if (timeDiff < 300000) { // 5 minutes
          if (locations[i].city !== locations[i - 1].city) return true;
        }
      }
      return false;
    });
  }, [transactions]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map);

    mapInstance.current = map;

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers and connections when location data changes
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        // Ignore removal errors
      }
    });
    markersRef.current = [];
    
    try {
      mapInstance.current.eachLayer(layer => {
        if (layer instanceof L.CircleMarker && !(layer instanceof L.Marker)) {
          mapInstance.current!.removeLayer(layer);
        }
      });
    } catch (e) {
      // Ignore errors during layer removal
    }

    // Add new markers and circles
    if (locationData && locationData.length > 0) {
      locationData.forEach(loc => {
        try {
          if (!loc || !loc.lat || !loc.lng) return;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(loc.riskLevel, loc.count)
      }).bindPopup(`
        <div style="background: rgba(15, 23, 42, 0.95); color: white; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem;">
          <p style="font-weight: bold; margin: 0 0 0.5rem 0;">${loc.city}</p>
          <p style="margin: 0.25rem 0; color: #cbd5e1;">Txns: <span style="color: white; font-weight: 600;">${loc.count}</span></p>
          <p style="margin: 0.25rem 0; color: #cbd5e1;">Fraud: <span style="color: #f87171; font-weight: 600;">${loc.fraudCount}</span></p>
          <p style="margin: 0.25rem 0; color: #cbd5e1;">Rate: <span style="color: white; font-weight: 600;">${((loc.fraudCount / loc.count) * 100).toFixed(1)}%</span></p>
        </div>
      `).on('click', () => {
        setSelectedLocation({ city: loc.city, lat: loc.lat, lng: loc.lng, data: loc });
      }).on('mouseover', () => {
        setHoveredCity(loc.city);
      }).on('mouseout', () => {
        setHoveredCity(null);
      }).addTo(mapInstance.current!);

      markersRef.current.push(marker);

      // Add enhanced heatmap circle
      const fraudRate = loc.fraudCount / loc.count;
      const radius = Math.sqrt(loc.count) * 2.5;
      const color = loc.riskLevel === 'high' 
        ? '#ef4444' 
        : loc.riskLevel === 'medium' 
        ? '#f59e0b'
        : '#10b981';

      // Outer animated ring
      L.circleMarker([loc.lat, loc.lng], {
        radius: radius + 5,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 1,
        opacity: 0.3,
        color: color,
        dashArray: '3, 3',
        className: 'heatmap-ring-outer'
      }).addTo(mapInstance.current!);

          // Main heatmap circle with gradient effect
          L.circleMarker([loc.lat, loc.lng], {
            radius,
            fillColor: color,
            fillOpacity: 0.25 + (fraudRate * 0.6),
            weight: 2,
            opacity: hoveredCity === loc.city ? 0.9 : 0.6,
            color: color
          }).addTo(mapInstance.current!);
        } catch (e) {
          console.error('Error adding marker:', e);
        }
      });
    }
  }, [locationData, hoveredCity]);

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-indigo-500/20 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-indigo-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Geolocation Heatmap
          </h3>
          {impossibleTravelDetected && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
              <Zap className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-300 font-semibold">Impossible Travel</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">{locationData.length} cities • {transactions.length} transactions</p>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Map Section */}
        <div ref={mapRef} className="flex-1 rounded-lg overflow-hidden border border-indigo-500/20 bg-slate-800/30 min-h-0" style={{ minHeight: '600px' }} />

        {/* Stats Sidebar */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-500/20">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Risk Hotspots
            </h4>
            <div className="space-y-2">
              {locationData.map(loc => {
                const fraudRate = loc.fraudCount / loc.count;
                const riskBgColor = loc.riskLevel === 'high' 
                  ? 'from-red-500/20 border-red-500/30' 
                  : loc.riskLevel === 'medium' 
                  ? 'from-yellow-500/20 border-yellow-500/30'
                  : 'from-green-500/20 border-green-500/30';

                return (
                  <motion.button
                    key={loc.city}
                    onClick={() => setSelectedLocation({
                      city: loc.city,
                      lat: loc.lat,
                      lng: loc.lng,
                      data: loc
                    })}
                    onHoverStart={() => setHoveredCity(loc.city)}
                    onHoverEnd={() => setHoveredCity(null)}
                    whileHover={{ x: 4 }}
                    className={`w-full bg-gradient-to-r ${riskBgColor} to-slate-800/30 border rounded-lg p-2.5 text-left transition-all ${
                      selectedLocation?.city === loc.city ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-sm font-bold text-white">{loc.city}</h5>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        loc.riskLevel === 'high' ? 'bg-red-500/30 text-red-300'
                        : loc.riskLevel === 'medium' ? 'bg-yellow-500/30 text-yellow-300'
                        : 'bg-green-500/30 text-green-300'
                      }`}>
                        {loc.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-xs text-gray-400">
                      <p>Txns: <span className="text-white font-semibold">{loc.count}</span></p>
                      <p>Fraud: <span className="text-red-400 font-semibold">{loc.fraudCount}</span> ({(fraudRate * 100).toFixed(1)}%)</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {impossibleTravelDetected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300">
            Impossible travel detected: same card used in multiple cities within 5 minutes.
          </p>
        </motion.div>
      )}

      {/* Location Details Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLocation(null)}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto scrollbar-hide"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Escape') setSelectedLocation(null);
              }}
              tabIndex={0}
            >
              <div className="sticky top-0 bg-slate-900 border-b border-indigo-500/20 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLocation.city}</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Overview Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedLocation.data.count}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-500/20">
                    <p className="text-xs text-gray-400 mb-1">Fraudulent</p>
                    <p className="text-2xl font-bold text-red-400">{selectedLocation.data.fraudCount}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-indigo-500/20">
                    <p className="text-xs text-gray-400 mb-1">Fraud Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {((selectedLocation.data.fraudCount / selectedLocation.data.count) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Transaction List */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    Recent Transactions
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {selectedLocation.data.transactionDetails.slice(0, 10).map((tx, idx) => {
                      return (
                        <div key={idx} className="bg-slate-800/30 border border-indigo-500/20 rounded-lg p-2.5 text-xs">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-mono font-semibold text-white">{tx.card.slice(-4).toUpperCase()}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/30 text-green-300">
                              ✓ VALID
                            </span>
                          </div>
                          <p className="text-gray-400 mb-1">{tx.merchant}</p>
                          <div className="flex items-center justify-between text-gray-500">
                            <span>₹{(tx.amount / 100).toFixed(2)}</span>
                            <span className="text-xs">{new Date(tx.timestamp).toLocaleString('en-IN').split(',')[1]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
