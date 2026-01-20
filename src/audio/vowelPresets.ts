/**
 * English Monophthong Vowel Data
 * 
 * American English: Based on Peterson & Barney (1952)
 * British RP: Based on UCL phonetics data
 * 
 * F1 correlates inversely with tongue height (high vowels = low F1)
 * F2 correlates with tongue backness (front vowels = high F2)
 * F3 is relatively stable but slightly higher for front vowels
 */

export type Dialect = 'american' | 'british' | 'both';

export interface VowelPreset {
  ipa: string;
  label: string;
  f1: number;
  f2: number;
  f3: number;
  f1Bw: number;
  f2Bw: number;
  f1Gain: number;
  f2Gain: number;
  dialect: Dialect;
}

// American English vowels
const americanVowels: VowelPreset[] = [
  { ipa: 'i',  label: 'beet',    f1: 270, f2: 2290, f3: 3010, f1Bw: 60, f2Bw: 90,  f1Gain: 15, f2Gain: 18, dialect: 'american' },
  { ipa: 'ɪ',  label: 'bit',     f1: 390, f2: 1990, f3: 2550, f1Bw: 70, f2Bw: 100, f1Gain: 16, f2Gain: 16, dialect: 'american' },
  { ipa: 'e',  label: 'bait',    f1: 530, f2: 1840, f3: 2480, f1Bw: 80, f2Bw: 100, f1Gain: 18, f2Gain: 15, dialect: 'american' },
  { ipa: 'ɛ',  label: 'bet',     f1: 610, f2: 1720, f3: 2440, f1Bw: 90, f2Bw: 110, f1Gain: 18, f2Gain: 14, dialect: 'american' },
  { ipa: 'æ',  label: 'bat',     f1: 660, f2: 1720, f3: 2410, f1Bw: 100, f2Bw: 110, f1Gain: 20, f2Gain: 12, dialect: 'american' },
  { ipa: 'ɑ',  label: 'father',  f1: 730, f2: 1090, f3: 2440, f1Bw: 110, f2Bw: 100, f1Gain: 22, f2Gain: 10, dialect: 'american' },
  { ipa: 'ɔ',  label: 'thought', f1: 570, f2: 840,  f3: 2410, f1Bw: 90, f2Bw: 80, f1Gain: 18, f2Gain: 12, dialect: 'american' },
  { ipa: 'ʊ',  label: 'foot',    f1: 440, f2: 1020, f3: 2240, f1Bw: 70, f2Bw: 80, f1Gain: 16, f2Gain: 14, dialect: 'american' },
  { ipa: 'u',  label: 'goose',   f1: 300, f2: 870,  f3: 2240, f1Bw: 60, f2Bw: 70, f1Gain: 14, f2Gain: 16, dialect: 'american' },
  { ipa: 'ʌ',  label: 'strut',   f1: 640, f2: 1190, f3: 2390, f1Bw: 90, f2Bw: 100, f1Gain: 18, f2Gain: 14, dialect: 'american' },
  { ipa: 'ə',  label: 'comma',   f1: 500, f2: 1500, f3: 2490, f1Bw: 80, f2Bw: 100, f1Gain: 18, f2Gain: 15, dialect: 'american' },
];

