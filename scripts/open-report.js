#!/usr/bin/env node

/**
 * Cross-platform script to open the HTML test report
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';

const reportFile = path.resolve(__dirname, '../reports/html-report/index.html');

if (!fs.existsSync(reportFile)) {
  console.log('❌ Report file not found at:', reportFile);
  console.log('ℹ️  Run "npm test" or "npm run test:report" to generate the report');
  process.exit(1);
}

const openCommand = isWindows
  ? `start "" "${reportFile}"`
  : process.platform === 'darwin'
    ? `open "${reportFile}"`
    : `xdg-open "${reportFile}"`;

console.log('📊 Opening test report...');

exec(openCommand, (error) => {
  if (error) {
    console.error('❌ Failed to open report:', error.message);
    console.log('📁 Report location:', reportFile);
    process.exit(1);
  }
});
