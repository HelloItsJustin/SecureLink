// Progress checkpoint: edited 2026-02-10 — incremental work
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Lock, Fingerprint, ArrowRight, CheckCircle } from 'lucide-react';
import { encryptPattern, JlynFingerprint } from '../utils/jlynCipher';

interface JlynDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JlynDemo({ isOpen, onClose }: JlynDemoProps) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<JlynFingerprint | null>(null);

  const sampleData = '25000-1707561234-Amazon India-4532123456789012';

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setResult(null);
      return;
    }

    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep(1); // Step 1: Extract Pattern

      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(2); // Step 2: Generate Star Map

      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(3); // Step 3: Apply Encryption

      await new Promise(resolve => setTimeout(resolve, 500));
      const encrypted = encryptPattern(sampleData);
      setResult(encrypted); //Ensure result is set before showing final step
      setStep(4);
    };

    sequence();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl p-6 max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Jlyn Cipher Live Demo</h3>
                <p className="text-sm text-gray-400">Real-time transaction fingerprinting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step >= 1 ? 1 : 0.3, x: 0 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                {step >= 1 && <CheckCircle className="w-4 h-4 text-green-500" />}
                <span className="text-sm font-semibold text-blue-400">Step 1: Extract Pattern</span>
              </div>
              <div className="font-mono text-xs text-gray-300 break-all">
                {sampleData}
              </div>
            </motion.div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step >= 2 ? 1 : 0.3, x: 0 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                {step >= 2 && <CheckCircle className="w-4 h-4 text-green-500" />}
                <span className="text-sm font-semibold text-purple-400">Step 2: Generate Star Map</span>
              </div>
              {result && (
                <div className="font-mono text-xs text-gray-300 grid grid-cols-8 gap-1">
                  {result.starMap.map((val, idx) => (
                    <div key={idx} className="bg-purple-500/20 px-2 py-1 rounded text-center">
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-purple-400" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step >= 3 ? 1 : 0.3, x: 0 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-pink-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                {step >= 3 && <CheckCircle className="w-4 h-4 text-green-500" />}
                <span className="text-sm font-semibold text-pink-400">Step 3: Apply Encryption</span>
              </div>
              <div className="text-xs text-gray-400">
                XOR operation with deterministic shuffle...
              </div>
            </motion.div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-pink-400" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: step >= 4 ? 1 : 0.3, scale: step >= 4 ? 1 : 0.9 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Final Jlyn Fingerprint</span>
              </div>
              {result && (
                <>
                  <div className="font-mono text-lg text-white bg-slate-900/50 rounded p-3 mb-2 break-all text-center">
                    {result.fingerprint}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Collision-resistant • Deterministic • Cross-bank compatible</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 text-center">
              Powered by <span className="text-purple-400 font-semibold">Jlyn Cipher</span> • Enabling secure cross-bank fraud detection
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
