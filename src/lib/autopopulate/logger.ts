
/**
 * Structured Logging for Enrichment Operations
 * Phase 2 - BirthdayGen.com
 * 
 * Logs enrichment operations to file system
 * Replace with proper logging service (DataDog, Sentry, etc.) for production
 */

import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { EnrichmentLogEntry } from './types';

// Log directory
const LOG_DIR = join(process.cwd(), 'logs', 'enrichment');

/**
 * Initialize logging system
 */
async function initLogger() {
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
}

/**
 * Log an enrichment operation
 */
export async function logEnrichment(entry: EnrichmentLogEntry): Promise<void> {
  try {
    await initLogger();
    
    // Format log entry as JSON
    const logLine = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    }) + '\n';
    
    // Determine log file based on date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = join(LOG_DIR, `enrichment-${date}.log`);
    
    // Append to log file
    await appendFile(logFile, logLine, 'utf-8');
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ENRICHMENT]', {
        operation: entry.operation,
        userId: entry.userId,
        success: entry.success,
        duration: `${entry.duration}ms`,
        error: entry.error,
      });
    }
  } catch (error) {
    // Fail silently - don't break enrichment if logging fails
    console.error('Failed to log enrichment:', error);
  }
}

/**
 * Log enrichment error
 */
export async function logEnrichmentError(
  userId: string,
  operation: string,
  error: Error,
  metadata?: Record<string, any>
): Promise<void> {
  await logEnrichment({
    timestamp: new Date(),
    userId,
    operation: operation as any,
    success: false,
    duration: 0,
    error: error.message,
    metadata: {
      stack: error.stack,
      ...metadata,
    },
  });
}

/**
 * Log enrichment success
 */
export async function logEnrichmentSuccess(
  userId: string,
  operation: string,
  duration: number,
  metadata?: Record<string, any>
): Promise<void> {
  await logEnrichment({
    timestamp: new Date(),
    userId,
    operation: operation as any,
    success: true,
    duration,
    metadata,
  });
}

/**
 * Get logs for a specific date
 */
export async function getLogsByDate(date: string): Promise<EnrichmentLogEntry[]> {
  try {
    const logFile = join(LOG_DIR, `enrichment-${date}.log`);
    
    if (!existsSync(logFile)) {
      return [];
    }
    
    const { readFile } = await import('fs/promises');
    const content = await readFile(logFile, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    return lines.map(line => {
      const parsed = JSON.parse(line);
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp),
      };
    });
  } catch (error) {
    console.error('Failed to read logs:', error);
    return [];
  }
}

/**
 * Get logs for a specific user
 */
export async function getLogsByUser(userId: string, days: number = 7): Promise<EnrichmentLogEntry[]> {
  const allLogs: EnrichmentLogEntry[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const logs = await getLogsByDate(dateStr);
    const userLogs = logs.filter(log => log.userId === userId);
    allLogs.push(...userLogs);
  }
  
  return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get enrichment statistics
 */
export async function getEnrichmentStats(days: number = 7): Promise<{
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  operationsByType: Record<string, number>;
}> {
  const allLogs: EnrichmentLogEntry[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const logs = await getLogsByDate(dateStr);
    allLogs.push(...logs);
  }
  
  const totalOperations = allLogs.length;
  const successfulOperations = allLogs.filter(log => log.success).length;
  const failedOperations = totalOperations - successfulOperations;
  
  const averageDuration = allLogs.length > 0
    ? Math.round(allLogs.reduce((sum, log) => sum + log.duration, 0) / allLogs.length)
    : 0;
  
  const operationsByType: Record<string, number> = {};
  allLogs.forEach(log => {
    operationsByType[log.operation] = (operationsByType[log.operation] || 0) + 1;
  });
  
  return {
    totalOperations,
    successfulOperations,
    failedOperations,
    averageDuration,
    operationsByType,
  };
}
