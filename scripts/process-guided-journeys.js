const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.resolve('source_images/guided-journeys');
const OUTPUT_ROOT = path.resolve('assets/images/guided-journeys');
const WIDTHS = [360, 480, 640, 768, 1024, 1280, 1536, 1920];
const FORMATS = ['avif', 'webp', 'jpg'];
const LQIP_WIDTH = 24;

const ALT_TEXT = {
  weight: 'Weight Management  steady progress without hunger.',
  ibs: 'IBS Coaching  calmer gut, confident routine.',
  diabetes: 'Type 2 Diabetes  data, warmth & control.',
  lipids: 'Heart & Lipids  Mediterranean glow for cholesterol care.'
};

const FORMAT_OPTIONS = {
  avif: { quality: 60, effort: 6 },
  webp: { quality: 75, effort: 5 },
  jpg: { quality: 82, progressive: true, mozjpeg: true, chromaSubsampling: '4:4:4' }
};

const EXPECTED_SLUGS = Object.keys(ALT_TEXT);

const formatCounts = { avif: 0, webp: 0, jpg: 0 };
const largestVariant = new Map();
const deletedLegacyFiles = new Set();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listRelativeFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listRelativeFiles(full));
    } else {
      const relative = path.relative(OUTPUT_ROOT, full).replace(/\\/g, '/');
      out.push(relative);
    }
  }
  return out;
}

function slugFromFilename(filename) {
  const stem = path.parse(filename).name.toLowerCase();

  if (stem.startsWith('weight')) return 'weight';
  if (stem.startsWith('ibs')) return 'ibs';
  if (stem.startsWith('diab')) return 'diabetes';
  if (stem.startsWith('lipid')) return 'lipids';
  if (stem.startsWith('chol')) return 'lipids';
  if (stem.startsWith('heart')) return 'lipids';

  throw new Error(`Unexpected Guided Journeys filename: ${filename}`);
}

async function renderVariant(buffer, width, format) {
  const pipeline = sharp(buffer, { failOnError: false })
    .resize({ width, withoutEnlargement: false })
    .toColourspace('srgb');

  if (format === 'avif') pipeline.avif(FORMAT_OPTIONS.avif);
  else if (format === 'webp') pipeline.webp(FORMAT_OPTIONS.webp);
  else pipeline.jpeg(FORMAT_OPTIONS.jpg);

  return pipeline.toBuffer({ resolveWithObject: true });
}

async function processSlug(slug, inputPath) {
  const outputDir = path.join(OUTPUT_ROOT, slug);
  const existing = new Set(listRelativeFiles(outputDir));

  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);

  const baseBuffer = await sharp(inputPath, { failOnError: false })
    .rotate()
    .toColourspace('srgb')
    .toBuffer();

  const { data: lqipBuffer } = await sharp(baseBuffer, { failOnError: false })
    .resize({ width: LQIP_WIDTH, withoutEnlargement: false })
    .jpeg({ quality: 55, progressive: true, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer({ resolveWithObject: true });

  const manifestEntry = {
    alt: ALT_TEXT[slug],
    lqip: `data:image/jpeg;base64,${lqipBuffer.toString('base64')}`,
    widths: [...WIDTHS],
    files: {
      avif: [],
      webp: [],
      jpg: []
    }
  };

  const produced = new Set();

  for (const width of WIDTHS) {
    for (const format of FORMATS) {
      const { data, info } = await renderVariant(baseBuffer, width, format);
      const filename = `${slug}-${width}.${format}`;
      const relative = `${slug}/${filename}`;
      const outputPath = path.join(outputDir, filename);

      fs.writeFileSync(outputPath, data);
      manifestEntry.files[format].push(filename);
      produced.add(relative);
      formatCounts[format] += 1;

      const prevLargest = largestVariant.get(slug);
      if (!prevLargest || data.length > prevLargest.bytes) {
        largestVariant.set(slug, { bytes: data.length, format, width });
      }
    }
  }

  for (const stale of existing) {
    if (!produced.has(stale)) deletedLegacyFiles.add(stale);
  }

  return manifestEntry;
}

async function run() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

  ensureDir(OUTPUT_ROOT);

  const sourceEntries = fs
    .readdirSync(SOURCE_DIR)
    .filter(name => !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));

  const seen = new Set();
  const processed = {};

  for (const entry of sourceEntries) {
    const slug = slugFromFilename(entry);
    if (seen.has(slug)) {
      throw new Error(`Multiple source images detected for slug "${slug}".`);
    }

    const inputPath = path.join(SOURCE_DIR, entry);
    processed[slug] = await processSlug(slug, inputPath);
    seen.add(slug);
  }

  const missing = EXPECTED_SLUGS.filter(slug => !seen.has(slug));
  if (missing.length) {
    throw new Error(`Missing source images for: ${missing.join(', ')}`);
  }

  const manifest = {};
  for (const slug of EXPECTED_SLUGS) {
    manifest[slug] = processed[slug];
  }

  fs.writeFileSync(
    path.join(OUTPUT_ROOT, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  const formatSummary = FORMATS.map(format => `${format}: ${formatCounts[format]} files`).join(', ');
  console.log(`Formats generated — ${formatSummary}`);

  for (const slug of EXPECTED_SLUGS) {
    const metrics = largestVariant.get(slug);
    if (!metrics) continue;
    const kilobytes = (metrics.bytes / 1024).toFixed(1);
    console.log(`Largest variant — ${slug}: ${kilobytes} KB (${metrics.format} ${metrics.width}w)`);
  }

  if (deletedLegacyFiles.size === 0) {
    console.log('Deleted legacy files — none');
  } else {
    console.log('Deleted legacy files:');
    Array.from(deletedLegacyFiles)
      .sort()
      .forEach(item => {
        console.log(`  - assets/images/guided-journeys/${item}`);
      });
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
