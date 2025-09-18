require('dotenv').config();
const { DateTime } = require('luxon');

const site = require('./src/_data/site.json');
const translations = require('./src/_data/i18n.json');

const supportedLocales = site?.locales ?? ['fr'];
const defaultLocale = site?.defaultLocale ?? supportedLocales[0];
const baseUrl = site?.baseUrl ?? '';
const outputDir = process.env.ELEVENTY_OUTPUT_DIR || '_site';

module.exports = async function (eleventyConfig) {
  // Eleventy v3-compatible dynamic imports (ESM)
  const { EleventyI18nPlugin } = await import('@11ty/eleventy');
  const { default: EleventyImage } = await import('@11ty/eleventy-img');
  const { default: EleventyBundlePlugin } = await import('@11ty/eleventy-plugin-bundle');
  const { default: EleventyNavigationPlugin } = await import('@11ty/eleventy-navigation');
  const { default: EleventyRssPlugin } = await import('@11ty/eleventy-plugin-rss');
  const { default: sitemapPlugin } = await import('@quasibit/eleventy-plugin-sitemap');
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

  // Copy static assets to the output directory
  eleventyConfig.addPassthroughCopy({ 'public/assets/js': '/assets/js' });
  eleventyConfig.addPassthroughCopy({ 'public/images': '/images' });
  eleventyConfig.addPassthroughCopy({ 'public/videos': '/videos' });
  eleventyConfig.addPassthroughCopy({ 'public/favicon.ico': '/favicon.ico' });

  eleventyConfig.addWatchTarget('src/styles');

  eleventyConfig.addGlobalData('cacheBuster', () => new Date().getTime());

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

  // Backward-compat function for templates calling hreflangList(path) directly
  // Exposes a universal JS function usable across template engines
  eleventyConfig.addJavaScriptFunction('hreflangList', function(path = '/') {
    try {
      const segs = (path || '/').split('/').filter(Boolean);
      const first = segs[0];
      const hasLocalePrefix = supportedLocales.includes(first);
      const rest = hasLocalePrefix ? '/' + segs.slice(1).join('/') : (path || '/');
      return supportedLocales.map(locale => ({
        locale,
        url: `${baseUrl}${locale === defaultLocale ? rest : `/${locale}${rest}`}`,
      }));
    } catch {
      return supportedLocales.map(locale => ({ locale, url: `${baseUrl}${path || '/'}` }));
    }
  });

  // Generate correct hreflang alternates by stripping any existing leading locale
  // from the current page url and rebuilding for each supported locale.
  eleventyConfig.addFilter('hreflangAlternates', (urlPath = '/') => {
    try {
      const segs = (urlPath || '/').split('/').filter(Boolean);
      const first = segs[0];
      const hasLocalePrefix = supportedLocales.includes(first);
      const rest = hasLocalePrefix ? '/' + segs.slice(1).join('/') : (urlPath || '/');
      return supportedLocales.map(locale => ({
        locale,
        url: `${baseUrl}${locale === defaultLocale ? rest : `/${locale}${rest}`}`,
      }));
    } catch {
      // Fallback to current url only
      return [{ locale: defaultLocale, url: `${baseUrl}${urlPath || '/'}` }];
    }
  });

  // Utility string filters
  eleventyConfig.addFilter('startsWith', (value, prefix) => {
    try {
      return typeof value === 'string' && typeof prefix === 'string' && value.startsWith(prefix);
    } catch { return false; }
  });
  eleventyConfig.addFilter('includes', (value, needle) => {
    try {
      return typeof value === 'string' && typeof needle === 'string' && value.includes(needle);
    } catch { return false; }
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

  // Strip any lingering legacy main.js includes from built HTML
  eleventyConfig.addTransform('stripLegacyMain', (content, outputPath) => {
    try {
      if (outputPath && outputPath.endsWith('.html')) {
        return content.replace(/<script[^>]*src=["']\/?legacy\/js\/main\.js["'][^>]*><\/script>\s*/gi, '');
      }
    } catch {}
    return content;
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
    templateFormats: ['md', 'njk', 'html', '11ty.js'],
    pathPrefix: '/',
  };
};
