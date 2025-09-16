const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'en');
const exts = new Set(['.html', '.njk', '.md']);

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const next = text.replace(/^[\t ]*layout\s*:\s*.*(?:\r?\n)?/gm, '');
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log(`Removed layout lines from ${changed} files.`);

