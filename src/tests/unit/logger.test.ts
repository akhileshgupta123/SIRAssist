import { describe, it, expect } from 'vitest';
import { logger } from '../../backend/logger.js';

describe('Unit Tests: Structured Logging Framework', () => {
  it('should capture info log entries with correlation ID and context', () => {
    logger.clearLogs();

    const entry = logger.info(
      'TEST_EVENT',
      'Test informational log message',
      { userId: 'ero-01', constituency: 'AC-164' },
      'corr-12345'
    );

    expect(entry).toBeDefined();
    expect(entry.level).toBe('INFO');
    expect(entry.event).toBe('TEST_EVENT');
    expect(entry.message).toBe('Test informational log message');
    expect(entry.correlationId).toBe('corr-12345');
    expect(entry.context?.userId).toBe('ero-01');

    const recentLogs = logger.getRecentLogs(10);
    expect(recentLogs.length).toBeGreaterThan(0);
    expect(recentLogs[0].event).toBe('TEST_EVENT');
  });

  it('should capture error log entries with stack trace', () => {
    logger.clearLogs();

    const testErr = new Error('Database disk write failure');
    const entry = logger.error(
      'DB_WRITE_ERROR',
      'Failed to persist SQLite record',
      testErr,
      { epicNumber: 'EPIC-ERR-1' }
    );

    expect(entry.level).toBe('ERROR');
    expect(entry.error?.message).toBe('Database disk write failure');
    expect(entry.error?.stack).toBeDefined();

    const errorLogs = logger.getRecentLogs(10, 'ERROR');
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].event).toBe('DB_WRITE_ERROR');
  });
});
