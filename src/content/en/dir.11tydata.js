module.exports = {
  layout: false,
  eleventyComputed: {
    // Force normalize all EN permalinks to /en/... regardless of front matter
    permalink: (data) => {
      const stem = data?.page?.filePathStem || '';
      const rel = stem.replace(/^\/content\//, '/');
      if (rel === '/en/index') return '/en/';
      if (rel.endsWith('/index')) return rel.replace(/\/index$/, '/') ;
      if (rel.startsWith('/en/')) return `${rel}.html`;
      // If missing /en/ prefix (unexpected), default to file name under /en/
      const name = rel.split('/').pop();
      return `/en/${name}.html`;
    },
  },
};
