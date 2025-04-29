#!/usr/bin/env node

/**
 * Custom build script for Next.js that manages memory more efficiently.
 * This script will be used instead of the default Next.js build command.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting optimized build process...');

// Clear Node's module cache to free memory
console.log('🧹 Clearing module cache...');
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});

// Force garbage collection if available
if (global.gc) {
  console.log('🗑️ Running garbage collection...');
  global.gc();
}

// Configure memory settings for the build
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096';
console.log(`⚙️ Build using memory settings: ${process.env.NODE_OPTIONS}`);

// Run the Next.js build with configured memory
const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
const buildProc = spawn(nextBin, ['build'], { 
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NEXT_TELEMETRY_DISABLED: '1'
  }
});

buildProc.on('exit', code => {
  if (code === 0) {
    console.log('✅ Build completed successfully');
    process.exit(0);
  } else {
    console.error(`❌ Build failed with exit code ${code}`);
    process.exit(code || 1);
  }
});

// Handle interruptions gracefully
process.on('SIGINT', () => {
  buildProc.kill('SIGINT');
  process.exit(1);
});