const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ZIP_URL = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.2.6.zip';
const ZIP_PATH = path.resolve(__dirname, '..', 'mongodb', 'mongodb.zip');
const EXTRACT_DIR = path.resolve(__dirname, '..', 'mongodb', 'mongodb-bin');

async function downloadFile(url, dest) {
  const file = fs.createWriteStream(dest, { flags: 'a' });
  let downloaded = 0;

  if (fs.existsSync(dest)) {
    downloaded = fs.statSync(dest).size;
    console.log(`Resuming download from ${(downloaded / 1024 / 1024).toFixed(1)}MB`);
  } else {
    console.log('Starting new download...');
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: downloaded > 0 ? { Range: `bytes=${downloaded}-` } : {} }, (res) => {
      if (res.statusCode === 416) {
        console.log('Download already complete!');
        file.close();
        resolve();
        return;
      }
      if (res.statusCode >= 300) {
        console.error(`Server responded with ${res.statusCode}`);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const total = parseInt(res.headers['content-length'] || 0, 10) + downloaded;
      console.log(`Total size: ${(total / 1024 / 1024).toFixed(1)}MB`);

      res.on('data', (chunk) => {
        downloaded += chunk.length;
        const pct = ((downloaded / total) * 100).toFixed(1);
        process.stdout.write(`\rDownloading: ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`);
      });

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('\nDownload complete!');
        resolve();
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function extractZip() {
  console.log('Extracting MongoDB (this may take a minute)...');
  // Use PowerShell to extract
  return new Promise((resolve, reject) => {
    const ps = spawn('powershell', [
      '-Command',
      `Expand-Archive -LiteralPath '${ZIP_PATH}' -DestinationPath '${EXTRACT_DIR}' -Force`
    ]);
    ps.stdout.on('data', d => process.stdout.write(d));
    ps.stderr.on('data', d => process.stderr.write(d));
    ps.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Extract failed with code ${code}`));
    });
  });
}

async function main() {
  try {
    fs.mkdirSync(path.dirname(ZIP_PATH), { recursive: true });
    await downloadFile(ZIP_URL, ZIP_PATH);
    await extractZip();

    // Find mongod
    const files = fs.readdirSync(EXTRACT_DIR, { recursive: true });
    const mongodPath = files.find(f => f.endsWith('mongod.exe'));
    if (mongodPath) {
      console.log(`\nMongoDB extracted! mongod at: ${path.join(EXTRACT_DIR, mongodPath)}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
