export interface JlynFingerprint {
  fingerprint: string;
  starMap: number[];
  seed: string;
  pattern: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateStarMap(seed: string): number[] {
  const hash = hashString(seed);
  const map: number[] = [];
  let current = hash;

  for (let i = 0; i < 16; i++) {
    current = (current * 1103515245 + 12345) & 0x7fffffff;
    map.push((current % 256));
  }

  return map;
}

export function encryptPattern(data: string): JlynFingerprint {
  const pattern = data.toLowerCase().replace(/[^a-z0-9]/g, '');
  const seed = hashString(data).toString();
  const starMap = generateStarMap(seed);

  let fingerprint = '';
  for (let i = 0; i < 16; i++) {
    const charIndex = i % pattern.length;
    const patternChar = pattern.charCodeAt(charIndex) || 65;
    const encrypted = (patternChar ^ starMap[i]) % 256;
    fingerprint += encrypted.toString(16).padStart(2, '0');
  }

  return {
    fingerprint: fingerprint.toUpperCase(),
    starMap,
    seed,
    pattern: data
  };
}

export function generateTransactionFingerprint(
  amount: number,
  timestamp: number,
  merchant: string,
  card: string
): JlynFingerprint {
  const data = `${amount}${timestamp}${merchant}${card}`;
  return encryptPattern(data);
}

export function fingerprintsMatch(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

export function getFingerprintSimilarity(fp1: string, fp2: string): number {
  if (fp1 === fp2) return 100;

  let matches = 0;
  const len = Math.min(fp1.length, fp2.length);

  for (let i = 0; i < len; i++) {
    if (fp1[i] === fp2[i]) matches++;
  }

  return Math.round((matches / len) * 100);
}
