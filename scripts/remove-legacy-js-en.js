const fs = require('fs');
const path = require('path');

const exts = new Set(['.html', '.njk', '.md']);
const root = path.join(__dirname, '..', 'src', 'content', 'en');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

const files = walk(root);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  // Remove any legacy main.js includes
  const after = before
    .replace(/\n\s*<script[^>]*src=["']\/(legacy\/)?js\/main\.js["'][^>]*><\/script>\s*/gi, '\n');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}
console.log(`Removed legacy main.js from ${changed} EN files.`);