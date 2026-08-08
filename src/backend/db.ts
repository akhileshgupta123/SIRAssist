import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { ElectoralRecord, ReviewAction, DashboardStats, SIRCategory, AnomalySeverity, SIRStatus } from '../types.js';
import { logger } from './logger.js';

let db: Database | null = null;
const dbFilePath = path.join(process.cwd(), 'data', 'sir_assist.db');

export function getDatabaseFilePath(): string {
  return dbFilePath;
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  try {
    logger.info('DB_INIT_START', 'Initializing SQLite database connection', { dbFilePath });
    const SQL = await initSqlJs();
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(dbFilePath)) {
      const filebuffer = fs.readFileSync(dbFilePath);
      db = new SQL.Database(filebuffer);
      logger.info('DB_LOADED_FILE', 'Loaded existing SQLite database file', { dbFilePath, bytes: filebuffer.length });
    } else {
      db = new SQL.Database();
      logger.info('DB_LOADED_NEW', 'Created new in-memory SQLite database');
    }

    initTables(db);
    saveDb();
    logger.info('DB_INIT_COMPLETE', 'SQLite database initialization completed successfully');
    return db;
  } catch (err: any) {
    logger.error('DB_INIT_FAILED', 'Failed to initialize SQLite database', err, { dbFilePath });
    throw err;
  }
}

export function saveDb(): void {
  if (!db) return;
  const dbFilePath = getDatabaseFilePath();
  const data = db.export();
  const dbDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, buffer(data));
}

function buffer(array: Uint8Array): Buffer {
  return Buffer.from(array);
}

function initTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS electoral_records (
      id TEXT PRIMARY KEY,
      epic_number TEXT UNIQUE,
      voter_name TEXT NOT NULL,
      relative_name TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      assembly_constituency TEXT NOT NULL,
      part_number TEXT NOT NULL,
      house_address TEXT NOT NULL,
      blo_assigned TEXT NOT NULL,
      category TEXT NOT NULL,
      anomaly_severity TEXT NOT NULL,
      status TEXT NOT NULL,
      date_reported TEXT NOT NULL,
      risk_score INTEGER NOT NULL DEFAULT 50,
      is_duplicate INTEGER NOT NULL DEFAULT 0,
      duplicate_of_id TEXT,
      duplicate_similarity REAL DEFAULT 0,
      ai_analysis_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_actions (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_role TEXT NOT NULL,
      notes TEXT NOT NULL,
      prev_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (incident_id) REFERENCES electoral_records (id)
    );
  `);

  // Check if seeded with full dataset
  const stmt = database.prepare("SELECT COUNT(*) as count FROM electoral_records");
  let count = 0;
  if (stmt.step()) {
    count = (stmt.getAsObject() as { count: number }).count;
  }
  stmt.free();

  if (count < 25) {
    seedInitialData(database);
  }
}

function seedInitialData(database: Database): void {
  const initialRecords = [
    {
      id: 'rec-001',
      epic_number: 'EPIC-WB-2026-90412',
      voter_name: 'Rajesh Kumar Sharma',
      relative_name: 'Kailash Nath Sharma',
      relation_type: 'Father',
      age: 42,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 12',
      part_number: 'Part 12 (Booth 14-A)',
      house_address: '42/B Rashbehari Avenue, Flat 3A, Kolkata',
      blo_assigned: 'BLO-12 (A. Banerjee)',
      category: 'Demographic Match',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-07-25 10:15:00',
      risk_score: 88,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 88,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Manual - Chapter 4 (Demographic Similarity Audit across AC Boundaries)',
        rootCauseFactors: [
          'Same full name and father name matching record in AC-165',
          'Identical age (42) and gender designation in adjacent constituency draft roll',
          'Photo hash similarity threshold flagged above 92%'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-12 for door-to-door physical verification at 42/B Rashbehari Ave',
          'Inspect Form 6 / Form 8 migration declaration documents',
          'Verify current physical residence duration > 6 months'
        ],
        bloVerificationChecklist: [
          'Physical existence of voter at stated address',
          'Obtain Aadhaar/Electoral ID photocopy',
          'Verify if voter transferred from AC-165 or retains dual entry'
        ],
        recommendedOwner: 'BLO-12 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 92,
          similarityReasoning: 'Primary reference voter record registered in AC-164 Kolkata South.',
          matchingFactors: []
        },
        executiveSummary: 'High-probability cross-constituency duplicate flagged with AC-165 record EPIC-WB-2026-88102. Field verification dispatched.',
        aiConfidence: 94
      }),
      created_at: '2026-07-25 10:15:00',
      updated_at: '2026-07-25 10:15:00'
    },
    {
      id: 'rec-002',
      epic_number: 'EPIC-WB-2026-88102',
      voter_name: 'Rajesh K Sharma',
      relative_name: 'Kailash Sharma',
      relation_type: 'Father',
      age: 42,
      gender: 'M',
      assembly_constituency: 'AC-165 Jadavpur, Part 48',
      part_number: 'Part 48 (Booth 08-B)',
      house_address: '18/1 Raja SC Mullick Road, Jadavpur',
      blo_assigned: 'BLO-48 (P. Sengupta)',
      category: 'Demographic Match',
      anomaly_severity: 'High',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-25 11:30:00',
      risk_score: 91,
      is_duplicate: 1,
      duplicate_of_id: 'rec-001',
      duplicate_similarity: 94,
      ai_analysis_json: JSON.stringify({
        riskScore: 91,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 - Prohibition of Dual Enrollment',
        rootCauseFactors: [
          'Duplicate enrollment detected between AC-165 and AC-164',
          'Same individual registered before shifting residence'
        ],
        recommendedFieldActions: [
          'Mark record for deletion/purging after ERO hearing under Section 22',
          'Serve notice Form 7 to voter at Jadavpur address'
        ],
        bloVerificationChecklist: [
          'Confirm voter shifted residence to AC-164',
          'Collect written surrender statement for Jadavpur EPIC'
        ],
        recommendedOwner: 'ERO AC-165',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 94,
          matchedVoterId: 'rec-001',
          matchedEpicNumber: 'EPIC-WB-2026-90412',
          matchedVoterName: 'Rajesh Kumar Sharma',
          matchedConstituency: 'AC-164 Kolkata South, Part 12',
          similarityReasoning: 'Confirmed demographic, age, father name, and photo match with primary record EPIC-WB-2026-90412.',
          matchingFactors: [
            'Name Match: Rajesh K Sharma vs Rajesh Kumar Sharma',
            'Relative Match: Kailash Sharma vs Kailash Nath Sharma',
            'Same Age: 42 years (M)',
            'Adjacent Constituency: AC-164 & AC-165'
          ]
        },
        executiveSummary: 'Automated Duplicate Flagged. Linked to primary master record EPIC-WB-2026-90412 for ERO purge decision.',
        aiConfidence: 96
      }),
      created_at: '2026-07-25 11:30:00',
      updated_at: '2026-07-25 11:35:00'
    },
    {
      id: 'rec-003',
      epic_number: 'EPIC-WB-2026-40119',
      voter_name: 'Ananya Roy',
      relative_name: 'Subhash Roy',
      relation_type: 'Father',
      age: 19,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 15',
      part_number: 'Part 15 (Booth 19-C)',
      house_address: '102 SP Mukherjee Road, Kalighat',
      blo_assigned: 'BLO-15 (S. Dutta)',
      category: 'Age/Relative Mismatch',
      anomaly_severity: 'Critical',
      status: 'Pending ERO Review',
      date_reported: '2026-07-26 01:00:00',
      risk_score: 95,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 95,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI SIR Directive - Logical Integrity Check for Age-Relative Gap',
        rootCauseFactors: [
          'Voter declared age 19, Father Subhash Roy declared age 22 in same part roll',
          'Age gap between father and child is only 3 years (Logical Impossibility)',
          'Form 6 date of birth proof document contains illegible entry'
        ],
        recommendedFieldActions: [
          'Immediate physical inspection of Birth Certificate / School Leaving Certificate',
          'Summon applicant for ERO document verification hearing'
        ],
        bloVerificationChecklist: [
          'Verify genuine age of father Subhash Roy',
          'Verify birth document authenticity with municipal registrar'
        ],
        recommendedOwner: 'ERO AC-164 (Hearing Cell)',
        targetSLAHours: 6,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 98,
          similarityReasoning: 'Unique logical age anomaly detected during roll audit.',
          matchingFactors: []
        },
        executiveSummary: 'Critical logical anomaly: 3-year age gap between father and child. Escalated for immediate ERO review.',
        aiConfidence: 98
      }),
      created_at: '2026-07-26 01:00:00',
      updated_at: '2026-07-26 01:00:00'
    },
    {
      id: 'rec-004',
      epic_number: 'EPIC-WB-2026-77310',
      voter_name: 'Sunil Kumar Bose',
      relative_name: 'Late Haripada Bose',
      relation_type: 'Father',
      age: 58,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 09',
      part_number: 'Part 09 (Booth 10-A)',
      house_address: 'Unoccupied Commercial Shed, Plot 14 Dockyard Road',
      blo_assigned: 'BLO-09 (M. Roy)',
      category: 'Bulk Address Cluster',
      anomaly_severity: 'High',
      status: 'Escalated for Hearing',
      date_reported: '2026-07-24 16:20:00',
      risk_score: 84,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 84,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Anti-Ghosting Manual - Single Premises High Density Threshold (>10 voters/premise)',
        rootCauseFactors: [
          'Address "Plot 14 Dockyard Road" has 48 voter registrations under non-residential commercial land',
          'No residential structure exists on physical plot according to GIS boundary layer'
        ],
        recommendedFieldActions: [
          'Issue formal Section 22 inquiry notices to all 48 enrolled individuals',
          'Conduct spot verification with municipal trade license department'
        ],
        bloVerificationChecklist: [
          'Verify if plot is active residential or vacant commercial lot',
          'Photograph plot entrance and collect local neighbor affidavits'
        ],
        recommendedOwner: 'ERO Special Investigation Cell',
        targetSLAHours: 48,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 91,
          similarityReasoning: 'Cluster address anomaly flagged across part roll.',
          matchingFactors: []
        },
        executiveSummary: 'Bulk address cluster anomaly (48 voters at unoccupied commercial shed). ERO hearing ordered.',
        aiConfidence: 93
      }),
      created_at: '2026-07-24 16:20:00',
      updated_at: '2026-07-25 14:00:00'
    },
    {
      id: 'rec-005',
      epic_number: 'EPIC-WB-2026-11204',
      voter_name: 'Meena Devi Agarwal',
      relative_name: 'Ramesh Agarwal',
      relation_type: 'Husband',
      age: 34,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 12',
      part_number: 'Part 12 (Booth 14-A)',
      house_address: '88 Hazra Road, 2nd Floor, Kolkata',
      blo_assigned: 'BLO-12 (A. Banerjee)',
      category: 'Demographic Match',
      anomaly_severity: 'Low',
      status: 'Marked Valid',
      date_reported: '2026-07-23 09:00:00',
      risk_score: 15,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 15,
        anomalySeverity: 'Low',
        regulatoryGuideline: 'ECI SIR Standard Audit - Form 8 Transfer Verification Passed',
        rootCauseFactors: [
          'Form 8 submitted for address correction following marital relocation',
          'Old roll entry deleted under proper ERO transfer protocol'
        ],
        recommendedFieldActions: [
          'No further field action required. Record verified valid.'
        ],
        bloVerificationChecklist: [
          'Address verified by BLO-12 with valid marriage registration document'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 0,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 99,
          similarityReasoning: 'Legitimate voter record with complete documentation.',
          matchingFactors: []
        },
        executiveSummary: 'Verified clean record. Marked valid by ERO AC-164 after BLO door-to-door audit.',
        aiConfidence: 99
      }),
      created_at: '2026-07-23 09:00:00',
      updated_at: '2026-07-24 11:00:00'
    },
    {
      id: 'rec-006',
      epic_number: 'EPIC-WB-2026-66201',
      voter_name: 'Suresh Chandra Chatterji',
      relative_name: 'Debashis Chatterji',
      relation_type: 'Father',
      age: 45,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 14',
      part_number: 'Part 14 (Booth 18-A)',
      house_address: '15A Southern Avenue, Kalighat',
      blo_assigned: 'BLO-14 (S. Roy)',
      category: 'Phonetic Soundex Match',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-07-26 14:10:00',
      risk_score: 89,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 89,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Manual Chapter 3 - Phonetic Soundex & Spelling Transliteration Audit',
        rootCauseFactors: [
          'Phonetic Soundex code C362 matches record EPIC-WB-2026-66202 in Part 14',
          'Suresh Chandra Chatterji vs Suresh Chandra Chatterjee transliteration difference',
          'Identical age (45) and Father name Debashis/Debasish Chatterji'
        ],
        recommendedFieldActions: [
          'Assign BLO-14 to inspect 15A Southern Avenue',
          'Verify if Chatterji and Chatterjee entries belong to one physical elector'
        ],
        bloVerificationChecklist: [
          'Check Aadhaar or Passport spelling',
          'Obtain Form 7 deletion consent if duplicate'
        ],
        recommendedOwner: 'BLO-14 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 95,
          similarityReasoning: 'Primary reference record for phonetic spelling duplicate check.',
          matchingFactors: []
        },
        executiveSummary: 'Phonetic Soundex duplicate match detected with EPIC-WB-2026-66202. Field audit active.',
        aiConfidence: 95
      }),
      created_at: '2026-07-26 14:10:00',
      updated_at: '2026-07-26 14:10:00'
    },
    {
      id: 'rec-007',
      epic_number: 'EPIC-WB-2026-66202',
      voter_name: 'Suresh Chandra Chatterjee',
      relative_name: 'Debasish Chatterjee',
      relation_type: 'Father',
      age: 45,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 14',
      part_number: 'Part 14 (Booth 18-A)',
      house_address: '15-A Southern Ave, Kalighat',
      blo_assigned: 'BLO-14 (S. Roy)',
      category: 'Phonetic Soundex Match',
      anomaly_severity: 'High',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-26 14:15:00',
      risk_score: 93,
      is_duplicate: 1,
      duplicate_of_id: 'rec-006',
      duplicate_similarity: 96,
      ai_analysis_json: JSON.stringify({
        riskScore: 93,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 - Prohibition of Double Registration',
        rootCauseFactors: [
          'Phonetic Soundex code C362 matched 100% with primary entry rec-006',
          'Identical age (45), gender (M), and house address variation (15A vs 15-A)',
          'Spelling variant generated during English-Bengali roll transliteration'
        ],
        recommendedFieldActions: [
          'Issue Form 7 deletion notice to Chatterjee entry following BLO verification',
          'Retain primary Chatterji entry (EPIC-WB-2026-66201)'
        ],
        bloVerificationChecklist: [
          'Verify elector identity card',
          'Collect signed Form 7 surrender statement'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 96,
          matchedVoterId: 'rec-006',
          matchedEpicNumber: 'EPIC-WB-2026-66201',
          matchedVoterName: 'Suresh Chandra Chatterji',
          matchedConstituency: 'AC-164 Kolkata South, Part 14',
          similarityReasoning: 'Phonetic Soundex match C362, exact age, father name variant, and identical address.',
          matchingFactors: [
            'Phonetic Soundex: Chatterji <-> Chatterjee (Code: C362)',
            'Father Name: Debashis Chatterji vs Debasish Chatterjee',
            'Same Age: 45 years (M)',
            'Address Match: 15A Southern Avenue vs 15-A Southern Ave'
          ]
        },
        executiveSummary: 'Phonetic Soundex Duplicate confirmed (96% similarity). Flagged for Form 7 deletion.',
        aiConfidence: 97
      }),
      created_at: '2026-07-26 14:15:00',
      updated_at: '2026-07-26 14:20:00'
    },
    {
      id: 'rec-008',
      epic_number: 'EPIC-WB-2026-55101',
      voter_name: 'Priya Mukherjee',
      relative_name: 'Amit Mukherjee',
      relation_type: 'Husband',
      age: 31,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 12',
      part_number: 'Part 12 (Booth 14-A)',
      house_address: '120 Lake Road, Flat 2B, Kolkata',
      blo_assigned: 'BLO-12 (A. Banerjee)',
      category: 'EPIC Suffix Match',
      anomaly_severity: 'Critical',
      status: 'Pending ERO Review',
      date_reported: '2026-07-27 08:30:00',
      risk_score: 96,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 96,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI EPIC Allocation Standard - Suffix Typo & Re-issued Card Dual Enrollment Audit',
        rootCauseFactors: [
          'Duplicate EPIC entry detected with appended suffix "A" in adjacent Part 13',
          'Identical voter name "Priya Mukherjee", husband "Amit Mukherjee", and age 31',
          'Same photo hash detected across both part draft rolls'
        ],
        recommendedFieldActions: [
          'Immediate ERO review to purge erroneous suffix EPIC entry in Part 13',
          'Issue clean single EPIC confirmation certificate'
        ],
        bloVerificationChecklist: [
          'Verify original physical EPIC card held by voter',
          'Confirm no duplicate Form 6 application was submitted'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 6,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 98,
          similarityReasoning: 'Master reference record for EPIC Suffix Typo audit.',
          matchingFactors: []
        },
        executiveSummary: 'EPIC Suffix Typo duplicate flagged with EPIC-WB-2026-55101A. Critical review pending.',
        aiConfidence: 98
      }),
      created_at: '2026-07-27 08:30:00',
      updated_at: '2026-07-27 08:30:00'
    },
    {
      id: 'rec-009',
      epic_number: 'EPIC-WB-2026-55101A',
      voter_name: 'Priya Mukherjee',
      relative_name: 'Amit Mukherjee',
      relation_type: 'Husband',
      age: 31,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 13',
      part_number: 'Part 13 (Booth 15-B)',
      house_address: '120 Lake Road, Flat 2B, Kolkata',
      blo_assigned: 'BLO-13 (K. Chanda)',
      category: 'EPIC Suffix Match',
      anomaly_severity: 'Critical',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-27 08:35:00',
      risk_score: 98,
      is_duplicate: 1,
      duplicate_of_id: 'rec-008',
      duplicate_similarity: 98,
      ai_analysis_json: JSON.stringify({
        riskScore: 98,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 & 22 - Erroneous Duplicate EPIC Purge',
        rootCauseFactors: [
          'EPIC ID prefix matches EPIC-WB-2026-55101 with trailing suffix "A"',
          '100% exact match on voter name, relative name, age, and house address',
          'Erroneously generated during re-printing/migration processing'
        ],
        recommendedFieldActions: [
          'Execute immediate Form 7 purge of duplicate suffix entry EPIC-WB-2026-55101A',
          'Update central ECI voter database index'
        ],
        bloVerificationChecklist: [
          'Collect written statement regarding re-issue card error',
          'Confirm voter retains primary card EPIC-WB-2026-55101'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 6,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 98,
          matchedVoterId: 'rec-008',
          matchedEpicNumber: 'EPIC-WB-2026-55101',
          matchedVoterName: 'Priya Mukherjee',
          matchedConstituency: 'AC-164 Kolkata South, Part 12',
          similarityReasoning: 'EPIC Suffix Typo match (98% similarity). Exact name, age, husband, and address match.',
          matchingFactors: [
            'EPIC Match: EPIC-WB-2026-55101 vs EPIC-WB-2026-55101A',
            'Exact Name Match: Priya Mukherjee',
            'Exact Relative Match: Husband Amit Mukherjee',
            'Exact Age & Address: 31 years, 120 Lake Road'
          ]
        },
        executiveSummary: 'Critical EPIC Suffix Typo Duplicate (98% match). Flagged for instant ERO purge.',
        aiConfidence: 99
      }),
      created_at: '2026-07-27 08:35:00',
      updated_at: '2026-07-27 08:40:00'
    },
    {
      id: 'rec-010',
      epic_number: 'EPIC-WB-2026-33410',
      voter_name: 'Pooja Banerjee',
      relative_name: 'Biswanath Banerjee',
      relation_type: 'Father',
      age: 29,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 10',
      part_number: 'Part 10 (Booth 11-A)',
      house_address: '54 Ballygunge Circular Road, Kolkata',
      blo_assigned: 'BLO-10 (R. Nandi)',
      category: 'Maiden/Married Name Match',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-07-28 11:00:00',
      risk_score: 91,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 91,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Directive - Marital Relocation & Maiden Name Duplicate Audit',
        rootCauseFactors: [
          'Voter registered at parents home in AC-164 under father name Biswanath Banerjee',
          'Matching record Pooja Banerjee Das (Husband: Siddharth Das) found in AC-165 Jadavpur',
          'Facial recognition photo hash similarity threshold matched at 94%'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-10 to verify marital relocation status',
          'Check if Form 8 transfer was completed or if dual enrollment exists'
        ],
        bloVerificationChecklist: [
          'Obtain marriage certificate copy',
          'Confirm current primary residence (Ballygunge vs Jadavpur)'
        ],
        recommendedOwner: 'BLO-10 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 94,
          similarityReasoning: 'Maiden record reference at parental address in AC-164.',
          matchingFactors: []
        },
        executiveSummary: 'Marital relocation duplicate flagged with AC-165 record. Field verification dispatched.',
        aiConfidence: 94
      }),
      created_at: '2026-07-28 11:00:00',
      updated_at: '2026-07-28 11:00:00'
    },
    {
      id: 'rec-011',
      epic_number: 'EPIC-WB-2026-33411',
      voter_name: 'Pooja Banerjee Das',
      relative_name: 'Siddharth Das',
      relation_type: 'Husband',
      age: 29,
      gender: 'F',
      assembly_constituency: 'AC-165 Jadavpur, Part 22',
      part_number: 'Part 22 (Booth 04-C)',
      house_address: '72 Prince Anwar Shah Road, Jadavpur',
      blo_assigned: 'BLO-22 (T. Ghosh)',
      category: 'Maiden/Married Name Match',
      anomaly_severity: 'High',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-28 11:05:00',
      risk_score: 92,
      is_duplicate: 1,
      duplicate_of_id: 'rec-010',
      duplicate_similarity: 91,
      ai_analysis_json: JSON.stringify({
        riskScore: 92,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 - Prohibition of Dual Enrollment Post Marriage',
        rootCauseFactors: [
          'Matches maiden name record rec-010 in AC-164 Kolkata South',
          'Exact age match (29 years) and female gender',
          'Photo hash similarity 94% between parental and marital address records'
        ],
        recommendedFieldActions: [
          'Purge maiden roll entry in AC-164 upon submission of marriage registration proof',
          'Retain active marital record in AC-165 Jadavpur'
        ],
        bloVerificationChecklist: [
          'Collect signed Form 7 for AC-164 deletion',
          'Verify residence at Prince Anwar Shah Road'
        ],
        recommendedOwner: 'ERO AC-165 / ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 91,
          matchedVoterId: 'rec-010',
          matchedEpicNumber: 'EPIC-WB-2026-33410',
          matchedVoterName: 'Pooja Banerjee',
          matchedConstituency: 'AC-164 Kolkata South, Part 10',
          similarityReasoning: 'Maiden vs Married surname match (Pooja Banerjee vs Pooja Banerjee Das), exact age 29, and photo match.',
          matchingFactors: [
            'First Name & Maiden Surname Match: Pooja Banerjee',
            'Exact Age: 29 years (F)',
            'Photo Hash Match: 94% visual similarity',
            'Cross-AC Relocation: AC-164 -> AC-165'
          ]
        },
        executiveSummary: 'Maiden/Married name relocation duplicate flagged (91% match). Notice pending.',
        aiConfidence: 95
      }),
      created_at: '2026-07-28 11:05:00',
      updated_at: '2026-07-28 11:10:00'
    },
    {
      id: 'rec-012',
      epic_number: 'EPIC-WB-2026-77801',
      voter_name: 'Vikramaditya Roy',
      relative_name: 'Tapan Kumar Roy',
      relation_type: 'Father',
      age: 38,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 18',
      part_number: 'Part 18 (Booth 22-A)',
      house_address: '42/B Salt Lake Sector 1, Block B',
      blo_assigned: 'BLO-18 (M. Mitra)',
      category: 'Fuzzy Address Match',
      anomaly_severity: 'High',
      status: 'Pending ERO Review',
      date_reported: '2026-07-29 09:15:00',
      risk_score: 89,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 89,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Anti-Clustering Protocol - Normalized Fuzzy Address Matching',
        rootCauseFactors: [
          'Address string "42/B Salt Lake Sector 1, Block B" matches "Plot 42-B, Sector-I Block B, Salt Lake"',
          'Exact voter name Vikramaditya Roy and age 38',
          'Father name variant Tapan Kumar Roy vs Tapan Roy in adjacent Booth 23'
        ],
        recommendedFieldActions: [
          'Consolidate dual entries into single Part 18 polling booth',
          'Issue Form 7 purge for duplicate record in Part 19'
        ],
        bloVerificationChecklist: [
          'Verify physical plot address format with postal pincode',
          'Confirm voter receives mail at 42/B'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 95,
          similarityReasoning: 'Primary record for fuzzy address duplicate audit.',
          matchingFactors: []
        },
        executiveSummary: 'Fuzzy address duplicate flagged across adjacent polling booths (Part 18 & Part 19).',
        aiConfidence: 96
      }),
      created_at: '2026-07-29 09:15:00',
      updated_at: '2026-07-29 09:15:00'
    },
    {
      id: 'rec-013',
      epic_number: 'EPIC-WB-2026-77802',
      voter_name: 'Vikramaditya Roy',
      relative_name: 'Tapan Roy',
      relation_type: 'Father',
      age: 38,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 19',
      part_number: 'Part 19 (Booth 23-B)',
      house_address: 'Plot 42-B, Sector-I Block B, Salt Lake',
      blo_assigned: 'BLO-19 (H. Mallick)',
      category: 'Fuzzy Address Match',
      anomaly_severity: 'High',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-29 09:20:00',
      risk_score: 95,
      is_duplicate: 1,
      duplicate_of_id: 'rec-012',
      duplicate_similarity: 95,
      ai_analysis_json: JSON.stringify({
        riskScore: 95,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 - Prohibition of Double Registration in Part Rolls',
        rootCauseFactors: [
          'Fuzzy address distance score 92% ("42/B Salt Lake Sector 1" vs "Plot 42-B, Sector-I")',
          'Exact match on voter name Vikramaditya Roy and age 38',
          'Registered in adjacent polling booths due to part boundary re-alignment'
        ],
        recommendedFieldActions: [
          'Mark record for purge under Form 7',
          'Retain primary master record in Part 18 (EPIC-WB-2026-77801)'
        ],
        bloVerificationChecklist: [
          'Verify voter agrees with Part 18 booth assignment',
          'Obtain signed verification form'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 95,
          matchedVoterId: 'rec-012',
          matchedEpicNumber: 'EPIC-WB-2026-77801',
          matchedVoterName: 'Vikramaditya Roy',
          matchedConstituency: 'AC-164 Kolkata South, Part 18',
          similarityReasoning: 'Fuzzy address match (95% similarity). Exact voter name, age 38, father Tapan Roy.',
          matchingFactors: [
            'Exact Voter Name: Vikramaditya Roy',
            'Relative Name Match: Tapan Roy vs Tapan Kumar Roy',
            'Exact Age: 38 years (M)',
            'Fuzzy Address Similarity: 92% normalized match'
          ]
        },
        executiveSummary: 'Fuzzy Address Duplicate confirmed (95% similarity). Pending ERO purge action.',
        aiConfidence: 97
      }),
      created_at: '2026-07-29 09:20:00',
      updated_at: '2026-07-29 09:25:00'
    },
    {
      id: 'rec-014',
      epic_number: 'EPIC-WB-2026-22301',
      voter_name: 'Rabin Mukhopadhyay',
      relative_name: 'Sunil Mukhopadhyay',
      relation_type: 'Father',
      age: 55,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 05',
      part_number: 'Part 05 (Booth 06-A)',
      house_address: '19 Gariahat Road, Kolkata',
      blo_assigned: 'BLO-05 (D. Pal)',
      category: 'Transliteration Match',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-07-30 10:00:00',
      risk_score: 90,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 90,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Directive - Vernacular Transliteration Alias Dictionary Audit',
        rootCauseFactors: [
          'Bengali surname Mukhopadhyay equivalent to English roll Mukherjee',
          'Phonetic match Rabin vs Robin',
          'Identical age 55, father Sunil, and house address 19 Gariahat Road'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-05 to verify single identity of Rabin Mukhopadhyay / Robin Mukherjee',
          'Update primary name to voter preferred spelling'
        ],
        bloVerificationChecklist: [
          'Verify voter Aadhaar name representation',
          'Obtain Form 7 consent for duplicate alias removal'
        ],
        recommendedOwner: 'BLO-05 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 93,
          similarityReasoning: 'Primary record for Bengali surname transliteration duplicate audit.',
          matchingFactors: []
        },
        executiveSummary: 'Transliteration duplicate flagged (Mukhopadhyay <-> Mukherjee). Field audit dispatched.',
        aiConfidence: 94
      }),
      created_at: '2026-07-30 10:00:00',
      updated_at: '2026-07-30 10:00:00'
    },
    {
      id: 'rec-015',
      epic_number: 'EPIC-WB-2026-22302',
      voter_name: 'Robin Mukherjee',
      relative_name: 'Sunil Mukherjee',
      relation_type: 'Father',
      age: 55,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 05',
      part_number: 'Part 05 (Booth 06-A)',
      house_address: '19 Gariahat Road, Kolkata',
      blo_assigned: 'BLO-05 (D. Pal)',
      category: 'Transliteration Match',
      anomaly_severity: 'High',
      status: 'Flagged Duplicate',
      date_reported: '2026-07-30 10:05:00',
      risk_score: 93,
      is_duplicate: 1,
      duplicate_of_id: 'rec-014',
      duplicate_similarity: 93,
      ai_analysis_json: JSON.stringify({
        riskScore: 93,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 17 - Alias & Vernacular Double Registration Purge',
        rootCauseFactors: [
          'Vernacular alias match: Mukhopadhyay = Mukherjee',
          'Rabin/Robin phonetic equality (Soundex R150)',
          'Exact age 55 and identical house address 19 Gariahat Road'
        ],
        recommendedFieldActions: [
          'Issue Form 7 purge notice to Robin Mukherjee entry',
          'Retain Rabin Mukhopadhyay as primary verified voter'
        ],
        bloVerificationChecklist: [
          'Collect signed Form 7 surrender note',
          'Confirm single physical voter'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: true,
          confidenceScore: 93,
          matchedVoterId: 'rec-014',
          matchedEpicNumber: 'EPIC-WB-2026-22301',
          matchedVoterName: 'Rabin Mukhopadhyay',
          matchedConstituency: 'AC-164 Kolkata South, Part 05',
          similarityReasoning: 'Vernacular transliteration match (Mukhopadhyay <-> Mukherjee), Rabin <-> Robin, age 55, same address.',
          matchingFactors: [
            'Surname Transliteration: Mukhopadhyay <-> Mukherjee',
            'Phonetic First Name: Rabin <-> Robin (Code: R150)',
            'Exact Age: 55 years (M)',
            'Exact Address: 19 Gariahat Road'
          ]
        },
        executiveSummary: 'Transliteration Alias Duplicate confirmed (93% similarity). Flagged for ERO deletion.',
        aiConfidence: 96
      }),
      created_at: '2026-07-30 10:05:00',
      updated_at: '2026-07-30 10:10:00'
    },
    {
      id: 'rec-016',
      epic_number: 'EPIC-WB-2026-88301',
      voter_name: 'Rahul Sharma',
      relative_name: 'Kailash Sharma',
      relation_type: 'Father',
      age: 28,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 16',
      part_number: 'Part 16 (Booth 19-B)',
      house_address: '88 Hazra Road, Kalighat, Kolkata',
      blo_assigned: 'BLO-16 (S. Dutta)',
      category: 'Age/Relative Mismatch',
      anomaly_severity: 'Critical',
      status: 'Pending ERO Review',
      date_reported: '2026-07-31 09:00:00',
      risk_score: 96,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 96,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI SIR Manual Section 5.2 - Parent-Child Biological Generational Gap Rule',
        rootCauseFactors: [
          'Applicant Rahul Sharma age 28 lists Father Kailash Sharma age 32 in Part 16 roll',
          'Infeasible 4-year generational age gap between father and child',
          'High risk of fraudulent DOB declaration in Form 6 or database transcription error'
        ],
        recommendedFieldActions: [
          'Issue ERO notice to voter and father to produce birth certificate or school leaving certificate',
          'Dispatch BLO-16 to audit physical family tree'
        ],
        bloVerificationChecklist: [
          'Verify birth document / Passport of applicant',
          'Check actual biological father name and age'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Standalone demographic inconsistency record.',
          matchingFactors: []
        },
        executiveSummary: 'Critical 4-year parent-child age gap anomaly detected (Father 32 vs Son 28). ERO review active.',
        aiConfidence: 98
      }),
      created_at: '2026-07-31 09:00:00',
      updated_at: '2026-07-31 09:00:00'
    },
    {
      id: 'rec-017',
      epic_number: 'EPIC-WB-2026-88302',
      voter_name: 'Sanjay Sen',
      relative_name: 'Rajesh Sen',
      relation_type: 'Husband',
      age: 34,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 08',
      part_number: 'Part 08 (Booth 10-A)',
      house_address: '14/1 Chetla Central Road, Kolkata',
      blo_assigned: 'BLO-08 (K. Das)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-07-31 11:20:00',
      risk_score: 90,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 90,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Manual Section 4.1 - Gender & Marital Relation Tag Validation',
        rootCauseFactors: [
          'Elector Sanjay Sen marked as Male (M) with Relation Type "Husband"',
          'Contradiction between gender classification and marital relative designation',
          'Probable clerical error during Form 6 scanning or data entry operator entry'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-08 to inspect original Form 6 application copy',
          'Correct relation type tag to "Father" or update gender designation'
        ],
        bloVerificationChecklist: [
          'Inspect physical identity card',
          'Obtain Form 8 correction application from elector'
        ],
        recommendedOwner: 'BLO-08 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Logical demographic attribute mismatch.',
          matchingFactors: []
        },
        executiveSummary: 'Gender-Relation contradiction flagged (Male with "Husband" relative). Field verification assigned.',
        aiConfidence: 95
      }),
      created_at: '2026-07-31 11:20:00',
      updated_at: '2026-07-31 11:20:00'
    },
    {
      id: 'rec-018',
      epic_number: 'EPIC-WB-2026-88303',
      voter_name: 'Haripada Naskar',
      relative_name: 'Ramprasad Naskar',
      relation_type: 'Father',
      age: 132,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 03',
      part_number: 'Part 03 (Booth 04-B)',
      house_address: '5/B Kalighat Road, Kolkata',
      blo_assigned: 'BLO-03 (B. Biswas)',
      category: 'Age/Relative Mismatch',
      anomaly_severity: 'Critical',
      status: 'Field Verification Assigned',
      date_reported: '2026-08-01 08:45:00',
      risk_score: 98,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 98,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI SIR Anti-Ghost Elector Protocol - Centenarian Status & Deceased Verification',
        rootCauseFactors: [
          'Draft roll records elector age as 132 years without senior citizen life-certificate',
          'High probability of unrecorded death or historical year-of-birth transcription inversion (1894 vs 1994)',
          'No voter activity recorded in last two general election cycles'
        ],
        recommendedFieldActions: [
          'Priority door-to-door visit by BLO-03 to confirm if voter is living or deceased',
          'Initiate Form 7 statutory deletion if deceased certificate is retrieved'
        ],
        bloVerificationChecklist: [
          'Physical life-verification at 5/B Kalighat Road',
          'Obtain family statement or municipal death certificate'
        ],
        recommendedOwner: 'BLO-03 / ERO AC-164',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Super-centenarian age anomaly.',
          matchingFactors: []
        },
        executiveSummary: 'Super-centenarian age anomaly (132 years). High probability of un-flagged deceased elector.',
        aiConfidence: 99
      }),
      created_at: '2026-08-01 08:45:00',
      updated_at: '2026-08-01 08:45:00'
    },
    {
      id: 'rec-019',
      epic_number: 'EPIC-WB-2026-88304',
      voter_name: 'Sneha Das',
      relative_name: 'Tarun Das',
      relation_type: 'Father',
      age: 16,
      gender: 'F',
      assembly_constituency: 'AC-165 Jadavpur, Part 11',
      part_number: 'Part 11 (Booth 15-A)',
      house_address: '45 Garia Main Road, Kolkata',
      blo_assigned: 'BLO-11 (M. Pal)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'Critical',
      status: 'Pending ERO Review',
      date_reported: '2026-08-01 14:10:00',
      risk_score: 97,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 97,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'Representation of the People Act 1950 Section 19 - Minimum Qualifying Age 18 Years',
        rootCauseFactors: [
          'Draft roll lists active voter entry with declared age 16 years',
          'Statutory threshold violation (minimum qualifying age 18 years as of qualifying date)',
          'Erroneous approval of Form 6 by Electoral Registration Officer'
        ],
        recommendedFieldActions: [
          'Immediate ERO review to purge record under statutory age disqualification',
          'Issue notice to applicant regarding eligibility on reaching age 18'
        ],
        bloVerificationChecklist: [
          'Verify birth certificate / Secondary school examination admit card',
          'Confirm exact date of birth'
        ],
        recommendedOwner: 'ERO AC-165',
        targetSLAHours: 6,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Statutory age qualification violation.',
          matchingFactors: []
        },
        executiveSummary: 'Statutory underage voter enrollment flagged (Age 16). Immediate ERO purge review required.',
        aiConfidence: 99
      }),
      created_at: '2026-08-01 14:10:00',
      updated_at: '2026-08-01 14:10:00'
    },
    {
      id: 'rec-020',
      epic_number: 'EPIC-WB-2026-88305',
      voter_name: 'Bikash Chakraborty',
      relative_name: 'Tarun Chakraborty',
      relation_type: 'Father',
      age: 54,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 21',
      part_number: 'Part 21 (Booth 25-C)',
      house_address: '112 Southern Avenue, Kolkata',
      blo_assigned: 'BLO-21 (S. Roy)',
      category: 'Age/Relative Mismatch',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-08-02 10:30:00',
      risk_score: 92,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 92,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Household Tree Validation - Generational Inversion Rule',
        rootCauseFactors: [
          'Elector Bikash Chakraborty age 54 lists Father Tarun Chakraborty age 46',
          'Generational age inversion where son is listed 8 years older than declared father',
          'Swapped numeric age fields during roll compilation'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-21 to inspect voter family register',
          'File Form 8 application for age field transposition correction'
        ],
        bloVerificationChecklist: [
          'Verify Aadhaar / Voter ID of both Bikash and Tarun Chakraborty',
          'Confirm actual ages and relationship'
        ],
        recommendedOwner: 'BLO-21 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Generational age inversion in household tree.',
          matchingFactors: []
        },
        executiveSummary: 'Generational inversion detected (Son age 54 vs Father age 46). Field correction assigned.',
        aiConfidence: 96
      }),
      created_at: '2026-08-02 10:30:00',
      updated_at: '2026-08-02 10:30:00'
    },
    {
      id: 'rec-021',
      epic_number: 'EPIC-WB-2026-88306',
      voter_name: 'Amitabh Mukherjee',
      relative_name: 'Debasis Mukherjee',
      relation_type: 'Father',
      age: 82,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 07',
      part_number: 'Part 07 (Booth 09-A)',
      house_address: '44 Lansdowne Road, Kolkata',
      blo_assigned: 'BLO-07 (A. Ghosh)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-08-02 14:15:00',
      risk_score: 91,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 91,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Rules - DOB-Age Digit Transposition Audit',
        rootCauseFactors: [
          'Form 6 DOB recorded as 12/04/2005 (Age 21), but printed roll age is 82',
          'Digit transposition error during data entry (1944 vs 2005)',
          'Demographic age inconsistency flagged against voter birth certificate'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-07 to inspect original Form 6 application copy',
          'Submit Form 8 for age correction from 82 to 21'
        ],
        bloVerificationChecklist: [
          'Verify birth certificate or secondary admit card',
          'Collect signed Form 8 correction request'
        ],
        recommendedOwner: 'BLO-07 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Digit transposition age mismatch.',
          matchingFactors: []
        },
        executiveSummary: 'Age digit transposition anomaly (DOB 2005 recorded as Age 82). Field verification assigned.',
        aiConfidence: 95
      }),
      created_at: '2026-08-02 14:15:00',
      updated_at: '2026-08-02 14:15:00'
    },
    {
      id: 'rec-022',
      epic_number: 'EPIC-WB-2026-88307',
      voter_name: 'Sunita Rani Das',
      relative_name: 'Late Haradhan Das',
      relation_type: 'Mother',
      age: 41,
      gender: 'F',
      assembly_constituency: 'AC-164 Kolkata South, Part 12',
      part_number: 'Part 12 (Booth 14-B)',
      house_address: '18 Lake Terrace, Kolkata',
      blo_assigned: 'BLO-12 (A. Banerjee)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'High',
      status: 'Pending ERO Review',
      date_reported: '2026-08-03 09:30:00',
      risk_score: 88,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 88,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Directive - Relative Gender Tag Consistency Rules',
        rootCauseFactors: [
          'Relation type recorded as "Mother" but relative name is "Late Haradhan Das" (Male name)',
          'Mismatch between relation tag designation and relative gender classification',
          'Clerical error during Form 6 conversion'
        ],
        recommendedFieldActions: [
          'ERO review to update relation type to "Husband" or "Father"',
          'Contact applicant for confirmation'
        ],
        bloVerificationChecklist: [
          'Inspect voter ID / Aadhaar relative name representation',
          'Confirm relation type'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Relative gender tag mismatch.',
          matchingFactors: []
        },
        executiveSummary: 'Relative gender tag mismatch (Mother relation with male relative name). Pending ERO review.',
        aiConfidence: 94
      }),
      created_at: '2026-08-03 09:30:00',
      updated_at: '2026-08-03 09:30:00'
    },
    {
      id: 'rec-023',
      epic_number: 'EPIC-WB-2026-88308',
      voter_name: 'Vikram Malhotra',
      relative_name: 'Rajesh Malhotra',
      relation_type: 'Father',
      age: 35,
      gender: 'M',
      assembly_constituency: 'AC-165 Jadavpur, Part 18',
      part_number: 'Part 18 (Booth 20-A)',
      house_address: 'N/A NULL 000 ST, Kolkata',
      blo_assigned: 'BLO-18 (P. Roy)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'Critical',
      status: 'Field Verification Assigned',
      date_reported: '2026-08-03 11:00:00',
      risk_score: 95,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 95,
        anomalySeverity: 'Critical',
        regulatoryGuideline: 'ECI Electoral Roll Rules Section 11 - Valid Address & Location Verification',
        rootCauseFactors: [
          'House address recorded as dummy placeholder string "N/A NULL 000 ST"',
          'Fails ECI geographic house mapping and postal delivery standards',
          'High risk of fake voter registration or corrupted address field'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-18 to verify physical dwelling location',
          'Require voter to submit valid proof of address (utility bill / rent agreement)'
        ],
        bloVerificationChecklist: [
          'Conduct spot visit to Part 18 locality',
          'Obtain valid address documentation'
        ],
        recommendedOwner: 'BLO-18 / ERO AC-165',
        targetSLAHours: 12,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Dummy placeholder address anomaly.',
          matchingFactors: []
        },
        executiveSummary: 'Critical dummy address string ("N/A NULL 000 ST") detected. Field spot visit assigned.',
        aiConfidence: 98
      }),
      created_at: '2026-08-03 11:00:00',
      updated_at: '2026-08-03 11:00:00'
    },
    {
      id: 'rec-024',
      epic_number: 'EPIC-WB-2026-88309',
      voter_name: 'M',
      relative_name: 'B',
      relation_type: 'Father',
      age: 29,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 02',
      part_number: 'Part 02 (Booth 03-A)',
      house_address: '7 Strand Road, Kolkata',
      blo_assigned: 'BLO-02 (S. Mitra)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'High',
      status: 'Pending ERO Review',
      date_reported: '2026-08-03 15:45:00',
      risk_score: 89,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 89,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI Electoral Roll Manual Section 3.4 - Minimum Name Character Length Standard',
        rootCauseFactors: [
          'Voter name recorded as single character "M" and relative name "B"',
          'Fails ECI Rule requiring full voter name with at least 2 characters',
          'Incomplete registration entry submitted via online portal'
        ],
        recommendedFieldActions: [
          'Issue notice to voter to submit Form 8 for full expanded name entry',
          'Verify original identity documents'
        ],
        bloVerificationChecklist: [
          'Inspect Aadhaar card for full official name',
          'Obtain Form 8 correction'
        ],
        recommendedOwner: 'ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Single-character incomplete name entry.',
          matchingFactors: []
        },
        executiveSummary: 'Single-character name entry anomaly ("M" / "B"). Notice issued for full name completion.',
        aiConfidence: 96
      }),
      created_at: '2026-08-03 15:45:00',
      updated_at: '2026-08-03 15:45:00'
    },
    {
      id: 'rec-025',
      epic_number: 'EPIC-WB-2026-88310',
      voter_name: 'Subodh Kanti Ray',
      relative_name: 'Minati Ray',
      relation_type: 'Husband',
      age: 62,
      gender: 'M',
      assembly_constituency: 'AC-164 Kolkata South, Part 15',
      part_number: 'Part 15 (Booth 17-C)',
      house_address: '101 Rashbehari Avenue, Kolkata',
      blo_assigned: 'BLO-15 (R. Ghosh)',
      category: 'Demographic Inconsistency',
      anomaly_severity: 'High',
      status: 'Field Verification Assigned',
      date_reported: '2026-08-04 10:15:00',
      risk_score: 92,
      is_duplicate: 0,
      duplicate_of_id: null,
      duplicate_similarity: 0,
      ai_analysis_json: JSON.stringify({
        riskScore: 92,
        anomalySeverity: 'High',
        regulatoryGuideline: 'ECI SIR Verification Manual - Gender-Marital Relation Standard Rules',
        rootCauseFactors: [
          'Male elector Subodh Kanti Ray (Gender: M) has Relation Type recorded as "Husband" of Minati Ray',
          'Gender-Marital tag mismatch where male elector is designated with female relative tag',
          'Data entry transposition during roll digitisation'
        ],
        recommendedFieldActions: [
          'Dispatch BLO-15 to collect Form 8 for relationship tag correction',
          'Update relative relationship tag to "Father" or correct gender tag'
        ],
        bloVerificationChecklist: [
          'Inspect physical EPIC / Aadhaar',
          'Collect signed Form 8 application'
        ],
        recommendedOwner: 'BLO-15 / ERO AC-164',
        targetSLAHours: 24,
        duplicateAnalysis: {
          isDuplicate: false,
          confidenceScore: 0,
          similarityReasoning: 'Male with Husband relative relation tag.',
          matchingFactors: []
        },
        executiveSummary: 'Gender-relation tag mismatch (Male marked with Husband relation). Field verification active.',
        aiConfidence: 95
      }),
      created_at: '2026-08-04 10:15:00',
      updated_at: '2026-08-04 10:15:00'
    }
  ];

  for (const rec of initialRecords) {
    database.run(`
      INSERT OR REPLACE INTO electoral_records (
        id, epic_number, voter_name, relative_name, relation_type, age, gender,
        assembly_constituency, part_number, house_address, blo_assigned, category,
        anomaly_severity, status, date_reported, risk_score, is_duplicate,
        duplicate_of_id, duplicate_similarity, ai_analysis_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      rec.id, rec.epic_number, rec.voter_name, rec.relative_name, rec.relation_type,
      rec.age, rec.gender, rec.assembly_constituency, rec.part_number, rec.house_address,
      rec.blo_assigned, rec.category, rec.anomaly_severity, rec.status, rec.date_reported,
      rec.risk_score, rec.is_duplicate, rec.duplicate_of_id, rec.duplicate_similarity,
      rec.ai_analysis_json, rec.created_at, rec.updated_at
    ]);

    // Initial audit log entry
    database.run(`
      INSERT OR REPLACE INTO review_actions (
        id, incident_id, action_type, reviewer_name, reviewer_role, notes,
        prev_status, new_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `rev-${rec.id}-1`,
      rec.id,
      rec.is_duplicate ? 'Flagged Duplicate' : 'Recorded',
      'SIR AI Engine',
      'SIR AI Engine',
      rec.is_duplicate ? `Automatically flagged as duplicate of ${rec.duplicate_of_id} (${rec.duplicate_similarity}% match)` : `Electoral roll record ingested. Anomaly Level: ${rec.anomaly_severity}.`,
      'Draft Ingest',
      rec.status,
      rec.created_at
    ]);
  }
}

export function getAllElectoralRecords(filters?: {
  search?: string;
  severity?: string;
  status?: string;
  category?: string;
  isDuplicateOnly?: boolean;
}): ElectoralRecord[] {
  if (!db) throw new Error("Database not initialized");

  let query = "SELECT * FROM electoral_records WHERE 1=1";
  const params: any[] = [];

  if (filters?.search) {
    query += " AND (voter_name LIKE ? OR epic_number LIKE ? OR relative_name LIKE ? OR house_address LIKE ? OR assembly_constituency LIKE ?)";
    const term = `%${filters.search}%`;
    params.push(term, term, term, term, term);
  }
  if (filters?.severity && filters.severity !== 'All') {
    query += " AND anomaly_severity = ?";
    params.push(filters.severity);
  }
  if (filters?.status && filters.status !== 'All') {
    query += " AND status = ?";
    params.push(filters.status);
  }
  if (filters?.category && filters.category !== 'All') {
    query += " AND category = ?";
    params.push(filters.category);
  }
  if (filters?.isDuplicateOnly) {
    query += " AND is_duplicate = 1";
  }

  query += " ORDER BY created_at DESC";

  const stmt = db.prepare(query);
  stmt.bind(params);

  const records: ElectoralRecord[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    records.push(mapRowToRecord(row));
  }
  stmt.free();

  return records;
}

export function getRecordById(id: string): ElectoralRecord | null {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare("SELECT * FROM electoral_records WHERE id = ? OR epic_number = ?");
  stmt.bind([id, id]);

  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return mapRowToRecord(row);
  }
  stmt.free();
  return null;
}

export function createElectoralRecord(record: Omit<ElectoralRecord, 'id' | 'createdAt' | 'updatedAt'>): ElectoralRecord {
  if (!db) throw new Error("Database not initialized");

  const id = `rec-${Date.now()}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const isDupNum = record.isDuplicate ? 1 : 0;
  const aiJson = record.aiAnalysis ? JSON.stringify(record.aiAnalysis) : null;

  db.run(`
    INSERT INTO electoral_records (
      id, epic_number, voter_name, relative_name, relation_type, age, gender,
      assembly_constituency, part_number, house_address, blo_assigned, category,
      anomaly_severity, status, date_reported, risk_score, is_duplicate,
      duplicate_of_id, duplicate_similarity, ai_analysis_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, record.epicNumber, record.voterName, record.relativeName, record.relationType || 'Father',
    record.age || 30, record.gender || 'M', record.assemblyConstituency, record.partNumber || 'Part 01',
    record.houseAddress, record.bloAssigned || 'BLO Field Agent', record.category,
    record.anomalySeverity || 'Medium', record.status, record.dateReported || now,
    record.riskScore || 50, isDupNum, record.duplicateOfId || null,
    record.duplicateSimilarity || 0, aiJson, now, now
  ]);

  // Record audit log
  db.run(`
    INSERT INTO review_actions (
      id, incident_id, action_type, reviewer_name, reviewer_role, notes,
      prev_status, new_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    `rev-${Date.now()}`,
    id,
    'Recorded',
    'SIR AI Engine',
    'SIR AI Engine',
    `New electoral roll record ingested into SQLite database. EPIC: ${record.epicNumber}. Anomaly Score: ${record.riskScore}.`,
    'Draft Ingest',
    record.status,
    now
  ]);

  saveDb();

  return getRecordById(id)!;
}

