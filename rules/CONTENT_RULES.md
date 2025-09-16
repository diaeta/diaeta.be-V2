# Content Rules

1. Structure & localisation
   - Maintain folder parity across `src/content/en`, `fr`, `nl`, `de`; do not ship default pages.
   - Use shared modules or data to avoid duplication while respecting locale nuances.

2. Tone & style (see `Multilingual Dietitian Website Voice & Style Guide.pdf`)
   - Speak with authority, empathy, and clarity; avoid medical jargon without explanation.
   - Adapt cultural references and formality per locale (e.g., French vouvoiement, Dutch direct tone).

3. Compliance & accuracy (see `Comprehensive Dietitian Practice Assessment.pdf`)
   - Include mandatory disclaimers on condition-specific content.
   - Verify nutritional claims with cited sources and the lead dietitian before publication.

4. SEO & discoverability (see SEO playbooks and keyword documents)
   - Map keywords from `English Keywords to Find a Dietitian in Belgium an.pdf` and `Mots-cles francais...pdf` to dedicated hubs.
   - Generate structured data (Organization/LocalBusiness) and ensure hreflang/canonical tags via data files.

5. Workflow
   - Follow the editorial pipeline: medical validation ? SEO review ? translation ? QA.
   - Log each content deployment (who, when, why) for auditability.
