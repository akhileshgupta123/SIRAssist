import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { ElectoralRecord, ReviewAction, DashboardStats, SIRCategory, AnomalySeverity, SIRStatus } from '../types.js';

let db: Database | null = null;
const dbFilePath = path.join(process.cwd(), 'data', 'sir_assist.db');

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();
  const dbDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    const filebuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  initTables(db);
  saveDb();
  return db;
}

export function saveDb(): void {
  if (!db) return;
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

  // Check if seeded
  const stmt = database.prepare("SELECT COUNT(*) as count FROM electoral_records");
  let count = 0;
  if (stmt.step()) {
    count = (stmt.getAsObject() as { count: number }).count;
  }
  stmt.free();

  if (count === 0) {
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
    }
  ];

  for (const rec of initialRecords) {
    database.run(`
      INSERT INTO electoral_records (
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
      INSERT INTO review_actions (
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
