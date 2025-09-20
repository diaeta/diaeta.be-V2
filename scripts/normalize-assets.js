const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'en');
const exts = new Set(['.html', '.njk']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

function ensureMainCss(html) {
  if (html.includes('/assets/css/main.css')) return html;
  return html.replace(/<\/head>/i, '  <link rel="stylesheet" href="/assets/css/main.css" />\n</head>');
}

function rewriteLegacy(html) {
  return html
    .replace(/src=("|')\/?js\//g, 'src=$1/legacy/js/');
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  after = ensureMainCss(after);
  after = rewriteLegacy(after);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}
console.log(`Updated ${changed} files`);

