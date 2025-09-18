module.exports = class {
  data() {
    return {
      permalink: '/search-index.en.json',
      eleventyExcludeFromCollections: true,
    };
  }

  render(data) {
    const items = (data.collections && data.collections.all ? data.collections.all : [])
      .filter(p => p.url && typeof p.url === 'string' && p.url.startsWith('/en/'))
      .map(p => {
        const title = p.data && (p.data.title || (p.data.seo && p.data.seo.title)) || '';
        const description = p.data && (p.data.description || (p.data.seo && p.data.seo.description)) || '';
        const raw = (p.templateContent || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
        const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const summary = description || (text ? text.slice(0, 220) : '');
        const url = p.url;
        const topic = (() => {
          if (/irritable-bowel-syndrome-fodmap/.test(url)) return 'ibs';
          if (/diabetes/.test(url) || /type-2-diabetes/.test(url)) return 'diabetes';
          if (/weight-loss/.test(url)) return 'weight-loss';
          if (/hypertension-cholesterol/.test(url)) return 'nutrition';
          if (/nutrigenetic-tests/.test(url)) return 'genetic';
          return 'general';
        })();
        const words = text.split(/\s+/).filter(Boolean);
        const readingTime = Math.max(1, Math.round(words.length / 200));
        return {
          title,
          url,
          summary,
          content: text,
          topic,
          difficulty: 'beginner',
          contentType: 'guide',
          readingTime,
        };
      });

    return JSON.stringify(items, null, 0);
  }
};


