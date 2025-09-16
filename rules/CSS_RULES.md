# CSS Rules

1. Architecture
   - ITCSS layering: `settings/`, `base/`, `layout/`, `components/`, `utilities/`.
   - Maintain a single entry point `src/styles/main.scss` (Lightning CSS outputs `public/assets/css/main.css`).
   - Tokens derive from brand specs (`Corporate-identity.docx`, `The Comprehensive Guide to Color Science for Digital Applications.docx`, `Typography Science and Digital Applications.docx`).

2. Naming & patterns
   - Strict BEM: `.c-block`, `.c-block__element`, `.c-block--modifier`.
   - Layout helpers `.l-...`; utilities `.u-...` with documented intent.
   - Use `@use` namespaces for any mixin/function; no global imports.

3. Tooling
   - Sass authoring only; run `npm run css:build` + `npm run css:post` (Lightning CSS handles autoprefix/minify/transpile).
   - Enforce Stylelint (`stylelint-config-standard`) and Prettier once configs are committed.
   - No external CSS frameworks (Tailwind, Bootstrap, etc.).

4. Performance & accessibility
   - Keep bundle lean; delete unused selectors and avoid duplicating utilities.
   - Provide visible focus styles, maintain WCAG AA contrast (log changes in tokens), honour `prefers-reduced-motion` media queries.
   - Use responsive units/clamp for typography; rely on Lightning CSS for fallbacks.

5. Utilities & documentation
   - Utility classes must be small, composable, and documented in developer notes.
   - Record new utilities and their usage context in `docs/ELEVENTY_AUTOMATION_NOTES.md` or future style guide.
