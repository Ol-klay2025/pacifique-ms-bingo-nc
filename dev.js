// Development script to start the server and frontend
const { execSync } = require('child_process');

try {
  console.log('Starting MS BINGO development server on port 3001...');
  // Force port 3001 for development to avoid conflicts
  execSync('PORT=3001 npx tsx server/index.ts', { 
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting the application:', error.message);
  process.exit(1);
}