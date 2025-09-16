const site = require('../_data/site.json');

const supportedLocales = site?.locales || ['fr'];
const defaultLocale = site?.defaultLocale || supportedLocales[0];

module.exports = {
  // Disable layouts globally for migrated content to avoid missing layout errors
  layout: false,
  // Rewrite /content/... to root (/en/..., /fr/...)
  permalink: (data) => {
    if (typeof data.permalink !== 'undefined') return data.permalink;
    const stem = data?.page?.filePathStem || '';
    if (!stem.startsWith('/content')) return data.permalink;
    const out = stem.replace(/^\/content/, '');
    // Collapse /index to just / for directory indexes
    return out.endsWith('/index') ? out.replace(/\/index$/, '/') : `${out}.html`;
  },
  eleventyComputed: {
    // Best-effort lang from first path segment (does not create pages)
    lang: (data) => {
      if (data.lang) return data.lang;
      const url = data?.page?.url || data?.page?.filePathStem || '/';
      const seg = String(url).split('/').filter(Boolean)[0];
      return supportedLocales.includes(seg) ? seg : defaultLocale;
    },
  },
};
