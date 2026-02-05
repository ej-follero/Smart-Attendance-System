#!/usr/bin/env node

/**
 * Vercel Postgres Setup Script
 * 
 * This script automates the setup of Vercel Postgres for your application.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Colors for console output
const colors = {
 reset: '\x1b[0m',
 bright: '\x1b[1m',
 red: '\x1b[31m',
 green: '\x1b[32m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 magenta: '\x1b[35m',
 cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
 console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
 try {
 log(`\n${colors.cyan} ${description}...${colors.reset}`);
 const result = execSync(command, { 
 stdio: 'inherit',
 encoding: 'utf8'
 });
 log(`${colors.green} ${description} completed${colors.reset}`);
 return result;
 } catch (error) {
 log(`${colors.red} ${description} failed: ${error.message}${colors.reset}`);
 throw error;
 }
}

function checkVercelCLI() {
 log(`${colors.bright}${colors.blue} Checking Vercel CLI...${colors.reset}`);
 
 try {
 execSync('vercel --version', { stdio: 'pipe' });
 log(`${colors.green} Vercel CLI is installed${colors.reset}`);
 } catch (error) {
 log(`${colors.red} Vercel CLI not found. Installing...${colors.reset}`);
 execCommand('npm i -g vercel', 'Installing Vercel CLI');
 }
}

function loginToVercel() {
 log(`${colors.bright}${colors.blue} Logging in to Vercel...${colors.reset}`);
 
 try {
 execSync('vercel whoami', { stdio: 'pipe' });
 log(`${colors.green} Already logged in to Vercel${colors.reset}`);
 } catch (error) {
 log(`${colors.yellow} Please log in to Vercel...${colors.reset}`);
 execCommand('vercel login', 'Logging in to Vercel');
 }
}

function exportCurrentDatabase() {
 log(`${colors.bright}${colors.blue} Exporting current database...${colors.reset}`);
 
 try {
 // Check if Docker container is running
 execSync('docker ps --filter "name=icct-sas-db" --format "{{.Names}}"', { stdio: 'pipe' });
 
 // Export database
 execCommand(
 'docker exec icct-sas-db pg_dump -U admin -d icct-sas > database-backup.sql',
 'Exporting database to SQL file'
 );
 
 log(`${colors.green} Database exported to database-backup.sql${colors.reset}`);
 } catch (error) {
 log(`${colors.yellow} Docker container not running. Skipping database export.${colors.reset}`);
 log(`${colors.cyan} Start Docker with: docker-compose up -d${colors.reset}`);
 }
}

function createVercelPostgres() {
 log(`${colors.bright}${colors.blue} Creating Vercel Postgres database...${colors.reset}`);
 
 try {
 execCommand('vercel storage create postgres', 'Creating Vercel Postgres database');
 log(`${colors.green} Vercel Postgres database created${colors.reset}`);
 } catch (error) {
 log(`${colors.yellow} Database creation failed. You may need to create it manually in Vercel dashboard.${colors.reset}`);
 log(`${colors.cyan} Go to: Vercel Dashboard → Storage → Create Database → Postgres${colors.reset}`);
 }
}

function deployToVercel() {
 log(`${colors.bright}${colors.blue} Deploying to Vercel...${colors.reset}`);
 
 try {
 execCommand('vercel --prod', 'Deploying to production');
 log(`${colors.green} Application deployed to Vercel${colors.reset}`);
 } catch (error) {
 log(`${colors.yellow} Deployment failed. You may need to deploy manually.${colors.reset}`);
 log(`${colors.cyan} Run: vercel --prod${colors.reset}`);
 }
}

function runMigrations() {
 log(`${colors.bright}${colors.blue} Running database migrations...${colors.reset}`);
 
 try {
 // Pull environment variables
 execCommand('vercel env pull .env.local', 'Pulling environment variables');
 
 // Run Prisma migrations
 execCommand('npx prisma migrate deploy', 'Running Prisma migrations');
 
 // Generate Prisma client
 execCommand('npx prisma generate', 'Generating Prisma client');
 
 log(`${colors.green} Database migrations completed${colors.reset}`);
 } catch (error) {
 log(`${colors.yellow} Migrations failed. You may need to run them manually.${colors.reset}`);
 log(`${colors.cyan} Run: npx prisma migrate deploy${colors.reset}`);
 }
}

function createEnvironmentTemplate() {
 log(`${colors.bright}${colors.blue} Creating environment template...${colors.reset}`);
 
 const envTemplate = `# Vercel Postgres Environment Variables
# These are auto-provided by Vercel Postgres:
# DATABASE_URL
# POSTGRES_URL
# POSTGRES_PRISMA_URL
# POSTGRES_URL_NON_POOLING

# Additional required variables for Vercel:
JWT_SECRET="your-jwt-secret-here"
SESSION_SECRET="your-session-secret-here"
COOKIE_SECRET="your-cookie-secret-here"
CSRF_SECRET="your-csrf-secret-here"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"

# Redis (if using)
REDIS_URL="redis://username:password@host:port"

# MQTT (for RFID)
MQTT_BROKER_URL="mqtt://username:password@host:port"
MQTT_USERNAME="your-mqtt-username"
MQTT_PASSWORD="your-mqtt-password"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@icct.edu.ph"
`;

 fs.writeFileSync('vercel-postgres-env.txt', envTemplate);
 log(`${colors.green} Environment template created: vercel-postgres-env.txt${colors.reset}`);
}

function showNextSteps() {
 log(`${colors.bright}${colors.magenta} Next Steps for Vercel Postgres Setup${colors.reset}`);
 log(`${colors.cyan}================================================${colors.reset}`);
 
 log(`${colors.yellow}1. Vercel Postgres Database:${colors.reset}`);
 log(`${colors.cyan} • Go to Vercel Dashboard → Storage → Create Database${colors.reset}`);
 log(`${colors.cyan} • Choose 'Postgres' and select region${colors.reset}`);
 log(`${colors.cyan} • Environment variables will be auto-configured${colors.reset}`);
 
 log(`${colors.yellow}2. Set Additional Environment Variables:${colors.reset}`);
 log(`${colors.cyan} • Copy variables from vercel-postgres-env.txt${colors.reset}`);
 log(`${colors.cyan} • Add them to Vercel Dashboard → Settings → Environment Variables${colors.reset}`);
 
 log(`${colors.yellow}3. Deploy Application:${colors.reset}`);
 log(`${colors.cyan} • Run: vercel --prod${colors.reset}`);
 log(`${colors.cyan} • Or use: npm run deploy:vercel${colors.reset}`);
 
 log(`${colors.yellow}4. Run Database Migrations:${colors.reset}`);
 log(`${colors.cyan} • npx prisma migrate deploy${colors.reset}`);
 log(`${colors.cyan} • npx prisma generate${colors.reset}`);
 
 log(`${colors.yellow}5. Import Data (if needed):${colors.reset}`);
 log(`${colors.cyan} • psql $DATABASE_URL < database-backup.sql${colors.reset}`);
 
 log(`${colors.green} Vercel Postgres setup guide completed!${colors.reset}`);
}

// Main execution
function main() {
 log(`${colors.bright}${colors.magenta} Vercel Postgres Setup${colors.reset}`);
 log(`${colors.cyan}================================================${colors.reset}`);
 
 try {
 checkVercelCLI();
 loginToVercel();
 exportCurrentDatabase();
 createVercelPostgres();
 createEnvironmentTemplate();
 showNextSteps();
 
 log(`${colors.bright}${colors.green} Vercel Postgres setup completed!${colors.reset}`);
 } catch (error) {
 log(`${colors.red} Setup failed: ${error.message}${colors.reset}`);
 log(`${colors.yellow} Check the error messages above and follow the manual steps.${colors.reset}`);
 }
}

// Run if called directly
if (require.main === module) {
 main();
}

module.exports = {
 checkVercelCLI,
 loginToVercel,
 exportCurrentDatabase,
 createVercelPostgres,
 deployToVercel,
 runMigrations,
 createEnvironmentTemplate,
 showNextSteps
};
