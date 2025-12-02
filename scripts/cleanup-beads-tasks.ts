import { execSync } from 'child_process';

interface Issue {
    id: string;
    title: string;
}

function runBd(command: string): any {
    try {
        const output = execSync(`bd ${command} --json`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        return JSON.parse(output);
    } catch (error) {
        console.error(`Error running bd ${command}:`, error);
        return null;
    }
}

function closeIssue(id: string) {
    console.log(`Closing issue ${id}...`);
    runBd(`close ${id} --reason "Revamping tasks for Vite architecture per user request."`);
}

async function main() {
    console.log('Fetching open issues...');
    const issues: Issue[] = runBd('list --status open');

    if (!issues || issues.length === 0) {
        console.log('No open issues found.');
        return;
    }

    console.log(`Found ${issues.length} open issues. Closing them...`);

    for (const issue of issues) {
        closeIssue(issue.id);
    }

    console.log('Cleanup complete.');
}

main();
