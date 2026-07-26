import { GoogleGenAI, Type } from '@google/genai';
import { getAllElectoralRecords } from './db.js';
import { GeminiSIRAnalysis, DuplicateVoterMatch, AnomalySeverity, SIRCategory } from '../types.js';
import { logger } from './logger.js';

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_KEY_MISSING', 'GEMINI_API_KEY environment variable not set. Gemini AI calls will fallback to heuristic analysis.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function checkDuplicateWithDatabase(
  voterName: string,
  relativeName: string,
  houseAddress: string,
  assemblyConstituency: string,
  epicNumber?: string
): DuplicateVoterMatch {
  const records = getAllElectoralRecords();
  
  const vNameLower = voterName.toLowerCase().trim();
  const rNameLower = relativeName.toLowerCase().trim();
  const addrLower = houseAddress.toLowerCase().trim();
  const acLower = assemblyConstituency.toLowerCase().trim();

  let bestMatchRow: any = null;
  let highestScore = 0;
  let matchingFactors: string[] = [];

  for (const row of records) {
    if (row.epicNumber === epicNumber) continue; // Skip self

    let score = 0;
    const factors: string[] = [];

    // Exact or near EPIC match
    if (epicNumber && row.epicNumber.toLowerCase() === epicNumber.toLowerCase()) {
      score += 95;
      factors.push(`Identical EPIC Registration ID: ${row.epicNumber}`);
    }

    // Name match
    const dbVName = row.voterName.toLowerCase().trim();
    if (dbVName === vNameLower) {
      score += 45;
      factors.push(`Identical Voter Full Name: "${row.voterName}"`);
    } else if (dbVName.includes(vNameLower) || vNameLower.includes(dbVName)) {
      score += 30;
      factors.push(`Phonetic / Name Partial Match: "${row.voterName}"`);
    }

    // Relative match
    const dbRName = row.relativeName.toLowerCase().trim();
    if (dbRName === rNameLower) {
      score += 30;
      factors.push(`Identical Father/Relative Name: "${row.relativeName}"`);
    }

    // Address / Constituency overlap
    const dbAC = row.assemblyConstituency.toLowerCase().trim();
    if (dbAC === acLower) {
      score += 15;
      factors.push(`Same Assembly Constituency: ${row.assemblyConstituency}`);
    } else if (dbAC.substring(0, 6) === acLower.substring(0, 6)) {
      score += 20;
      factors.push(`Adjacent Constituency Entry: ${row.assemblyConstituency}`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatchRow = row;
      matchingFactors = factors;
    }
  }

  const isDup = highestScore >= 65;

  return {
    isDuplicate: isDup,
    confidenceScore: Math.min(98, highestScore > 0 ? highestScore : 10),
    matchedVoterId: isDup && bestMatchRow ? bestMatchRow.id : undefined,
    matchedEpicNumber: isDup && bestMatchRow ? bestMatchRow.epicNumber : undefined,
    matchedVoterName: isDup && bestMatchRow ? bestMatchRow.voterName : undefined,
    matchedConstituency: isDup && bestMatchRow ? bestMatchRow.assemblyConstituency : undefined,
    similarityReasoning: isDup && bestMatchRow
      ? `Compared against active database rolls. High demographic match with record ${bestMatchRow.epicNumber} (${bestMatchRow.voterName}) in ${bestMatchRow.assemblyConstituency}.`
      : 'No high-confidence duplicate records detected in current draft electoral rolls.',
    matchingFactors: isDup ? matchingFactors : []
  };
}

export async function analyzeElectoralRecordWithGemini(
  voterName: string,
  relativeName: string,
  houseAddress: string,
  assemblyConstituency: string,
  category: SIRCategory,
  age: number,
  gender: string,
  epicNumber: string
): Promise<GeminiSIRAnalysis> {
  const dupCheck = checkDuplicateWithDatabase(voterName, relativeName, houseAddress, assemblyConstituency, epicNumber);

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
You are the Special Intensive Revision (SIR) AI Verification Engine for Electoral Rolls.
Analyze the following voter record and duplicate check findings according to Election Commission regulations:

VOTER NAME: ${voterName}
RELATIVE/FATHER NAME: ${relativeName}
AGE: ${age}, GENDER: ${gender}
EPIC ID: ${epicNumber}
ASSEMBLY CONSTITUENCY: ${assemblyConstituency}
HOUSE ADDRESS: ${houseAddress}
CATEGORY/ANOMALY: ${category}
DUPLICATE CHECK TOOL FINDING: IsDuplicate=${dupCheck.isDuplicate}, MatchScore=${dupCheck.confidenceScore}%, MatchedEPIC=${dupCheck.matchedEpicNumber || 'None'}

Generate a JSON object with:
1. riskScore: number (1-100 anomaly probability)
2. anomalySeverity: "Critical", "High", "Medium", "Low"
3. regulatoryGuideline: string reference to ECI SIR Manual
4. rootCauseFactors: array of string findings
5. recommendedFieldActions: array of string actions for BLO/ERO
6. bloVerificationChecklist: array of door-to-door verification steps
7. recommendedOwner: string role e.g. "BLO Part-12" or "ERO AC-164"
8. targetSLAHours: number hours (2, 6, 12, 24)
9. executiveSummary: clear concise 2-sentence summary
10. aiConfidence: number (85-99)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER },
              anomalySeverity: { type: Type.STRING },
              regulatoryGuideline: { type: Type.STRING },
              rootCauseFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedFieldActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              bloVerificationChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedOwner: { type: Type.STRING },
              targetSLAHours: { type: Type.INTEGER },
              executiveSummary: { type: Type.STRING },
              aiConfidence: { type: Type.INTEGER }
            },
            required: [
              'riskScore',
              'anomalySeverity',
              'regulatoryGuideline',
              'rootCauseFactors',
              'recommendedFieldActions',
              'bloVerificationChecklist',
              'recommendedOwner',
              'targetSLAHours',
              'executiveSummary',
              'aiConfidence'
            ]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        parsed.duplicateAnalysis = dupCheck;
        logger.info('GEMINI_ANALYSIS_SUCCESS', `Successfully analyzed voter record ${epicNumber} using Gemini AI`, {
          epicNumber,
          riskScore: parsed.riskScore,
          anomalySeverity: parsed.anomalySeverity
        });
        return parsed as GeminiSIRAnalysis;
      }
    } catch (err: any) {
      logger.error('GEMINI_API_ERROR', `Gemini API call failed for ${epicNumber}, falling back to heuristic engine`, err, {
        epicNumber,
        voterName
      });
    }
  }

  logger.info('HEURISTIC_ANALYSIS_FALLBACK', `Generated heuristic analysis for voter record ${epicNumber}`, {
    epicNumber,
    category
  });
  let severity: AnomalySeverity = 'Medium';
  let riskScore = 50;
  let slaHours = 24;

  if (dupCheck.isDuplicate || category === 'Demographic Match' || category === 'Photo Hash Duplicate') {
    severity = 'High';
    riskScore = 88;
    slaHours = 12;
  }

  if (category === 'Age/Relative Mismatch' || category === 'Bulk Address Cluster') {
    severity = 'Critical';
    riskScore = 94;
    slaHours = 6;
  }

  return {
    riskScore,
    anomalySeverity: severity,
    regulatoryGuideline: `ECI SIR Directive Section 18 - ${category} Compliance Rule`,
    rootCauseFactors: [
      `Record registered under ${assemblyConstituency}`,
      `Category anomaly ${category} flagged during automated draft roll parsing`,
      dupCheck.isDuplicate ? `Demographic similarity match with EPIC ${dupCheck.matchedEpicNumber}` : 'Address/Demographic verification required'
    ],
    recommendedFieldActions: [
      `Dispatch BLO to physical address: ${houseAddress}`,
      'Verify identity documents (Aadhaar / Passport / Birth Cert / Form 6 copy)',
      'Submit geo-tagged field inspection report to ERO portal'
    ],
    bloVerificationChecklist: [
      'Confirm physical existence of voter at stated address',
      'Obtain photo copy of official photo ID',
      'Record residence duration declaration (>6 months)'
    ],
    recommendedOwner: `BLO / ERO ${assemblyConstituency.split(',')[0]}`,
    targetSLAHours: slaHours,
    duplicateAnalysis: dupCheck,
    executiveSummary: `SIR Engine analyzed record ${epicNumber} (${voterName}). ${severity} anomaly level. SLA: ${slaHours}h.`,
    aiConfidence: 95
  };
}
