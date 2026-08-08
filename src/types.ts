export type AnomalySeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type SIRStatus = 
  | 'Draft Ingest' 
  | 'Pending ERO Review' 
  | 'Field Verification Assigned' 
  | 'Marked Valid' 
  | 'Escalated for Hearing' 
  | 'Flagged Duplicate' 
  | 'Purged / Deleted';

export type SIRCategory = 
  | 'Demographic Match' 
  | 'Demographic Inconsistency'
  | 'EPIC ID Anomaly' 
  | 'Photo Hash Duplicate' 
  | 'Bulk Address Cluster' 
  | 'Age/Relative Mismatch' 
  | 'Deceased/Shifted Flag'
  | 'Phonetic Soundex Match'
  | 'EPIC Suffix Match'
  | 'Maiden/Married Name Match'
  | 'Fuzzy Address Match'
  | 'Transliteration Match';

export interface DuplicateVoterMatch {
  isDuplicate: boolean;
  confidenceScore: number; // 0 to 100
  matchedVoterId?: string;
  matchedEpicNumber?: string;
  matchedVoterName?: string;
  matchedConstituency?: string;
  similarityReasoning: string;
  matchingFactors: string[];
}

export interface GeminiSIRAnalysis {
  riskScore: number; // 1 to 100
  anomalySeverity: AnomalySeverity;
  regulatoryGuideline: string; // ECI SIR Manual Chapter / Rule
  rootCauseFactors: string[];
  recommendedFieldActions: string[];
  bloVerificationChecklist: string[];
  recommendedOwner: string; // e.g. BLO Part-12 / ERO AC-164
  targetSLAHours: number;
  duplicateAnalysis: DuplicateVoterMatch;
  executiveSummary: string;
  aiConfidence: number; // 0 to 100
}

export interface ElectoralRecord {
  id: string;
  epicNumber: string;
  voterName: string;
  relativeName: string;
  relationType: 'Father' | 'Husband' | 'Mother' | 'Guardian';
  age: number;
  gender: 'M' | 'F' | 'Other';
  assemblyConstituency: string; // e.g. AC-164 Kolkata South
  partNumber: string; // Booth / Part No.
  houseAddress: string;
  bloAssigned: string;
  status: SIRStatus;
  category: SIRCategory;
  anomalySeverity: AnomalySeverity;
  riskScore: number;
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateSimilarity?: number;
  aiAnalysis?: GeminiSIRAnalysis;
  dateReported: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAction {
  id: string;
  incidentId: string; // Record ID
  actionType: 'Recorded' | 'BLO Dispatched' | 'Marked Valid' | 'Escalated Hearing' | 'Flagged Duplicate' | 'Purged' | 'Field Report Uploaded';
  reviewerName: string;
  reviewerRole: 'Booth Level Officer (BLO)' | 'Electoral Registration Officer (ERO)' | 'SIR AI Engine' | 'System';
  notes: string;
  prevStatus: SIRStatus;
  newStatus: SIRStatus;
  createdAt: string;
}

export interface SampleScenario {
  id: string;
  title: string;
  subtitle: string;
  category: SIRCategory;
  severity: AnomalySeverity;
  constituency: string;
  reportedBy: string;
  description: string;
  voterName: string;
  epicNumber: string;
  expectedDuplicate: boolean;
  duplicateMatchTarget?: string;
  badgeTag: string;
}

export interface DashboardStats {
  totalIncidents: number; // Total Electoral Records
  pendingReviews: number; // Pending ERO / Field Audits
  flaggedDuplicates: number; // Flagged Duplicate Voters
  criticalRisks: number; // High Anomaly Score Cases
  approvedResolved: number; // Marked Valid Clean
  aiAvgConfidence: number;
}
