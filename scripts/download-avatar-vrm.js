#!/usr/bin/env node
/**
 * Downloads a sample VRM model to public/avatar.vrm so the interview 3D avatar works.
 * Run once: node scripts/download-avatar-vrm.js
 * Requires: Node 18+ (for fetch) or run: npm install node-fetch (and use require).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_DIR = path.join(__dirname, '..', 'public');
const OUT_FILE = path.join(OUT_DIR, 'avatar.vrm');

const SAMPLE_URLS = [
  'https://cdn.jsdelivr.net/gh/vrm-c/vrm-spec@master/samples/AliciaSolid/AliciaSolid.vrm',
  'https://cdn.jsdelivr.net/gh/pixiv/three-vrm@3.5.0/packages/three-vrm/examples/models/AliciaSolid.vrm',
];

function download(url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(OUT_FILE);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirect = response.headers.location;
        if (redirect) return download(redirect).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(OUT_FILE, () => {});
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(OUT_FILE, () => {});
      reject(err);
    });
  });
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function main() {
  console.log('Downloading sample VRM to public/avatar.vrm ...');
  for (const url of SAMPLE_URLS) {
    try {
      await download(url);
      console.log('Done. Saved to public/avatar.vrm');
      return;
    } catch (e) {
      console.warn('  Try failed:', e.message);
    }
  }
  console.error('All download URLs failed.');
  console.log('\nAdd a VRM file manually:');
  console.log('  1. Go to https://readyplayer.me and create an avatar, or use VRoid Studio');
  console.log('  2. Export / download as VRM');
  console.log('  3. Save the file as: public/avatar.vrm (in this project)');
  console.log('\nSee public/AVATAR_README.md for more options.');
  process.exit(1);
}

main();
