# Eleventy Automation Notes

Quick reference for automation tasks and future improvements. No pages or layouts are created by these snippets; they only document how to wire tooling when needed.

## Data Cascade, Collections, Pagination

- Use global data (`src/_data/site.json`, `src/_data/i18n.json`) and directory data files (`*.11tydata.js`) to feed metadata and navigation per locale.
- Collections example:
  ```js
  eleventyConfig.addCollection('articles', api =>
    api.getFilteredByGlob('src/content/**/news/*.md')
  );
  ```
- Combine collections with pagination for listing pages (`pagination` block in front matter). Navigation plugin reads `eleventyNavigation` entries added later.

## Responsive Images (eleventy-img)

```njk
{% image 'src/images/hero.jpg', 'Hero alt text', { widths: [480, 960], formats: ['avif','webp','jpeg'] } %}
```

- Built-in shortcode outputs a `<picture>` element with lazy loading and size attributes.
- Cache behaviour and width sets can be extended inside `eleventy.config.js`.
- Place source images under `src/images/` so generated assets write to `/_site/assets/images`.

## Bundle Plugin & Vite (future)

- Bundle plugin is enabled; declare bundles when assets need packaging:
  ```js
  eleventyConfig.addBundle('critical-css', { transforms: ['cssnano'] });
  ```
- If Vite is introduced later, run it alongside Eleventy (e.g., `npm-run-all --parallel dev vite`) and passthrough its build output.

## WebC & Islands (future)

- Add `@11ty/eleventy-plugin-webc` when component authoring begins (`eleventyConfig.addPlugin(WebCPlugin, { components: 'src/components/**/*.webc' });`).
- Use `<is-land on:visible>` wrappers to hydrate interactive components progressively once client scripts exist.

## Fetching, Render, i18n

- `@11ty/eleventy-fetch` example:
  ```js
  const EleventyFetch = require('@11ty/eleventy-fetch');
  const data = await EleventyFetch(url, { duration: '1d', type: 'json' });
  ```
- Render plugin (`@11ty/eleventy-plugin-render`) can evaluate templates inside Markdown; enable when dynamic partials are required.
- I18n plugin already active; filters (`localizedUrl`, forthcoming `t`) read from `i18n.json` and per-locale data.

## Sitemap, RSS, Schema

- Sitemap plugin uses `baseUrl` from `site.json`; once pages exist, it outputs sitemap entries per locale.
- RSS plugin is installed�add a collection and template when the blog returns.
- Structured data placeholders live in `src/_data/schema.json`; include them via shortcodes or data cascade.

## Builds, Watch Targets, Passthrough

- `ELEVENTY_OUTPUT_DIR=_site` keeps builds reproducible; use `--incremental` for faster local rebuilds.
- Add watch targets via `eleventyConfig.addWatchTarget('src/scripts')` as new directories appear.
- Additional passthroughs: `eleventyConfig.addPassthroughCopy({ static: 'static' });` for untouched assets.
- Define transforms/filters in config to minify HTML or process Markdown output.

## CI, QA, Deployment

- Suggested CI steps: `npm install`, `npm run check`, `npm run build`, accessibility (`npx pa11y http://localhost:8080`), link checking (`npx lychee _site/**/*.html`).
- Deployment options: Netlify (`netlify.toml` already present), GitHub Pages (`actions/checkout` + `peaceiris/actions-gh-pages`), Cloudflare Pages (`npx @cloudflare/cli pages publish _site`).

## Safe Defaults & Upgrades

- Use `draft: true` or `eleventyExcludeFromCollections: true` in front matter to hide in-progress content.
- Conditional permalinks example:
  ```njk
  permalink: {{ draft | default(false) ? false : page.url }}
  ```
- Run `npx @11ty/eleventy --upgrade` or `npm outdated` periodically to keep dependencies current.
- Document any new automation workflows in this file so future contributors stay aligned.
