import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  getAllElectoralRecords,
  getRecordById,
  createElectoralRecord,
  recordReviewAction,
  getReviewActionsForRecord,
  getDashboardStats,
} from './src/backend/db.js';
import { analyzeElectoralRecordWithGemini } from './src/backend/geminiService.js';
import { SampleScenario } from './src/types.js';

const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'scen-01',
    title: 'Inter-Constituency Duplicate Voter Record',
    subtitle: 'Demographic & Photo Hash Match (AC-164 & AC-165)',
    category: 'Demographic Match',
    severity: 'High',
    constituency: 'AC-164 Kolkata South, Part 12',
    reportedBy: 'SIR Roll Ingest Audit',
    voterName: 'Rajesh K Sharma',
    epicNumber: 'EPIC-WB-2026-88102',
    description: 'Voter registered under AC-165 Jadavpur matches voter Rajesh Kumar Sharma in AC-164. Same father name, age 42, and identical facial hash.',
    expectedDuplicate: true,
    duplicateMatchTarget: 'EPIC-WB-2026-90412',
    badgeTag: 'Cross-AC Duplicate Test',
  },
  {
    id: 'scen-02',
    title: 'Logical Age-Father Gap Anomaly (3-Year Difference)',
    subtitle: 'Invalid Form 6 Date of Birth Declaration',
    category: 'Age/Relative Mismatch',
    severity: 'Critical',
    constituency: 'AC-164 Kolkata South, Part 15',
    reportedBy: 'Logical Verification Engine',
    voterName: 'Ananya Roy',
    epicNumber: 'EPIC-WB-2026-40119',
    description: 'Applicant declared age 19, Father Subhash Roy declared age 22 in same part roll. High anomaly risk requiring ERO document verification.',
    expectedDuplicate: false,
    badgeTag: 'Logical Integrity Test',
  },
  {
    id: 'scen-03',
    title: 'Bulk Address Registration at Commercial Unoccupied Shed',
    subtitle: 'Ghost Voter & Multi-Registration Cluster',
    category: 'Bulk Address Cluster',
    severity: 'High',
    constituency: 'AC-164 Kolkata South, Part 09',
    reportedBy: 'GIS Location Auditor',
    voterName: 'Sunil Kumar Bose',
    epicNumber: 'EPIC-WB-2026-77310',
    description: 'Address Plot 14 Dockyard Road has 48 voter entries registered to an unoccupied industrial shed. Flagged for BLO spot verification.',
    expectedDuplicate: false,
    badgeTag: 'Bulk Cluster Test',
  },
  {
    id: 'scen-04',
    title: 'Verified Form-8 Relocation & Address Transfer',
    subtitle: 'Legitimate Migration Pass Case',
    category: 'Demographic Match',
    severity: 'Low',
    constituency: 'AC-164 Kolkata South, Part 12',
    reportedBy: 'BLO Door-to-Door Audit',
    voterName: 'Meena Devi Agarwal',
    epicNumber: 'EPIC-WB-2026-11204',
    description: 'Relocation transfer verified with marriage certificate and previous EPIC surrender receipt. Ready for ERO Mark Valid certification.',
    expectedDuplicate: false,
    badgeTag: 'Clean Migration Test',
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite database
  await getDb();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'SIRAssist Electoral Roll Platform', timestamp: new Date().toISOString() });
  });

  // Get Dashboard Stats
  app.get('/api/stats', (req, res) => {
    try {
      const stats = getDashboardStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Electoral Records with filters
  app.get('/api/incidents', (req, res) => {
    try {
      const { search, severity, status, category, isDuplicateOnly } = req.query;
      const incidents = getAllElectoralRecords({
        search: search as string,
        severity: severity as string,
        status: status as string,
        category: category as string,
        isDuplicateOnly: isDuplicateOnly === 'true',
      });
      res.json({ success: true, incidents, count: incidents.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single record with review audit history
  app.get('/api/incidents/:id', (req, res) => {
    try {
      const record = getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Electoral record not found' });
      }
      const reviewActions = getReviewActionsForRecord(record.id);
      res.json({ success: true, record, reviewActions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Analyze voter record draft with Gemini
  app.post('/api/incidents/analyze', async (req, res) => {
    try {
      const { voterName, relativeName, houseAddress, assemblyConstituency, category, age, gender, epicNumber } = req.body;
      if (!voterName || !epicNumber) {
        return res.status(400).json({ success: false, error: 'voterName and epicNumber are required' });
      }

      const analysis = await analyzeElectoralRecordWithGemini(
        voterName,
        relativeName || 'Unspecified Relative',
        houseAddress || 'Unspecified Address',
        assemblyConstituency || 'AC-164 Kolkata South',
        category || 'Demographic Match',
        Number(age) || 30,
        gender || 'M',
        epicNumber
      );

      res.json({ success: true, analysis });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Record / Ingest Electoral Record
  app.post('/api/incidents/record', async (req, res) => {
    try {
      const {
        voterName,
        relativeName,
        relationType,
        age,
        gender,
        epicNumber,
        assemblyConstituency,
        partNumber,
        houseAddress,
        bloAssigned,
        category,
        dateReported
      } = req.body;

      if (!voterName || !epicNumber) {
        return res.status(400).json({ success: false, error: 'voterName and epicNumber are required' });
      }

      const aiAnalysis = await analyzeElectoralRecordWithGemini(
        voterName,
        relativeName || 'Father',
        houseAddress || 'Address Not Stated',
        assemblyConstituency || 'AC-164 Kolkata South',
        category || 'Demographic Match',
        Number(age) || 30,
        gender || 'M',
        epicNumber
      );

      const isDuplicate = aiAnalysis.duplicateAnalysis.isDuplicate;

      const record = createElectoralRecord({
        epicNumber,
        voterName,
        relativeName: relativeName || 'Not Stated',
        relationType: relationType || 'Father',
        age: Number(age) || 30,
        gender: gender || 'M',
        assemblyConstituency: assemblyConstituency || 'AC-164 Kolkata South',
        partNumber: partNumber || 'Part 01',
        houseAddress: houseAddress || 'General Area',
        bloAssigned: bloAssigned || 'BLO-12 (Assigned)',
        category: category || 'Demographic Match',
        anomalySeverity: aiAnalysis.anomalySeverity,
        status: isDuplicate ? 'Flagged Duplicate' : 'Pending ERO Review',
        dateReported: dateReported || new Date().toISOString().replace('T', ' ').substring(0, 19),
        riskScore: aiAnalysis.riskScore,
        isDuplicate,
        duplicateOfId: aiAnalysis.duplicateAnalysis.matchedVoterId,
        duplicateSimilarity: aiAnalysis.duplicateAnalysis.confidenceScore,
        aiAnalysis,
      });

      res.json({ success: true, incident: record, record, aiAnalysis });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Batch Ingest / Upload Voter List (CSV/JSON)
  app.post('/api/incidents/batch', async (req, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, error: 'Array of voter records required' });
      }

      const ingestedRecords = [];
      for (const item of records.slice(0, 20)) { // limit max batch to 20 for prompt performance
        const voterName = item.voterName || item['Voter Name'] || item.name;
        const epicNumber = item.epicNumber || item['EPIC Number'] || item.epic || `EPIC-WB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        if (!voterName) continue;

        const relativeName = item.relativeName || item['Father/Relative Name'] || item.relative || 'Father';
        const houseAddress = item.houseAddress || item['Address'] || item.address || 'Kolkata Central';
        const assemblyConstituency = item.assemblyConstituency || item['Assembly Constituency'] || item.constituency || 'AC-164 Kolkata South';
        const age = Number(item.age || 35);
        const gender = item.gender || 'M';
        const category = item.category || 'Demographic Match';

        const aiAnalysis = await analyzeElectoralRecordWithGemini(
          voterName,
          relativeName,
          houseAddress,
          assemblyConstituency,
          category,
          age,
          gender,
          epicNumber
        );

        const isDuplicate = aiAnalysis.duplicateAnalysis.isDuplicate;

        const rec = createElectoralRecord({
          epicNumber,
          voterName,
          relativeName,
          relationType: item.relationType || 'Father',
          age,
          gender,
          assemblyConstituency,
          partNumber: item.partNumber || 'Part 12',
          houseAddress,
          bloAssigned: item.bloAssigned || 'BLO-12 (Assigned)',
          category,
          anomalySeverity: aiAnalysis.anomalySeverity,
          status: isDuplicate ? 'Flagged Duplicate' : 'Pending ERO Review',
          dateReported: new Date().toISOString().replace('T', ' ').substring(0, 19),
          riskScore: aiAnalysis.riskScore,
          isDuplicate,
          duplicateOfId: aiAnalysis.duplicateAnalysis.matchedVoterId,
          duplicateSimilarity: aiAnalysis.duplicateAnalysis.confidenceScore,
          aiAnalysis,
        });

        ingestedRecords.push(rec);
      }

      res.json({
        success: true,
        count: ingestedRecords.length,
        records: ingestedRecords
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Record Review Action (BLO / ERO)
  app.post('/api/incidents/:id/review', (req, res) => {
    try {
      const { actionType, reviewerName, reviewerRole, notes, newStatus } = req.body;
      const recordId = req.params.id;

      if (!actionType || !newStatus) {
        return res.status(400).json({ success: false, error: 'actionType and newStatus are required' });
      }

      const result = recordReviewAction(
        recordId,
        actionType,
        reviewerName || 'Electoral Registration Officer (ERO)',
        reviewerRole || 'Electoral Registration Officer (ERO)',
        notes || 'SIR Action logged in Electoral Roll database.',
        newStatus
      );

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sample Scenarios
  app.get('/api/scenarios', (req, res) => {
    res.json({ success: true, scenarios: SAMPLE_SCENARIOS });
  });

  // Python Code Inspector route
  app.get('/api/python-code', (req, res) => {
    try {
      const pyFilePath = path.join(process.cwd(), 'backend', 'sir_assist_api.py');
      if (fs.existsSync(pyFilePath)) {
        const code = fs.readFileSync(pyFilePath, 'utf-8');
        res.json({ success: true, code });
      } else {
        res.json({ success: false, error: 'Python file not found' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIRAssist Electoral Roll Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
