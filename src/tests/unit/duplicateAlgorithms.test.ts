import { describe, it, expect } from 'vitest';
import {
  soundex,
  levenshteinDistance,
  calculateNameSimilarity,
  detectDemographicAnomaly,
  calculateDuplicateRiskScore
} from '../../utils/duplicateAlgorithms.js';

describe('Unit Tests: Soundex Phonetic Algorithm', () => {
  it('should generate matching Soundex codes for phonetic variations of same name', () => {
    // Rajesh vs Radjesh vs Rajes
    const code1 = soundex('Rajesh');
    const code2 = soundex('Radjesh');
    
    expect(code1).toBeDefined();
    expect(code1.length).toBe(4);
    expect(code1[0]).toBe('R');
    expect(soundex('Sharma')).toBe(soundex('Scharma'));
  });

  it('should handle empty or whitespace inputs gracefully', () => {
    expect(soundex('')).toBe('Z000');
    expect(soundex('   ')).toBe('Z000');
  });
});

describe('Unit Tests: Levenshtein Distance & Name Similarity', () => {
  it('should return 0 distance for identical string pairs', () => {
    expect(levenshteinDistance('Rajesh Kumar Sharma', 'Rajesh Kumar Sharma')).toBe(0);
  });

  it('should calculate correct distance for typos', () => {
    // 1 substitution: 'Rajesh' vs 'Rakesh'
    expect(levenshteinDistance('Rajesh', 'Rakesh')).toBe(1);
  });

  it('should return 100% similarity for identical names', () => {
    expect(calculateNameSimilarity('Ananya Roy', 'Ananya Roy')).toBe(100);
  });

  it('should return high similarity score (> 80%) for minor spelling variations', () => {
    const similarity = calculateNameSimilarity('Rajesh K Sharma', 'Rajesh Kumar Sharma');
    expect(similarity).toBeGreaterThan(80);
  });
});

describe('Unit Tests: Demographic Anomaly Detection Rules', () => {
  it('should flag CRITICAL anomaly when parent-child age gap is under 15 years', () => {
    const result = detectDemographicAnomaly(
      19,  // Voter age
      22,  // Father age
      'Father',
      'EPIC-WB-2026-40119',
      'Ananya Roy'
    );

    expect(result.hasAnomaly).toBe(true);
    expect(result.severity).toBe('Critical');
    expect(result.rulesViolated).toContainEqual(
      expect.stringContaining('INVALID_PARENT_AGE_GAP')
    );
  });

  it('should flag CRITICAL anomaly for underage voters (< 18 years)', () => {
    const result = detectDemographicAnomaly(
      16,
      50,
      'Father',
      'EPIC-WB-2026-10016',
      'Rahul Roy'
    );

    expect(result.hasAnomaly).toBe(true);
    expect(result.severity).toBe('Critical');
    expect(result.rulesViolated).toContainEqual(
      expect.stringContaining('UNDERAGE_VOTER')
    );
  });

  it('should flag MEDIUM anomaly for single-character or truncated name entry', () => {
    const result = detectDemographicAnomaly(
      30,
      60,
      'Father',
      'EPIC-WB-2026-10030',
      'A'
    );

    expect(result.hasAnomaly).toBe(true);
    expect(result.severity).toBe('Medium');
    expect(result.rulesViolated).toContainEqual(
      expect.stringContaining('INCOMPLETE_NAME_ENTRY')
    );
  });

  it('should flag HIGH anomaly for malformed EPIC numbers', () => {
    const result = detectDemographicAnomaly(
      35,
      60,
      'Father',
      'INVALID-EPIC-123', // Malformed format
      'Sunil Bose'
    );

    expect(result.hasAnomaly).toBe(true);
    expect(result.severity).toBe('High');
    expect(result.rulesViolated).toContainEqual(
      expect.stringContaining('MALFORMED_EPIC_NUMBER')
    );
  });

  it('should pass valid voter records without anomalies', () => {
    const result = detectDemographicAnomaly(
      42,
      70,
      'Father',
      'EPIC-WB-2026-90412',
      'Rajesh Kumar Sharma'
    );

    expect(result.hasAnomaly).toBe(false);
    expect(result.severity).toBe('Low');
    expect(result.rulesViolated).toHaveLength(0);
  });
});

describe('Unit Tests: Duplicate Risk Score Calculator', () => {
  it('should calculate high risk score (>= 75) for duplicate candidates', () => {
    const voterA = {
      name: 'Rajesh Kumar Sharma',
      relativeName: 'Kailash Nath Sharma',
      age: 42,
      constituency: 'AC-164 Kolkata South'
    };
    const voterB = {
      name: 'Rajesh K Sharma',
      relativeName: 'Kailash Sharma',
      age: 42,
      constituency: 'AC-165 Jadavpur'
    };

    const outcome = calculateDuplicateRiskScore(voterA, voterB);

    expect(outcome.riskScore).toBeGreaterThanOrEqual(75);
    expect(outcome.isDuplicateCandidate).toBe(true);
    expect(outcome.reasoning).toContain('High risk match');
  });

  it('should apply same constituency bonus and minor age diff weighting in risk score', () => {
    const voterA = {
      name: 'Subhas Chandra Bose Ray',
      relativeName: 'Amarendra Bose Ray',
      age: 38,
      constituency: 'AC-164 Kolkata South'
    };
    const voterB = {
      name: 'Subhas Bose Ray',
      relativeName: 'Amarendra Bose Ray',
      age: 39, // age diff 1
      constituency: 'AC-164 Kolkata South'
    };

    const outcome = calculateDuplicateRiskScore(voterA, voterB);
    expect(outcome.riskScore).toBeGreaterThanOrEqual(75);
    expect(outcome.isDuplicateCandidate).toBe(true);
  });

  it('should return low risk score for distinctly different voters', () => {
    const voterA = {
      name: 'Ananya Roy',
      relativeName: 'Subhash Roy',
      age: 19,
      constituency: 'AC-164 Kolkata South'
    };
    const voterB = {
      name: 'Sunil Kumar Bose',
      relativeName: 'Late Haripada Bose',
      age: 58,
      constituency: 'AC-164 Kolkata South'
    };

    const outcome = calculateDuplicateRiskScore(voterA, voterB);

    expect(outcome.riskScore).toBeLessThan(50);
    expect(outcome.isDuplicateCandidate).toBe(false);
  });
});
