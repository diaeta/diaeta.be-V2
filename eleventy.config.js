require('dotenv').config();
const { EleventyI18nPlugin } = require('@11ty/eleventy');
const EleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const EleventyBundlePlugin = require('@11ty/eleventy-plugin-bundle').default;
const EleventyImage = require('@11ty/eleventy-img');
const EleventyRssPlugin = require('@11ty/eleventy-plugin-rss');
const sitemapPlugin = require('@quasibit/eleventy-plugin-sitemap');
const { DateTime } = require('luxon');
const sass = require('sass');
const { transform } = require('lightningcss');

const site = require('./src/_data/site.json');
const translations = require('./src/_data/i18n.json');

const supportedLocales = site?.locales ?? ['fr'];
const defaultLocale = site?.defaultLocale ?? supportedLocales[0];
const baseUrl = site?.baseUrl ?? '';
const outputDir = process.env.ELEVENTY_OUTPUT_DIR || '_site';

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: defaultLocale,
    errorMode: 'strict',
    translations,
  });

  eleventyConfig.addPlugin(EleventyNavigationPlugin);
  eleventyConfig.addPlugin(EleventyBundlePlugin);
  eleventyConfig.addPlugin(EleventyRssPlugin);
  eleventyConfig.addPlugin(sitemapPlugin, {
    sitemap: {
      hostname: baseUrl,
    },
  });

  eleventyConfig.addPassthroughCopy({ public: '.' });
  eleventyConfig.addWatchTarget('src/styles');

  eleventyConfig.addGlobalData('localization', {
    supportedLocales,
    defaultLocale,
    baseUrl,
  });

  eleventyConfig.addFilter('localizedUrl', (url = '/', locale = defaultLocale) => {
    if (!url.startsWith('/')) {
      url = `/${url}`;
    }
    if (locale === defaultLocale) {
      return url;
    }
    return `/${locale}${url}`;
  });

  eleventyConfig.addFilter('hreflangList', (path = '/') => {
    return supportedLocales.map(locale => ({
      locale,
      url: locale === defaultLocale ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
    }));
  });

  // Proper date formatting filter using Luxon
  // Usage: {{ someDate | date('dd LLL yyyy', 'Europe/Brussels', locale) }}
  eleventyConfig.addFilter('date', (value, format = 'dd LLL yyyy', zone = 'Europe/Brussels', locale = defaultLocale) => {
    try {
      let dt;
      if (value instanceof Date) {
        dt = DateTime.fromJSDate(value, { zone });
      } else if (typeof value === 'number') {
        dt = DateTime.fromMillis(value, { zone });
      } else if (typeof value === 'string') {
        dt = DateTime.fromISO(value, { zone });
        if (!dt.isValid) {
          // try JS Date fallback
          const js = new Date(value);
          if (!Number.isNaN(js.getTime())) dt = DateTime.fromJSDate(js, { zone });
        }
      }
      if (!dt || !dt.isValid) return String(value ?? '');
      return dt.setLocale(locale).toFormat(format);
    } catch {
      return String(value ?? '');
    }
  });

  // Simple translation helpers using i18n.json
  function getNested(source, key) {
    return key
      .split('.')
      .reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), source);
  }
  function detectLocaleFromPath(path = '/') {
    try {
      const seg = (path || '/').split('/').filter(Boolean)[0];
      return supportedLocales.includes(seg) ? seg : defaultLocale;
    } catch {
      return defaultLocale;
    }
  }
  eleventyConfig.addFilter('localeFromUrl', (path = '/') => detectLocaleFromPath(path));
  eleventyConfig.addFilter('t', (key, locale = defaultLocale) => {
    const lang = supportedLocales.includes(locale) ? locale : defaultLocale;
    const primary = getNested(translations?.[lang] || {}, key);
    if (primary !== undefined) return primary;
    const fallback = getNested(translations?.[defaultLocale] || {}, key);
    return fallback !== undefined ? fallback : key;
  });
  eleventyConfig.addFilter('tAuto', (key, path = '/') => {
    const lang = detectLocaleFromPath(path);
    const primary = getNested(translations?.[lang] || {}, key);
    if (primary !== undefined) return primary;
    const fallback = getNested(translations?.[defaultLocale] || {}, key);
    return fallback !== undefined ? fallback : key;
  });

  // Simple translation filter reading from src/_data/i18n.json
  function getNested(source, key) {
    return key
      .split('.')
      .reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), source);
  }
  eleventyConfig.addFilter('t', (key, locale = defaultLocale) => {
    const lang = supportedLocales.includes(locale) ? locale : defaultLocale;
    const primary = getNested(translations?.[lang] || {}, key);
    if (primary !== undefined) return primary;
    const fallback = getNested(translations?.[defaultLocale] || {}, key);
    return fallback !== undefined ? fallback : key;
  });

  eleventyConfig.addNunjucksAsyncShortcode(
    'image',
    async function imageShortcode(src, alt = '', options = {}) {
      if (!src) {
        throw new Error('Image shortcode requires src');
      }

      const widths = options.widths || [400, 800, 1200];
      const formats = options.formats || ['avif', 'webp', 'jpeg'];

      const results = await EleventyImage(src, {
        widths,
        formats,
        urlPath: '/assets/images',
        outputDir: `${outputDir}/assets/images`,
      });

      const metadata = results.jpeg?.[results.jpeg.length - 1] || Object.values(results)[0][0];
      const attrs = {
        alt,
        loading: 'lazy',
        decoding: 'async',
        width: metadata.width,
        height: metadata.height,
      };

      return EleventyImage.generateHTML(results, attrs);
    }
  );

  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    compileOptions: {
      permalink: (data = {}) => {
        const inputPath = data.page?.inputPath || data.inputPath || '';
        if (!inputPath.endsWith('main.scss')) {
          return false;
        }
        return '/assets/css/main.css';
      },
    },
    compile: function (_, inputPath) {
      if (!inputPath.endsWith('main.scss')) {
        return async () => '';
      }

      return async () => {
        const sassResult = sass.compile(inputPath, {
          loadPaths: ['src/styles'],
          style: 'expanded',
        });

        const { code } = transform({
          filename: inputPath,
          code: Buffer.from(sassResult.css),
          minify: process.env.NODE_ENV === 'production',
          browsers: ['last 2 versions'],
        });

        return code.toString();
      };
    },
  });

  eleventyConfig.setServerOptions({
    port: 8080,
    domDiff: false,
    showAllHosts: false,
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: outputDir,
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk', 'html', '11ty.js', 'scss'],
    pathPrefix: '/',
  };
};
