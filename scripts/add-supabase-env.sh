#!/bin/bash
# Script to add key Supabase environment variables to Vercel

echo "📤 Adding Supabase environment variables to Vercel..."

# Add NEXT_PUBLIC_SUPABASE_ID
echo "Adding NEXT_PUBLIC_SUPABASE_ID..."
echo "pezchazchhnmygpdgzma" | vercel env add NEXT_PUBLIC_SUPABASE_ID production
echo "pezchazchhnmygpdgzma" | vercel env add NEXT_PUBLIC_SUPABASE_ID preview
echo "pezchazchhnmygpdgzma" | vercel env add NEXT_PUBLIC_SUPABASE_ID development

# Add NEXT_PUBLIC_SUPABASE_URL
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "https://pezchazchhnmygpdgzma.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://pezchazchhnmygpdgzma.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "https://pezchazchhnmygpdgzma.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL development

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzg0NjMsImV4cCI6MjA2MjAxNDQ2M30.IpYlxlpot6AJfUYKGHovpIEgW_SYGAHIXzOWPhFHKWQ" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzg0NjMsImV4cCI6MjA2MjAxNDQ2M30.IpYlxlpot6AJfUYKGHovpIEgW_SYGAHIXzOWPhFHKWQ" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzg0NjMsImV4cCI6MjA2MjAxNDQ2M30.IpYlxlpot6AJfUYKGHovpIEgW_SYGAHIXzOWPhFHKWQ" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

# Add SUPABASE_SECRET_KEY
echo "Adding SUPABASE_SECRET_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzODQ2MywiZXhwIjoyMDYyMDE0NDYzfQ.eqGPaEArJgp4tRthdopk6oT2-ZHKW_YKCEoqLnaaPvE" | vercel env add SUPABASE_SECRET_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzODQ2MywiZXhwIjoyMDYyMDE0NDYzfQ.eqGPaEArJgp4tRthdopk6oT2-ZHKW_YKCEoqLnaaPvE" | vercel env add SUPABASE_SECRET_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemNoYXpjaGhubXlncGRnem1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzODQ2MywiZXhwIjoyMDYyMDE0NDYzfQ.eqGPaEArJgp4tRthdopk6oT2-ZHKW_YKCEoqLnaaPvE" | vercel env add SUPABASE_SECRET_KEY development

# Add DATABASE_URL
echo "Adding DATABASE_URL..."
echo "postgresql://postgres:Amarcade#2025@db.pezchazchhnmygpdgzma.supabase.co:5432/postgres" | vercel env add DATABASE_URL production
echo "postgresql://postgres:Amarcade#2025@db.pezchazchhnmygpdgzma.supabase.co:5432/postgres" | vercel env add DATABASE_URL preview
echo "postgresql://postgres:Amarcade#2025@db.pezchazchhnmygpdgzma.supabase.co:5432/postgres" | vercel env add DATABASE_URL development

echo "✅ Key Supabase variables added!"
echo ""
echo "🌐 For remaining variables, use the Vercel dashboard:"
echo "   https://vercel.com/kjfsouls-projects/birthdaygen/settings/environment-variables"
