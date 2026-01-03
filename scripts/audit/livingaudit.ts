// scripts/audit/livingaudit.ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import * as crypto from 'node:crypto';

interface AuditConfig {
  projectName: string;
  rootDir: string;
  scanPatterns: string[];
  excludePatterns: string[];
  beadsPath: string;
  memoryPath: string;
}

interface FileManifest {
  path: string;
  hash: string;
  mtime: Date;
  ctime: Date;
  size: number;
  associatedTask?: string;
}

interface ConflictDetection {
  type: 'VERSION' | 'OWNERSHIP' | 'LOGIC' | 'TIMING' | 'DEPENDENCY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedFiles: string[];
  resolution?: string;
}

class LivingAuditOrchestrator {
  private readonly config: AuditConfig;
  private readonly currentCycle: number;
  private manifest: FileManifest[] = [];
  private conflicts: ConflictDetection[] = [];

  constructor(config: AuditConfig) {
    this.config = config;
    this.currentCycle = this.loadLatestCycleNumber() + 1;
  }

  // Phase 1: Reconciliation - File Scan & Conflict Detection
  async runReconciliation(): Promise<void> {
    console.log(`[Audit Cycle ${this.currentCycle}] Phase 1: Reconciliation`);

    // 1.1 Scan file system (sorted by mtime)
    this.manifest = await this.scanFileSystem();

    // 1.2 Load previous manifest for comparison
    const previousManifest = this.loadPreviousManifest();

    // 1.3 Detect conflicts
    this.conflicts = await this.detectConflicts(this.manifest, previousManifest);

    // 1.4 Integrate external sources (.beads, memory logs)
    await this.integrateBeadsTasks();
    await this.integrateMemoryLogs();

    console.log(`[Audit] Found ${this.manifest.length} files, ${this.conflicts.length} conflicts`);
  }

  // Scan file system with timestamp prioritization
  private async scanFileSystem(): Promise<FileManifest[]> {
    const files: FileManifest[] = [];

    // Use find command to get all files sorted by mtime (newest first)
    const findCmd = String.raw`find ${this.config.rootDir} -type f ${this.buildFindPatterns()} -printf "%T@ %p\n" | sort -rn`;

    try {
      const output = execSync(findCmd, { encoding: 'utf-8' });
      const lines = output.trim().split('\n');

      for (const line of lines) {
        const [timestamp, filePath] = line.split(' ', 2);

        // Validate path to prevent traversal attacks
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(this.config.rootDir)) {
          console.warn(`[Audit] Skipping path outside root: ${filePath}`);
          continue;
        }

        if (!filePath || this.shouldExclude(filePath)) continue;

        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        files.push({
          path: filePath.replace(this.config.rootDir, ''),
          hash,
          mtime: new Date(Number.parseFloat(timestamp) * 1000),
          ctime: stats.ctime,
          size: stats.size
        });
      }
    } catch (error) {
      console.error('[Audit] File scan error', error);
    }

