import { execSync } from 'child_process';

interface Issue {
    id: string;
    title: string;
    description: string;
    labels: string[];
    status: string;
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

function updateIssue(id: string, updates: { title?: string; description?: string; labels?: string[] }) {
    let cmd = `update ${id}`;
    if (updates.title) cmd += ` --title "${updates.title.replace(/"/g, '\\"')}"`;
    if (updates.description) cmd += ` --description "${updates.description.replace(/"/g, '\\"')}"`;

    // Labels are tricky with the CLI, usually 'label add'. We'll handle labels separately.
    runBd(cmd);

    if (updates.labels) {
        updates.labels.forEach(label => {
            runBd(`label add ${id} ${label}`);
        });
    }
}

async function main() {
    console.log('Fetching open issues...');
    const issues: Issue[] = runBd('list --status open');

    if (!issues) {
        console.error('Failed to fetch issues.');
        return;
    }

    console.log(`Found ${issues.length} open issues. Processing...`);

    let updatedCount = 0;

    for (const issue of issues) {
        let newTitle = issue.title;
        let newDesc = issue.description;
        let needsUpdate = false;

        // Rule 1: API Routes -> Edge Functions
        if (newTitle.includes('API route') || newDesc.includes('API route')) {
            newTitle = newTitle.replace(/API route/g, 'Edge Function');
            newDesc = newDesc.replace(/API route/g, 'Supabase Edge Function');
            needsUpdate = true;
        }

        // Rule 2: Next.js -> Vite/React
        if (newTitle.includes('Next.js') || newDesc.includes('Next.js')) {
            newTitle = newTitle.replace(/Next\.js/g, 'Vite/React');
            newDesc = newDesc.replace(/Next\.js/g, 'Vite/React');
            needsUpdate = true;
        }

        // Rule 3: Server Components -> React Components
        if (newDesc.includes('Server Component')) {
            newDesc = newDesc.replace(/Server Component/g, 'React Component');
            needsUpdate = true;
        }

        // Rule 4: API Routes (plural/lowercase)
        if (newDesc.includes('API routes')) {
            newDesc = newDesc.replace(/API routes/g, 'Edge Functions');
            needsUpdate = true;
        }

        // Rule 5: Specific route handlers
        if (newDesc.includes('/api/')) {
            // Keep the path for reference, but clarify it's an Edge Function
            newDesc = newDesc.replace(/(\/api\/[\w\-\/\[\]]+)/g, '$1 (Edge Function)');
            needsUpdate = true;
        }

        if (needsUpdate) {
            console.log(`Updating ${issue.id}: ${issue.title} -> ${newTitle}`);
            updateIssue(issue.id, {
                title: newTitle,
                description: newDesc,
                labels: ['v2-arch']
            });
            updatedCount++;
        }
    }

    console.log(`Revamp complete. Updated ${updatedCount} issues.`);
}

main();
