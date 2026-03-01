#!/usr/bin/env node

/**
 * Cross-platform test runner that automatically opens HTML report after test completion
 * Works on Windows, macOS, and Linux
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detect OS
const isWindows = process.platform === 'win32';
const shell = isWindows ? 'cmd' : 'sh';
const shellArgs = isWindows ? ['/c'] : ['-c'];

// Get report directory
const reportDir = path.resolve(__dirname, '../reports/html-report');

/**
 * Execute test command
 */
function runTests() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 Starting test execution...\n');
    
    const testCommand = isWindows 
      ? 'npx bddgen && npx playwright test' 
      : 'npx bddgen && npx playwright test';
    
    const testProcess = spawn(shell, [...shellArgs, testCommand], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Still open report even if tests fail, so user can see what happened
        console.log(`\n⚠️  Tests completed with exit code: ${code}`);
        resolve();
      }
    });

    testProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Open HTML report with delay to ensure file is written
 */
function openReport() {
  return new Promise((resolve) => {
    const reportFile = path.join(reportDir, 'index.html');
    
    // Wait 2 seconds for report to be fully written
    console.log('\n⏳ Waiting for report to be written...');
    setTimeout(() => {
      if (!fs.existsSync(reportFile)) {
        console.log('❌ Report file not found at:', reportFile);
        resolve();
        return;
      }

      console.log('📊 Opening HTML report...\n');
      
      try {
        let openCommand;
        if (isWindows) {
          // Use explorer.exe with full path for better Windows compatibility
          openCommand = `explorer.exe "${path.resolve(reportFile)}"`;
        } else if (process.platform === 'darwin') {
          openCommand = `open "${reportFile}"`;
        } else {
          openCommand = `xdg-open "${reportFile}"`;
        }
        
        const openProcess = spawn(shell, [...shellArgs, openCommand], {
          stdio: 'pipe',
          windowsHide: true
        });

        // Suppress output and errors
        openProcess.stdin.end();
        openProcess.stdout.on('data', () => {});
        openProcess.stderr.on('data', () => {});

        openProcess.on('close', () => {
          console.log('✅ Report ready! Opening in your default browser...\n');
          resolve();
        });

        openProcess.on('error', () => {
          console.log('ℹ️  Report is ready to view at:\n');
          console.log(`📁 ${path.resolve(reportFile)}\n`);
          resolve();
        });

        // Timeout after 5 seconds regardless
        setTimeout(() => {
          openProcess.kill();
          console.log('ℹ️  Report is ready to view at:\n');
          console.log(`📁 ${path.resolve(reportFile)}\n`);
          resolve();
        }, 5000);
      } catch (error) {
        console.log('ℹ️  Report is ready to view at:\n');
        console.log(`📁 ${path.resolve(reportFile)}\n`);
        resolve();
      }
    }, 2000);
  });
}

/**
 * Main execution flow
 */
async function main() {
  try {
    console.log('═════════════════════════════════════════');
    console.log('  Self-Healing Framework - Test Runner');
    console.log('═════════════════════════════════════════');
    
    // Run tests
    await runTests();
    
    // Open report
    await openReport();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Execute
main();