    return files;
  }

  // Detect conflicts by comparing current vs previous state
  private async detectConflicts(
    current: FileManifest[],
    previous: FileManifest[]
  ): Promise<ConflictDetection[]> {
    const conflicts: ConflictDetection[] = [];

    // TYPE 1: VERSION CONFLICTS (hash mismatch without corresponding task)
    for (const currFile of current) {
      const prevFile = previous.find(f => f.path === currFile.path);

      if (prevFile && prevFile.hash !== currFile.hash && !currFile.associatedTask) {
        conflicts.push({
          type: 'VERSION',
          severity: 'HIGH',
          description: `File modified outside audit system: ${currFile.path}`,
          affectedFiles: [currFile.path]
        });
      }
    }

    // TYPE 2: TIMING CONFLICTS (task marked complete but file still changing)
    const completedTasks = await this.getCompletedTasks();
    for (const task of completedTasks) {
      const recentlyModified = current.filter(
        f => f.associatedTask === task.id && f.mtime > task.completedDate
      );

      if (recentlyModified.length > 0) {
        conflicts.push({
          type: 'TIMING',
          severity: 'MEDIUM',
          description: `Task ${task.id} marked complete but files still modified`,
          affectedFiles: recentlyModified.map(f => f.path)
        });
      }
    }

    // TYPE 3: LOGIC CONFLICTS (scan for hardcoded values, TODOs in production)
    for (const file of current) {
      if (file.path.includes('api/astrology/compatibility')) {
        const content = fs.readFileSync(path.join(this.config.rootDir, file.path), 'utf-8');

        if (content.includes('return 75')) {
          conflicts.push({
            type: 'LOGIC',
            severity: 'HIGH',
            description: 'Hardcoded compatibility score detected (should be calculated)',
            affectedFiles: [file.path],
            resolution: 'Implement Discepolo algorithm in T002'
          });
        }
      }
    }

    return conflicts;
  }

  // Phase 2: Generate Living Audit Document (SSoT)
  async generateAuditDocument(): Promise<void> {
    console.log(`[Audit Cycle ${this.currentCycle}] Phase 2: Generate SSoT`);

    const template = this.loadAuditTemplate();
    let content = template;

    // Replace auto-generated sections
    content = this.updateSection(content, 'context', await this.generateContextSection());
    content = this.updateSection(content, 'featurematrix', await this.generateFeatureMatrix());
    content = this.updateSection(content, 'immediatetasks', await this.generateImmediateTasks());
    content = this.updateSection(content, 'weeklytasks', await this.generateWeeklyTasks());
    content = this.updateSection(content, 'blockedtasks', await this.generateBlockedTasks());
    content = this.updateSection(content, 'memorysnapshots', await this.generateMemorySnapshots());
    content = this.updateSection(content, 'metrics', await this.generateMetrics());
    content = this.updateSection(content, 'blockers', await this.generateBlockers());

    // Write current audit document
    const auditPath = path.join(this.config.rootDir, '.audit', 'LIVING_AUDIT.md');
    fs.writeFileSync(auditPath, content);

    // Create immutable snapshot
    const snapshotPath = path.join(
      this.config.rootDir,
      '.audit',
      `AUDIT_CYCLE_${String(this.currentCycle).padStart(3, '0')}.md`
    );
    fs.writeFileSync(snapshotPath, content);

    // Log conflicts permanently
    if (this.conflicts.length > 0) {
      this.appendConflictsLog();
    }

    console.log(`[Audit] Generated ${auditPath}`);
  }

  // Update section between AUTOGENERATED markers
  private updateSection(content: string, sectionName: string, newContent: string): string {
    const startMarker = `<!-- AUTOGENERATED_START:${sectionName} -->`;
    const endMarker = `<!-- AUTOGENERATED_END:${sectionName} -->`;

    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      console.warn(`[Audit] Section markers not found: ${sectionName}`);
      return content;
    }

    return (
      content.substring(0, startIdx + startMarker.length) +
      '\n' + newContent + '\n' +
      content.substring(endIdx)
    );
  }

  // Generate feature matrix from project state
  private async generateFeatureMatrix(): Promise<string> {
    const features = await this.loadFeatures();
    let table = '| Feature ID | Name | Status | Progress | Conflicts | Last Modified |\n';
    table += '|------------|------|--------|----------|-----------|---------------|\n';

    for (const feature of features) {
      const conflictIndicator = this.conflicts.some(c =>
        c.affectedFiles.some(f => feature.files.includes(f))
      ) ? '⚠️' : 'None';

      const lastModified = this.manifest
        .filter(f => feature.files.includes(f.path))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0]?.mtime
        .toISOString().split('T')[0] || 'N/A';

      table += `| ${feature.id} | ${feature.name} | ${feature.status} | ${feature.progress}% | ${conflictIndicator} | ${lastModified} |\n`;
    }

    return table;
  }

  // Integrate Beads task tracking
  private async integrateBeadsTasks(): Promise<void> {
    const beadsPath = path.join(this.config.rootDir, this.config.beadsPath);
    if (!fs.existsSync(beadsPath)) return;

    const content = fs.readFileSync(beadsPath, 'utf-8');
    const issues = content.split('\n').filter(Boolean).map(line => JSON.parse(line));

    const openTasks = issues.filter((i: any) => i.status === 'open').length;
    const closedTasks = issues.filter((i: any) => i.status === 'closed').length;

    console.log(`[Audit] Beads Integration: ${openTasks} open, ${closedTasks} closed`);

    // Link files to tasks
    for (const issue of issues) {
      if (issue.files) {
        for (const filePath of issue.files) {
          const manifestEntry = this.manifest.find(f => f.path === filePath);
          if (manifestEntry) {
            manifestEntry.associatedTask = issue.id;
          }
        }
      }
    }
  }

  // Phase 5: Generate status report
  async generateReport(): Promise<void> {
    const report = {
      cycle: this.currentCycle,
      timestamp: new Date().toISOString(),
      filesScanned: this.manifest.length,
      conflictsDetected: this.conflicts.length,
      criticalBlockers: this.conflicts.filter(c => c.severity === 'CRITICAL').length,
      summary: this.generateSummary()
    };

    console.log('[Audit] Report:', JSON.stringify(report, null, 2));

    // Send alerts if critical conflicts exist
    if (report.criticalBlockers > 0) {
      await this.sendCriticalAlert(report);
    }
  }

  // Send critical alert via n8n webhook
  private async sendCriticalAlert(report: any): Promise<void> {
    const webhookUrl = process.env.N8N_AUDIT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: this.config.projectName,
          severity: 'CRITICAL',
          conflicts: this.conflicts.filter(c => c.severity === 'CRITICAL'),
          report
        })
      });
      console.log('[Audit] Critical alert sent');
    } catch (error) {
      console.error('[Audit] Failed to send alert', error);
    }
  }

  // Helper methods (truncated for brevity)
  private loadAuditTemplate(): string { /* ... */ return ''; }
  private buildFindPatterns(): string { /* ... */ return ''; }
  private shouldExclude(path: string): boolean { /* ... */ return false; }
  private loadPreviousManifest(): FileManifest[] { /* ... */ return []; }
  private loadLatestCycleNumber(): number { /* ... */ return 0; }
  private async getCompletedTasks(): Promise<any[]> { /* ... */ return []; }
  private async loadFeatures(): Promise<any[]> { /* ... */ return []; }
  private async generateContextSection(): Promise<string> { /* ... */ return ''; }
  private async generateImmediateTasks(): Promise<string> { /* ... */ return ''; }
  private async generateWeeklyTasks(): Promise<string> { /* ... */ return ''; }
  private async generateBlockedTasks(): Promise<string> { /* ... */ return ''; }
  private async generateMemorySnapshots(): Promise<string> { /* ... */ return ''; }
  private async generateMetrics(): Promise<string> { /* ... */ return ''; }
  private async generateBlockers(): Promise<string> { /* ... */ return ''; }
  private appendConflictsLog(): void { /* ... */ }
  private generateSummary(): string { /* ... */ return ''; }
  private async integrateMemoryLogs(): Promise<void> { /* ... */ }
}

// Main execution
const config: AuditConfig = {
  projectName: 'Mystic Arcana',
  rootDir: process.cwd(),
  scanPatterns: ['.ts', '.tsx', '.py', '.md', '.json'],
  excludePatterns: ['node_modules', '.next', 'dist', '.git'],
  beadsPath: '.beads/issues.jsonl',
  memoryPath: 'memory/persistent'
};

const orchestrator = new LivingAuditOrchestrator(config);

// Top-level await (requires ES2022+ and "module": "esnext" in tsconfig.json)
try {
  await orchestrator.runReconciliation();
  await orchestrator.generateAuditDocument();
  await orchestrator.generateReport();
  console.log('[Audit] Cycle complete');
} catch (error) {
  console.error('[Audit] Cycle failed', error);
  process.exit(1);
}
