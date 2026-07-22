const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, '.vercel', 'output', 'static');
const appOutputDir = path.join(outputDir, 'app');

console.log('Preparing Vercel static output directory...');

// Clear and recreate output directories
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(appOutputDir, { recursive: true });

// 1. Copy apps/web/dist (Main web/landing page) to .vercel/output/static
const webDist = path.join(rootDir, 'apps', 'web', 'dist');
if (fs.existsSync(webDist)) {
  fs.cpSync(webDist, outputDir, { recursive: true });
  console.log('Successfully copied apps/web/dist to .vercel/output/static');
} else {
  console.error('Warning: apps/web/dist does not exist!');
}

// 2. Copy apps/client/dist (Expo web app) to .vercel/output/static/app
const clientDist = path.join(rootDir, 'apps', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  fs.cpSync(clientDist, appOutputDir, { recursive: true });
  console.log('Successfully copied apps/client/dist to .vercel/output/static/app');
} else {
  console.error('Warning: apps/client/dist does not exist!');
}
