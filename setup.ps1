#!/usr/bin/env pwsh

Write-Host "Installing dependencies..."
npm install --legacy-peer-deps

Write-Host "Initializing shadcn components..."
npx shadcn-ui@latest init -y

Write-Host "Adding required shadcn components..."
npx shadcn-ui@latest add button card dialog input label progress separator badge select dropdown-menu textarea toast -y

Write-Host "Setup complete! Please make sure to:"
Write-Host "1. Create your .env.local file with Supabase and Anthropic API keys"
Write-Host "2. Run the SQL in supabase-schema.sql in your Supabase SQL editor"
Write-Host "3. Run 'npm run dev' to start the application"
