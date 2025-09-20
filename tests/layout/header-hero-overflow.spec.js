// Automated viewport check for header and hero overflow conditions
const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'iPad Air 1180x820', width: 1180, height: 820 },
  { name: 'iPad Mini 1024x768', width: 1024, height: 768 },
  { name: 'Surface Pro 1368x912', width: 1368, height: 912 },
  { name: 'Mobile Large 430x932', width: 430, height: 932 },
  { name: 'Mobile Small 360x640', width: 360, height: 640 }
];

test.describe('Header & Hero layout', () => {
  for (const viewport of viewports) {
    test(`No horizontal overflow @ ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/en/', { waitUntil: 'networkidle' });

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const header = document.querySelector('.site-header');
        const hero = document.querySelector('.hero-section');

        const headerBox = header ? header.getBoundingClientRect() : null;
        const heroBox = hero ? hero.getBoundingClientRect() : null;

        return {
          docWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          bodyWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          headerRight: headerBox ? headerBox.right : null,
          heroRight: heroBox ? heroBox.right : null,
          viewportWidth: window.innerWidth
        };
      });

      if (metrics.docWidth > metrics.viewportWidth || metrics.bodyWidth > metrics.viewportWidth) {
        const overflowDetails = await page.evaluate(() => {
          const vw = window.innerWidth;
          return Array.from(document.querySelectorAll('*'))
            .map((el) => {
              const rect = el.getBoundingClientRect();
              const classes = el.classList ? Array.from(el.classList).join('.') : '';
              let selector = el.tagName.toLowerCase();
              if (classes) selector += `.${classes}`;
              if (el.id) selector += `#${el.id}`;
              return {
                selector,
                width: rect.width,
                left: rect.left,
                right: rect.right,
                scrollWidth: el.scrollWidth,
                overflow: Number((rect.right - vw).toFixed(2)),
                scrollOverflow: Number((el.scrollWidth - vw).toFixed(2))
              };
            })
            .filter((item) => item.right > vw + 0.5 || item.scrollWidth > vw + 0.5)
            .sort((a, b) => (b.right - vw) - (a.right - vw))
            .slice(0, 10);
        });

        console.log(`Viewport ${viewport.name} overflow metrics: ${JSON.stringify(metrics)}`);
        console.log(`Viewport ${viewport.name} overflow offenders: ${JSON.stringify(overflowDetails)}`);
      }

      expect(metrics.docWidth, `document width should not exceed viewport (metrics: ${JSON.stringify(metrics)})`).toBeLessThanOrEqual(metrics.viewportWidth);
      expect(metrics.bodyWidth, `body width should not exceed viewport (metrics: ${JSON.stringify(metrics)})`).toBeLessThanOrEqual(metrics.viewportWidth);
      if (metrics.headerRight !== null) {
        expect(metrics.headerRight, 'header should stay within viewport').toBeLessThanOrEqual(metrics.viewportWidth + 0.5);
      }
      if (metrics.heroRight !== null) {
        expect(metrics.heroRight, 'hero should stay within viewport').toBeLessThanOrEqual(metrics.viewportWidth + 0.5);
      }
    });
  }
});
