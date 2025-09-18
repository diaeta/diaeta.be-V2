# Byterover Handbook

*Generated: 2025-01-27*

## Layer 1: System Overview

**Purpose**: Multilingual dietitian website (diaeta.be V2) built with Eleventy 3.x, providing evidence-based nutrition services for IBS, weight management, diabetes, and cholesterol management across French, English, Dutch, and German languages.

**Tech Stack**: 
- **Static Site Generator**: Eleventy 3.x with Nunjucks templating
- **Styling**: Sass with ITCSS architecture, BEM methodology, Lightning CSS
- **Internationalization**: Custom i18n system with 4 locales (fr/en/nl/de)
- **Build Tools**: npm scripts, cross-env, rimraf, npm-run-all
- **Development**: http-server, live reload, watch modes
- **Quality**: ESLint, Prettier, Stylelint, pa11y-ci accessibility testing
- **Deployment**: Netlify with CI/CD pipeline

**Architecture**: Component-based static site architecture with:
- **Content Layer**: Markdown/HTML files organized by locale in `src/content/{locale}/`
- **Template Layer**: Nunjucks layouts and partials in `src/_includes/`
- **Data Layer**: JSON configuration files in `src/_data/`
- **Asset Pipeline**: Sass compilation with ITCSS layers, image optimization
- **Build Pipeline**: Eleventy transforms, passthrough copies, asset bundling

**Key Technical Decisions**:
- Eleventy 3.x for modern static site generation with ESM support
- Custom i18n implementation over third-party plugins for flexibility
- ITCSS + BEM for scalable, maintainable CSS architecture
- Multilingual routing with locale prefixes (e.g., `/en/`, `/fr/`)
- Image optimization with multiple formats (AVIF, WebP, JPEG)
- Accessibility-first approach with pa11y-ci testing

**Entry Points**: 
- `eleventy.config.js` - Main configuration and plugin setup
- `src/content/{locale}/index.html` - Homepage templates per locale
- `src/_includes/layouts/base.njk` - Base layout template
- `src/styles/main.scss` - CSS entry point with ITCSS layers

---

## Layer 2: Module Map

**Core Modules**:
- **Content Management**: `src/content/` - Organized by locale with structured content for services, knowledge hub, and location pages
- **Internationalization**: `src/_data/i18n.json` + custom filters - Handles 4-language support with fallback mechanisms
- **Navigation System**: `src/_data/navigation.json` + partials - Dynamic menu generation with locale-aware links
- **Template Engine**: `src/_includes/` - Nunjucks layouts and partials for consistent UI components
- **Styling System**: `src/styles/` - ITCSS architecture with BEM components and utility classes

**Data Layer**:
- `src/_data/site.json` - Site configuration, locales, and brand settings
- `src/_data/navigation.json` - Menu structure and navigation labels
- `src/_data/i18n.json` - Translation keys for all supported languages
- `src/_data/seo.json` - SEO metadata and structured data
- `src/_data/schema.json` - JSON-LD schema markup
- `src/_data/cabinets_en.json` - Location data for English content

**Integration Points**:
- **Eleventy Plugins**: i18n, navigation, bundle, RSS, sitemap
- **Asset Pipeline**: Image optimization, CSS compilation, JavaScript bundling
- **Build System**: npm scripts for development, building, and deployment
- **External Services**: Netlify deployment, accessibility testing

**Utilities**:
- **Localization Helpers**: `localizedUrl()`, `hreflangList()`, `t()` filters
- **Date Formatting**: Luxon-based date filter with timezone support
- **Image Processing**: Eleventy Image with responsive formats
- **Content Transforms**: Legacy script removal, HTML optimization

**Module Dependencies**:
- Content → Templates → Layouts → Base Template
- Data files → Templates via Eleventy data cascade
- Styles → Components → Base → Settings
- Build process → Asset optimization → Output generation

---

## Layer 3: Integration Guide

**API Endpoints**: N/A (Static site - no server-side APIs)

**Configuration Files**:
- `eleventy.config.js` - Main Eleventy configuration with plugins and filters
- `package.json` - Dependencies, scripts, and project metadata
- `netlify.toml` - Deployment configuration for Netlify
- `src/_data/site.json` - Site-wide settings and locale configuration
- `.editorconfig` - Code formatting standards

**External Integrations**:
- **Netlify**: Static site hosting and CI/CD pipeline
- **Eleventy Plugins**: 
  - `@11ty/eleventy-plugin-bundle` - Asset bundling
  - `@11ty/eleventy-plugin-rss` - RSS feed generation
  - `@quasibit/eleventy-plugin-sitemap` - XML sitemap
- **Development Tools**: ESLint, Prettier, Stylelint for code quality
- **Accessibility**: pa11y-ci for automated accessibility testing

**Workflows**:
- **Development**: `npm run dev` - Parallel CSS watch + Eleventy serve
- **Build**: `npm run build` - Clean + Sass + Eleventy build + asset optimization
- **Quality**: `npm run check` - Lint CSS and JavaScript
- **Formatting**: `npm run format` - Prettier code formatting
- **Deployment**: Netlify auto-deploy on git push to main branch

**Interface Definitions**:
- **Template Data**: Global data available to all templates via `src/_data/`
- **Filter Functions**: Custom Eleventy filters for localization and formatting
- **Shortcodes**: Image processing and responsive image generation
- **Transforms**: HTML post-processing for optimization

---

## Layer 4: Extension Points

**Design Patterns**:
- **Component-Based Architecture**: Reusable partials in `src/_includes/partials/`
- **Data-Driven Templates**: JSON configuration files drive template rendering
- **Plugin Architecture**: Eleventy plugins for extensible functionality
- **ITCSS Methodology**: Scalable CSS architecture with clear layer separation
- **BEM Naming**: Consistent CSS class naming for maintainable styles

**Extension Points**:
- **New Locales**: Add to `site.json` locales array and create `src/_data/i18n.json` entries
- **Content Types**: Add new content directories in `src/content/{locale}/`
- **Template Components**: Create new partials in `src/_includes/partials/`
- **Styling Components**: Add new SCSS files in `src/styles/components/`
- **Data Sources**: Add new JSON files in `src/_data/` for template data

**Customization Areas**:
- **Brand Identity**: Update `src/_data/site.json` for brand name and settings
- **Navigation**: Modify `src/_data/navigation.json` for menu structure
- **Styling**: Customize `src/styles/settings/` for colors, typography, breakpoints
- **Content Structure**: Organize content by locale and service type
- **SEO Configuration**: Update `src/_data/seo.json` for metadata

**Plugin Architecture**:
- **Eleventy Plugins**: Extensible via npm packages and custom configuration
- **Custom Filters**: Add new template filters in `eleventy.config.js`
- **Shortcodes**: Create custom shortcodes for specialized content
- **Transforms**: Add post-processing transforms for HTML optimization
- **Data Processing**: Custom data processing via 11ty.js files

**Recent Changes**:
- Migration to Eleventy 3.x with ESM support
- Implementation of custom i18n system
- ITCSS + BEM CSS architecture adoption
- Accessibility testing integration with pa11y-ci
- Multilingual content structure with locale-specific partials

---

*Byterover handbook optimized for agent navigation and human developer onboarding*

