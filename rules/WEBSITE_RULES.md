# Website Rules

Authoritative requirements based on `rules/_attachments/` documents. Treat each item as mandatory unless superseded by updated guidance.

1. Brand & identity (see `Corporate-identity.docx`, `The Comprehensive Guide to Color Science for Digital Applications.docx`, `Typography Science and Digital Applications.docx`)
   - Use the specified colour palette; update `settings/_colors.scss` when new tokens are approved.
   - Apply the defined typographic scale and font pairings; document any deviation with justification.
   - Preserve logo clearspace and usage guidelines across languages.

2. Experience & tone (see `Multilingual Dietitian Website Voice & Style Guide.pdf`, `Comprehensive Dietitian Practice Assessment.pdf`)
   - Maintain an expert yet compassionate tone focused on patient outcomes.
   - Include legally required disclaimers on pages covering treatments or medical conditions.
   - Provide transparent pricing/coverage information where mandated.

3. SEO & performance (see `Diaeta's Protocol for Dominance in AI Search_ A Step-by-Step Guide...pdf`, `Evidence-Based Strategies for AI Search Optimization...pdf`, `Website Optimization Protocol Development_.pdf`)
   - Implement hreflang, canonical URLs, structured data (Organization + LocalBusiness), sitemap per locale, robots.txt, manifest, favicons.
   - Respect Core Web Vitals budgets (fast FCP, CLS < 0.1, LCP < 2.5s) by optimising assets and deferring non-essential scripts.
   - Track keyword clusters and schema coverage using the provided SEO playbooks.

4. Accessibility & compliance
   - WCAG 2.1 AA minimum (focus visible, colour contrast, keyboard navigation, `prefers-reduced-motion`).
   - GDPR-compliant consent for analytics/cookies; localise privacy content.

5. Content lifecycle
   - Follow the documented workflow: medical validation ? SEO ? translation ? QA.
   - Archive previous revisions with rationale when replacing key pages.
