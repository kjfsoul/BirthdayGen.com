import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// --- Configuration ---
const AGENTS = [
  { name: 'Agent-DB', capabilities: ['database', 'backend', 'api'] },
  { name: 'Agent-UI', capabilities: ['ui', 'frontend', 'css'] },
  { name: 'Agent-AI', capabilities: ['ai', 'algorithm', 'logic'] },
  { name: 'Agent-QA', capabilities: ['test', 'verification', 'qa'] },
  { name: 'Agent-PM', capabilities: ['planning', 'management', 'docs'] },
];

const POLL_INTERVAL_MS = 5000;
const MAX_CONCURRENT_TASKS_PER_AGENT = 1;

// --- Types ---
interface BeadsIssue {
  id: string;
  title: string;
  labels: string[];
  status: string;
}

interface AgentState {
  name: string;
  currentTask: BeadsIssue | null;
}

// --- State ---
const agentStates: AgentState[] = AGENTS.map(a => ({ name: a.name, currentTask: null }));
let isRunning = true;

// --- Helpers ---
const log = (agent: string, message: string) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] [${agent}] ${message}`);
};

const runBeadsCommand = async (command: string): Promise<any> => {
  try {
    const { stdout } = await execAsync(`bd ${command} --json`);
    try {
      return JSON.parse(stdout);
    } catch (e) {
      return stdout.trim();
    }
  } catch (error: any) {
    // console.error(`Beads command failed: ${command}`, error.message);
    return null;
  }
};

const getReadyTasks = async (): Promise<BeadsIssue[]> => {
  const result = await runBeadsCommand('ready');
  return Array.isArray(result) ? result : [];
};

const claimTask = async (taskId: string): Promise<boolean> => {
  const result = await runBeadsCommand(`update ${taskId} --status in_progress`);
  return !!result;
};

// --- Main Loop ---
const runSwarm = async () => {
  console.log('🚀 Starting BirthdayGen Agent Swarm...');
  console.log(`🤖 Agents: ${AGENTS.map(a => a.name).join(', ')}`);
  console.log('Press Ctrl+C to stop.');

  while (isRunning) {
    try {
      // 1. Get ready tasks
      const readyTasks = await getReadyTasks();

      // 2. Assign tasks to idle agents
      for (const agent of agentStates) {
        if (agent.currentTask) {
          // Agent is busy (simulation: just hold it for a bit, or check if it's done)
          // For this MVP, we'll just log that they are working
          // log(agent.name, `Working on ${agent.currentTask.id}: ${agent.currentTask.title}`);
          continue;
        }

        if (readyTasks.length === 0) {
            continue;
        }

        // Simple matching logic: Find a task that matches capabilities or just take the first one
        // For MVP, we'll just take the first available task to demonstrate flow
        const taskToPick = readyTasks.shift(); // Remove from local list so other agents don't pick it

        if (taskToPick) {
          log(agent.name, `Claiming task ${taskToPick.id}: ${taskToPick.title}`);
          const success = await claimTask(taskToPick.id);

          if (success) {
            agent.currentTask = taskToPick;
            log(agent.name, `✅ Started work on ${taskToPick.id}`);

            // SIMULATION: "Finish" the task after a random time to show movement
            // In a real system, the agent would actually DO the work.
            // Here we just hold it.
          } else {
            log(agent.name, `❌ Failed to claim ${taskToPick.id}`);
          }
        }
      }

      // 3. Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    } catch (error) {
      console.error('Swarm loop error:', error);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
};

// --- Cleanup ---
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Agent Swarm...');
  isRunning = false;
  process.exit(0);
});

runSwarm();
