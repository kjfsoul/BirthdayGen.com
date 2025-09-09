#!/usr/bin/env node

console.log(`
🔧 SUPABASE SETUP GUIDE
=======================

To get your Supabase database connection string:

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → Database
4. Find the "Connection string" section
5. Copy the "URI" connection string

Your connection string should look like:
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

Replace the placeholder in your .env file with your actual connection string.

After updating your .env file, run:

npm run db:push
npm run db:seed

This will:
1. Push the schema to your Supabase database
2. Seed it with initial data

Then you can run:
npx prisma studio

To view your database in a nice GUI.
`);