// British RP vowels (from UCL phonetics data)
const britishVowels: VowelPreset[] = [
  { ipa: 'iː', label: 'fleece',  f1: 285, f2: 2373, f3: 3000, f1Bw: 60, f2Bw: 90,  f1Gain: 15, f2Gain: 18, dialect: 'british' },
  { ipa: 'ɪ',  label: 'kit',     f1: 356, f2: 2098, f3: 2600, f1Bw: 70, f2Bw: 100, f1Gain: 16, f2Gain: 16, dialect: 'british' },
  { ipa: 'e',  label: 'dress',   f1: 569, f2: 1965, f3: 2500, f1Bw: 80, f2Bw: 100, f1Gain: 18, f2Gain: 15, dialect: 'british' },
  { ipa: 'æ',  label: 'trap',    f1: 748, f2: 1746, f3: 2450, f1Bw: 100, f2Bw: 110, f1Gain: 20, f2Gain: 12, dialect: 'british' },
  { ipa: 'ɑː', label: 'bath',    f1: 677, f2: 1083, f3: 2450, f1Bw: 110, f2Bw: 100, f1Gain: 22, f2Gain: 10, dialect: 'british' },
  { ipa: 'ɒ',  label: 'lot',     f1: 599, f2: 891,  f3: 2400, f1Bw: 90, f2Bw: 80, f1Gain: 18, f2Gain: 12, dialect: 'british' },
  { ipa: 'ɔː', label: 'thought', f1: 449, f2: 737,  f3: 2400, f1Bw: 80, f2Bw: 80, f1Gain: 17, f2Gain: 13, dialect: 'british' },
  { ipa: 'ʊ',  label: 'foot',    f1: 376, f2: 950,  f3: 2250, f1Bw: 70, f2Bw: 80, f1Gain: 16, f2Gain: 14, dialect: 'british' },
  { ipa: 'uː', label: 'goose',   f1: 300, f2: 900,  f3: 2250, f1Bw: 60, f2Bw: 70, f1Gain: 14, f2Gain: 16, dialect: 'british' },
  { ipa: 'ʌ',  label: 'strut',   f1: 640, f2: 1200, f3: 2400, f1Bw: 90, f2Bw: 100, f1Gain: 18, f2Gain: 14, dialect: 'british' },
  { ipa: 'ɜː', label: 'nurse',   f1: 580, f2: 1380, f3: 2500, f1Bw: 85, f2Bw: 100, f1Gain: 18, f2Gain: 15, dialect: 'british' },
  { ipa: 'ə',  label: 'schwa',   f1: 500, f2: 1500, f3: 2500, f1Bw: 80, f2Bw: 100, f1Gain: 18, f2Gain: 15, dialect: 'british' },
];

// Combine all vowels
export const vowels: VowelPreset[] = [...americanVowels, ...britishVowels];

// Threshold for considering vowels "overlapping" (in Hz)
const OVERLAP_THRESHOLD = 50;

/**
 * Check if two vowels are at approximately the same position
 */
export function areVowelsOverlapping(v1: VowelPreset, v2: VowelPreset): boolean {
  return Math.abs(v1.f1 - v2.f1) < OVERLAP_THRESHOLD && 
         Math.abs(v1.f2 - v2.f2) < OVERLAP_THRESHOLD;
}

/**
 * Get display vowels with overlap detection
 * Returns vowels with effective dialect (marking overlaps as 'both')
 */
export interface DisplayVowel extends VowelPreset {
  effectiveDialect: Dialect;
  overlappingWith?: VowelPreset;
}

export function getDisplayVowels(): DisplayVowel[] {
  const result: DisplayVowel[] = [];
  const processed = new Set<VowelPreset>();
  
  for (const vowel of vowels) {
    if (processed.has(vowel)) continue;
    
    // Find overlapping vowel from opposite dialect
    const oppositeDialect = vowel.dialect === 'american' ? 'british' : 'american';
    const overlapping = vowels.find(v => 
      v.dialect === oppositeDialect && 
      !processed.has(v) && 
      areVowelsOverlapping(vowel, v)
    );
    
    if (overlapping) {
      // Merge into one "both" vowel (use american position as base)
      const baseVowel = vowel.dialect === 'american' ? vowel : overlapping;
      result.push({
        ...baseVowel,
        effectiveDialect: 'both',
        overlappingWith: vowel.dialect === 'american' ? overlapping : vowel,
      });
      processed.add(vowel);
      processed.add(overlapping);
    } else {
      result.push({
        ...vowel,
        effectiveDialect: vowel.dialect,
      });
      processed.add(vowel);
    }
  }
  
  return result;
}

/**
 * Get color for a dialect
 */
export function getDialectColor(dialect: Dialect): string {
  switch (dialect) {
    case 'american': return '#ff6b6b'; // Red
    case 'british': return '#4a9eff';  // Blue
    case 'both': return '#9b6bff';     // Purple
  }
}

/**
 * Find the nearest vowel to given F1/F2 coordinates
 */
export function findNearestVowel(f1: number, f2: number): VowelPreset {
  let nearest = vowels[0];
  let minDist = Infinity;
  
  for (const vowel of vowels) {
    const f1Norm = (f1 - vowel.f1) / 300;
    const f2Norm = (f2 - vowel.f2) / 900;
    const dist = f1Norm * f1Norm + f2Norm * f2Norm;
    
    if (dist < minDist) {
      minDist = dist;
      nearest = vowel;
    }
  }
  
  return nearest;
}

/**
 * Get default vowel for initialization (schwa)
 */
export function getDefaultVowel(): VowelPreset {
  return vowels.find(v => v.ipa === 'ə') ?? vowels[0];
}