export function recordReviewAction(
  recordId: string,
  actionType: ReviewAction['actionType'],
  reviewerName: string,
  reviewerRole: ReviewAction['reviewerRole'],
  notes: string,
  newStatus: SIRStatus
): { record: ElectoralRecord; reviewAction: ReviewAction } {
  if (!db) throw new Error("Database not initialized");

  const record = getRecordById(recordId);
  if (!record) throw new Error(`Electoral record with id ${recordId} not found`);

  const prevStatus = record.status;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const actionId = `rev-${Date.now()}`;

  const isDup = newStatus === 'Flagged Duplicate' || newStatus === 'Purged / Deleted' ? 1 : record.isDuplicate ? 1 : 0;

  db.run(`
    UPDATE electoral_records
    SET status = ?, is_duplicate = ?, updated_at = ?
    WHERE id = ?
  `, [newStatus, isDup, now, recordId]);

  db.run(`
    INSERT INTO review_actions (
      id, incident_id, action_type, reviewer_name, reviewer_role, notes,
      prev_status, new_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    actionId, recordId, actionType, reviewerName, reviewerRole, notes,
    prevStatus, newStatus, now
  ]);

  saveDb();

  const updatedRecord = getRecordById(recordId)!;
  const reviewAction: ReviewAction = {
    id: actionId,
    incidentId: recordId,
    actionType,
    reviewerName,
    reviewerRole,
    notes,
    prevStatus,
    newStatus,
    createdAt: now
  };

  return { record: updatedRecord, reviewAction };
}

export function getReviewActionsForRecord(recordId: string): ReviewAction[] {
  if (!db) throw new Error("Database not initialized");

  const stmt = db.prepare(`
    SELECT * FROM review_actions
    WHERE incident_id = ?
    ORDER BY created_at ASC
  `);
  stmt.bind([recordId]);

  const actions: ReviewAction[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    actions.push({
      id: row.id,
      incidentId: row.incident_id,
      actionType: row.action_type,
      reviewerName: row.reviewer_name,
      reviewerRole: row.reviewer_role,
      notes: row.notes,
      prevStatus: row.prev_status as SIRStatus,
      newStatus: row.new_status as SIRStatus,
      createdAt: row.created_at
    });
  }
  stmt.free();

  return actions;
}

export function getDashboardStats(): DashboardStats {
  if (!db) throw new Error("Database not initialized");

  const totalStmt = db.prepare("SELECT COUNT(*) as count FROM electoral_records");
  totalStmt.step();
  const totalIncidents = (totalStmt.getAsObject() as any).count;
  totalStmt.free();

  const pendingStmt = db.prepare("SELECT COUNT(*) as count FROM electoral_records WHERE status IN ('Pending ERO Review', 'Field Verification Assigned')");
  pendingStmt.step();
  const pendingReviews = (pendingStmt.getAsObject() as any).count;
  pendingStmt.free();

  const dupStmt = db.prepare("SELECT COUNT(*) as count FROM electoral_records WHERE is_duplicate = 1 OR status = 'Flagged Duplicate'");
  dupStmt.step();
  const flaggedDuplicates = (dupStmt.getAsObject() as any).count;
  dupStmt.free();

  const critStmt = db.prepare("SELECT COUNT(*) as count FROM electoral_records WHERE anomaly_severity IN ('Critical', 'High')");
  critStmt.step();
  const criticalRisks = (critStmt.getAsObject() as any).count;
  critStmt.free();

  const approvedStmt = db.prepare("SELECT COUNT(*) as count FROM electoral_records WHERE status = 'Marked Valid'");
  approvedStmt.step();
  const approvedResolved = (approvedStmt.getAsObject() as any).count;
  approvedStmt.free();

  return {
    totalIncidents,
    pendingReviews,
    flaggedDuplicates,
    criticalRisks,
    approvedResolved,
    aiAvgConfidence: 96
  };
}

function mapRowToRecord(row: any): ElectoralRecord {
  let aiAnalysis = undefined;
  if (row.ai_analysis_json) {
    try {
      aiAnalysis = JSON.parse(row.ai_analysis_json);
    } catch (e) {
      console.error("Failed to parse ai_analysis_json", e);
    }
  }

  return {
    id: row.id,
    epicNumber: row.epic_number,
    voterName: row.voter_name,
    relativeName: row.relative_name,
    relationType: row.relation_type || 'Father',
    age: Number(row.age) || 30,
    gender: row.gender || 'M',
    assemblyConstituency: row.assembly_constituency,
    partNumber: row.part_number,
    houseAddress: row.house_address,
    bloAssigned: row.blo_assigned,
    category: row.category as SIRCategory,
    anomalySeverity: row.anomaly_severity as AnomalySeverity,
    status: row.status as SIRStatus,
    dateReported: row.date_reported,
    riskScore: row.risk_score,
    isDuplicate: Boolean(row.is_duplicate),
    duplicateOfId: row.duplicate_of_id || undefined,
    duplicateSimilarity: row.duplicate_similarity || 0,
    aiAnalysis,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
