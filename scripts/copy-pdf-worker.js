#!/usr/bin/env node
/**
 * Copy pdf.worker from pdfjs-dist to public/ so the worker version always
 * matches the installed pdfjs-dist (avoids "API version does not match Worker version").
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const dest = path.join(__dirname, '../public/pdf.worker.min.mjs');

if (!fs.existsSync(src)) {
  console.warn('[copy-pdf-worker] pdfjs-dist worker not found at', src);
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log('[copy-pdf-worker] Copied pdf.worker.min.mjs to public/');
console.log('[copy-pdf-worker] Worker version will match pdfjs-dist in package.json');
