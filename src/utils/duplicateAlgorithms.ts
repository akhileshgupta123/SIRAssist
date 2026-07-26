/**
 * Business Logic Module: Duplicate Detection Algorithms & Anomaly Rules
 * Used for Electoral Roll Special Intensive Revision (SIR) Audits
 */

/**
 * Standard Soundex Phonetic Code Generator
 * Maps English and transliterated names into phonetic representations
 */
export function soundex(name: string): string {
  if (!name || name.trim().length === 0) return 'Z000';

  const cleaned = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length === 0) return 'Z000';

  const firstLetter = cleaned[0];

  const map: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let digits = firstLetter;
  let lastDigit = map[firstLetter] || '0';

  for (let i = 1; i < cleaned.length; i++) {
    const char = cleaned[i];
    const digit = map[char] || '0';

    if (digit !== '0' && digit !== lastDigit) {
      digits += digit;
      lastDigit = digit;
    } else if (digit === '0') {
      lastDigit = '0';
    }

    if (digits.length === 4) break;
  }

  while (digits.length < 4) {
    digits += '0';
  }

  return digits;
}

/**
 * Levenshtein String Distance for Name Fuzzy Matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  const matrix: number[][] = [];

  for (let i = 0; i <= strB.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= strA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= strB.length; i++) {
    for (let j = 1; j <= strA.length; j++) {
      if (strB.charAt(i - 1) === strA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[strB.length][strA.length];
}

/**
 * Calculate Fuzzy Similarity Percentage between two names (0 - 100%)
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;
  const n1 = name1.trim();
  const n2 = name2.trim();
  if (n1.toLowerCase() === n2.toLowerCase()) return 100;

  const maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(n1, n2);
  const similarityRatio = (maxLen - distance) / maxLen;
  
  // Also boost if Soundex codes match exactly
  const soundexMatch = soundex(n1) === soundex(n2);
  let finalScore = Math.round(similarityRatio * 100);

  if (soundexMatch && finalScore < 85) {
    finalScore = Math.min(100, finalScore + 15);
  }

  return finalScore;
}

/**
 * Demographic Anomaly Inspector Rule Engine
 */
export interface DemographicAnomalyResult {
  hasAnomaly: boolean;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  rulesViolated: string[];
  explanation: string;
}

export function detectDemographicAnomaly(
  voterAge: number,
  relativeAge: number,
  relationType: string,
  epicNumber: string,
  voterName: string
): DemographicAnomalyResult {
  const rulesViolated: string[] = [];

  // Rule 1: Age lower limit check
  if (voterAge < 18) {
    rulesViolated.push('UNDERAGE_VOTER: Declared age is under legal minimum voting age (18 years)');
  }

  // Rule 2: Parent-Child age difference check
  const relationLower = relationType.toLowerCase();
  if (relationLower.includes('father') || relationLower.includes('mother')) {
    const ageGap = relativeAge - voterAge;
    if (relativeAge > 0 && ageGap < 15) {
      rulesViolated.push(`INVALID_PARENT_AGE_GAP: Biological age gap between ${relationType} (${relativeAge} yrs) and child (${voterAge} yrs) is only ${ageGap} years (< 15 years threshold)`);
    }
  }

  // Rule 3: EPIC Format checksum check (Must match EPIC-[STATE]-[YEAR]-[5 DIGITS])
  const epicRegex = /^EPIC-[A-Z]{2}-\d{4}-\d{5}$/i;
  if (!epicRegex.test(epicNumber)) {
    rulesViolated.push(`MALFORMED_EPIC_NUMBER: EPIC format '${epicNumber}' fails standard ECI checksum syntax`);
  }

  // Rule 4: Suspicious single-character name entry
  if (voterName.trim().length < 2) {
    rulesViolated.push('INCOMPLETE_NAME_ENTRY: Voter name contains fewer than 2 characters');
  }

  let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (rulesViolated.length === 0) {
    severity = 'Low';
  } else if (rulesViolated.some(r => r.includes('INVALID_PARENT_AGE_GAP') || r.includes('UNDERAGE_VOTER'))) {
    severity = 'Critical';
  } else if (rulesViolated.some(r => r.includes('MALFORMED_EPIC_NUMBER'))) {
    severity = 'High';
  } else {
    severity = 'Medium';
  }

  return {
    hasAnomaly: rulesViolated.length > 0,
    severity,
    rulesViolated,
    explanation: rulesViolated.length > 0 
      ? `Flagged ${rulesViolated.length} rule violation(s): ${rulesViolated.join('; ')}`
      : 'Passed all demographic integrity verification rules.'
  };
}

/**
 * Calculates overall Risk Score (0-100) for a candidate voter pair
 */
export function calculateDuplicateRiskScore(
  voterA: { name: string; relativeName: string; age: number; constituency: string },
  voterB: { name: string; relativeName: string; age: number; constituency: string }
): { riskScore: number; isDuplicateCandidate: boolean; reasoning: string } {
  const nameSim = calculateNameSimilarity(voterA.name, voterB.name);
  const relSim = calculateNameSimilarity(voterA.relativeName, voterB.relativeName);
  const ageDiff = Math.abs(voterA.age - voterB.age);
  const sameConstituency = voterA.constituency.toLowerCase() === voterB.constituency.toLowerCase();

  let riskScore = 0;

  // Weightings
  riskScore += nameSim * 0.45; // 45% weight on voter name
  riskScore += relSim * 0.35;  // 35% weight on relative name

  if (ageDiff === 0) {
    riskScore += 20; // 20% weight on identical age
  } else if (ageDiff <= 2) {
    riskScore += 10;
  }

  if (sameConstituency && riskScore > 60) {
    riskScore = Math.min(100, riskScore + 10);
  }

  const isDuplicateCandidate = riskScore >= 75;
  
  const reasoning = isDuplicateCandidate
    ? `High risk match (${Math.round(riskScore)}%): Voter similarity ${nameSim}%, Relative similarity ${relSim}%, Age diff ${ageDiff} yrs.`
    : `Low/Moderate match (${Math.round(riskScore)}%): No cross-roll duplicate threshold reached.`;

  return {
    riskScore: Math.round(riskScore),
    isDuplicateCandidate,
    reasoning
  };
}
