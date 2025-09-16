# diaeta.be V2 - Eleventy technical base

Minimal Eleventy 3.x skeleton with multilingual routing (fr/en/nl/de) and a BEM + ITCSS Sass pipeline. No default layouts or pages are shipped.

## Requirements

- Node.js 20 LTS (`.nvmrc` provided)
- npm >= 9

## Installation

```bash
npm install
```

## npm scripts

- `npm run dev` - Eleventy dev server with parallel Sass/Lightning CSS watch.
- `npm run serve` - Single CSS build then `eleventy --serve`.
- `npm run build` - Clean + Sass build + Lightning CSS minification + Eleventy build.
- `npm run css:watch` - CSS toolchain only (useful with Storybook or visual tests).

## Repository layout

```
.
+-- .editorconfig
+-- .eleventy.js
+-- .gitignore
+-- .nvmrc
+-- netlify.toml
+-- docs/
�   +-- ELEVENTY_AUTOMATION_NOTES.md
+-- public/
�   +-- assets/
�   �   +-- css/
�   +-- favicon.ico
�   +-- manifest.webmanifest
+-- rules/
�   +-- AGENTS.md
�   +-- WEBSITE_RULES.md
�   +-- CSS_RULES.md
�   +-- CONTENT_RULES.md
�   +-- _attachments/
+-- src/
�   +-- _data/
�   �   +-- site.json
�   �   +-- i18n.json
�   �   +-- navigation.json
�   +-- content/
�   �   +-- en/
�   �   +-- fr/
�   �   +-- nl/
�   �   +-- de/
�   +-- images/
�   +-- robots.txt.njk
�   +-- scripts/
�   +-- styles/
�       +-- settings/
�       +-- base/
�       +-- layout/
�       +-- components/
�       +-- utilities/
+-- package.json
```

## Internationalisation

- Locales defined in `src/_data/site.json` (`fr` is default).
- Shared labels in `src/_data/i18n.json` feed the Eleventy i18n plugin.
- Use `localizedUrl(url, locale)` inside templates to generate locale-aware links and pair them with hreflang metadata later on.

## CSS pipeline

- Sass entry point: `src/styles/main.scss` (ITCSS layers `settings`, `base`, `layout`, `components`, `utilities`).
- `lightningcss` bundles/minifies the Sass output and removes intermediates.
- Follow BEM naming for future components (examples provided in `components/*.scss`).

## Rules & references

- Business documents live in `rules/_attachments/`.
- Summaries or constraints belong in the Markdown files under `rules/`.
- Automation tips can be logged in `docs/ELEVENTY_AUTOMATION_NOTES.md`.

## Next steps

1. Populate the rule files with insights from `_attachments`.
2. Add linting/formatting and CI under the `npm run` toolchain.
3. Implement sitemap/hreflang and structured data using `src/_data`.
4. Start migrating historical content into `src/content/{locale}` folders when ready.
