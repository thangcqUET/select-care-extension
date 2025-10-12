const fs = require('fs');
const path = require('path');

const fileA = path.resolve(__dirname, '..', 'src', 'service_worker', 'types.ts');
const fileB = path.resolve(__dirname, '..', 'src', 'content_scripts', 'types.ts');

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    console.error(`Failed to read ${file}:`, e.message);
    process.exit(2);
  }
}

const a = read(fileA).replace(/\r\n/g, '\n');
const b = read(fileB).replace(/\r\n/g, '\n');

if (a === b) {
  console.log('OK: types files are identical');
  process.exit(0);
} else {
  console.error('ERROR: types files differ');

  // Print a short diff-ish output
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const max = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < max; i++) {
    const al = aLines[i];
    const bl = bLines[i];
    if (al !== bl) {
      console.error(`\n--- difference at line ${i+1} ---`);
      console.error(`service_worker: ${al === undefined ? '<missing>' : al}`);
      console.error(`content_scripts: ${bl === undefined ? '<missing>' : bl}`);
      break;
    }
  }

  process.exit(1);
}
