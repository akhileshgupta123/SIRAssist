/**
 * Structured Logging Framework for Backend Services & Express API
 * Standardizes log format, correlation tracking, error capturing, and log persistence.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  message: string;
  correlationId?: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

class StructuredLogger {
  private serviceName: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 250;

  constructor(serviceName: string = 'sirassist-backend') {
    this.serviceName = serviceName;
  }

  private createEntry(
    level: LogLevel,
    event: string,
    message: string,
    context?: Record<string, any>,
    err?: any,
    correlationId?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      event,
      message,
      correlationId: correlationId || (context?.correlationId as string) || undefined,
      context: context ? { ...context } : undefined
    };

    if (err) {
      if (err instanceof Error) {
        entry.error = {
          name: err.name,
          message: err.message,
          stack: err.stack
        };
      } else {
        entry.error = {
          message: String(err)
        };
      }
    }

    // Retain in in-memory buffer for UI inspection
    this.logBuffer.unshift(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.pop();
    }

    return entry;
  }

  private printToConsole(entry: LogEntry) {
    const jsonOutput = JSON.stringify(entry);

    switch (entry.level) {
      case 'ERROR':
        console.error(`[${entry.timestamp}] [ERROR] [${entry.event}] ${entry.message}`, jsonOutput);
        break;
      case 'WARN':
        console.warn(`[${entry.timestamp}] [WARN] [${entry.event}] ${entry.message}`, jsonOutput);
        break;
      case 'DEBUG':
        console.debug(`[${entry.timestamp}] [DEBUG] [${entry.event}] ${entry.message}`, jsonOutput);
        break;
      case 'INFO':
      default:
        console.log(`[${entry.timestamp}] [INFO] [${entry.event}] ${entry.message}`, jsonOutput);
        break;
    }
  }

  public info(event: string, message: string, context?: Record<string, any>, correlationId?: string): LogEntry {
    const entry = this.createEntry('INFO', event, message, context, undefined, correlationId);
    this.printToConsole(entry);
    return entry;
  }

  public warn(event: string, message: string, context?: Record<string, any>, correlationId?: string): LogEntry {
    const entry = this.createEntry('WARN', event, message, context, undefined, correlationId);
    this.printToConsole(entry);
    return entry;
  }

  public error(event: string, message: string, err?: any, context?: Record<string, any>, correlationId?: string): LogEntry {
    const entry = this.createEntry('ERROR', event, message, context, err, correlationId);
    this.printToConsole(entry);
    return entry;
  }

  public debug(event: string, message: string, context?: Record<string, any>, correlationId?: string): LogEntry {
    const entry = this.createEntry('DEBUG', event, message, context, undefined, correlationId);
    this.printToConsole(entry);
    return entry;
  }

  public getRecentLogs(limit: number = 50, levelFilter?: LogLevel): LogEntry[] {
    let logs = this.logBuffer;
    if (levelFilter) {
      logs = logs.filter(l => l.level === levelFilter);
    }
    return logs.slice(0, limit);
  }

  public clearLogs() {
    this.logBuffer = [];
  }
}

export const logger = new StructuredLogger('sirassist-api');
