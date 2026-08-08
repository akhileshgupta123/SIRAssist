import { describe, it, expect, beforeAll } from 'vitest';
import {
  getDb,
  getAllElectoralRecords,
  getRecordById,
  createElectoralRecord,
  recordReviewAction,
  getDashboardStats
} from '../../backend/db.js';

describe('Integration Tests: SQLite Database API & Service Layer', () => {
  beforeAll(async () => {
    // Ensure DB is initialized before executing tests
    await getDb();
  });

  it('GET /api/health - DB status should be initialized and operational', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it('GET /api/stats - should compute correct dashboard KPIs', async () => {
    const stats = getDashboardStats();
    expect(stats).toBeDefined();
    expect(stats.totalIncidents).toBeGreaterThan(0);
    expect(stats.pendingReviews).toBeGreaterThanOrEqual(0);
    expect(stats.flaggedDuplicates).toBeGreaterThanOrEqual(0);
    expect(stats.aiAvgConfidence).toBeGreaterThan(80);
  });

  it('GET /api/incidents - should retrieve electoral roll records with filters', async () => {
    const allRecords = getAllElectoralRecords();
    expect(allRecords.length).toBeGreaterThan(0);

    // Test search filter
    const searchResults = getAllElectoralRecords({ search: 'Rajesh' });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.some(r => r.voterName.includes('Rajesh') || r.relativeName.includes('Rajesh'))).toBe(true);

    // Test category filter for Demographic Inconsistency
    const demographicInconsistencyRecords = getAllElectoralRecords({ category: 'Demographic Inconsistency' });
    expect(demographicInconsistencyRecords.length).toBeGreaterThan(0);
    expect(demographicInconsistencyRecords.every(r => r.category === 'Demographic Inconsistency')).toBe(true);

    // Test severity filter
    const highSeverityRecords = getAllElectoralRecords({ severity: 'High' });
    expect(highSeverityRecords.every(r => r.anomalySeverity === 'High')).toBe(true);
  });

  it('GET /api/incidents/:id - should fetch record by EPIC or ID', async () => {
    const record = getRecordById('rec-001');
    expect(record).not.toBeNull();
    expect(record?.epicNumber).toBe('EPIC-WB-2026-90412');
    expect(record?.voterName).toBe('Rajesh Kumar Sharma');
  });

  it('POST /api/incidents/record - should ingest new electoral record into SQLite', async () => {
    const testEpic = `EPIC-TEST-${Date.now()}`;
    const newRecord = createElectoralRecord({
      epicNumber: testEpic,
      voterName: 'Test Voter Automated',
      relativeName: 'Father Test',
      relationType: 'Father',
      age: 30,
      gender: 'M',
      assemblyConstituency: 'AC-164 Kolkata South',
      partNumber: 'Part 01',
      houseAddress: '123 Test Street',
      bloAssigned: 'BLO-01 Test',
      category: 'Demographic Match',
      anomalySeverity: 'Low',
      status: 'Pending ERO Review',
      dateReported: new Date().toISOString(),
      riskScore: 20,
      isDuplicate: false,
      duplicateSimilarity: 0
    });

    expect(newRecord).toBeDefined();
    expect(newRecord.id).toBeDefined();
    expect(newRecord.epicNumber).toBe(testEpic);

    // Verify record exists in DB
    const fetched = getRecordById(newRecord.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.voterName).toBe('Test Voter Automated');
  });

  it('POST /api/incidents/:id/review - should execute Form-7 review action and update status', async () => {
    const testEpic = `EPIC-REV-${Date.now()}`;
    const record = createElectoralRecord({
      epicNumber: testEpic,
      voterName: 'Review Test Voter',
      relativeName: 'Review Relative',
      relationType: 'Father',
      age: 28,
      gender: 'F',
      assemblyConstituency: 'AC-164 Kolkata South',
      partNumber: 'Part 05',
      houseAddress: '456 Review Road',
      bloAssigned: 'BLO-05 Agent',
      category: 'Demographic Match',
      anomalySeverity: 'High',
      status: 'Flagged Duplicate',
      dateReported: new Date().toISOString(),
      riskScore: 85,
      isDuplicate: true,
      duplicateSimilarity: 90
    });

    const reviewResult = recordReviewAction(
      record.id,
      'Purged',
      'Test ERO Magistrate',
      'Electoral Registration Officer (ERO)',
      'Executed Form-7 purge action after BLO door-to-door verification.',
      'Purged / Deleted'
    );

    expect(reviewResult.record.status).toBe('Purged / Deleted');
    expect(reviewResult.reviewAction.actionType).toBe('Purged');
    expect(reviewResult.reviewAction.reviewerName).toBe('Test ERO Magistrate');
  });
});
