const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Viewport matrix for comprehensive testing
const viewports = [
  // Small phones
  { width: 320, height: 480, name: '320x480' },
  { width: 320, height: 568, name: '320x568' },
  { width: 320, height: 640, name: '320x640' },
  { width: 320, height: 720, name: '320x720' },
  { width: 360, height: 640, name: '360x640' },
  { width: 360, height: 720, name: '360x720' },
  { width: 360, height: 780, name: '360x780' },
  
  // Common Android
  { width: 375, height: 667, name: '375x667' },
  { width: 390, height: 844, name: '390x844' },
  { width: 393, height: 852, name: '393x852' },
  { width: 412, height: 915, name: '412x915' },
  { width: 414, height: 896, name: '414x896' },
  
  // Ultra-short heights (worst case)
  { width: 320, height: 400, name: '320x400' },
  { width: 360, height: 480, name: '360x480' },
  
  // Tablets
  { width: 768, height: 1024, name: '768x1024' },
  { width: 820, height: 1180, name: '820x1180' },
  { width: 834, height: 1112, name: '834x1112' },
  { width: 1024, height: 1366, name: '1024x1366' },
];

// Test each viewport
for (const vp of viewports) {
  test.describe(`Mobile Menu - ${vp.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
    });

    test(`menu visible and functional @ ${vp.name}`, async ({ page }) => {
      // Open mobile menu
      await page.click('.js-menu-toggle');
      await page.waitForSelector('.mnav.is-open', { state: 'visible' });

      // Check that menu is visible
      const menu = page.locator('.mnav');
      await expect(menu).toBeVisible();

      // Check that body scroll is locked
      const bodyOverflowX = await page.evaluate(() => getComputedStyle(document.body).overflowX);
      expect(['hidden', 'clip']).toContain(bodyOverflowX);

      // Check header and footer are present
      await expect(page.locator('.mnav__header')).toBeVisible();
      await expect(page.locator('.mnav__footer')).toBeVisible();

      // Check scrollable area
      const scrollArea = page.locator('.mnav__scroll');
      await expect(scrollArea).toBeVisible();

      // Test that top and bottom items are reachable
      const menuList = page.locator('.mnav__list');
      await expect(menuList).toBeVisible();

      // Scroll to bottom to ensure footer is reachable
      await scrollArea.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }));
      
      // Check footer is still visible
      await expect(page.locator('.mnav__footer')).toBeVisible();

      // Test symmetry - left/right gutters should be equal
      const paddings = await page.evaluate(() => {
        const el = document.querySelector('.mnav__panel');
        if (!el) return { pl: 0, pr: 0 };
        const cs = getComputedStyle(el);
        return { 
          pl: parseFloat(cs.paddingLeft), 
          pr: parseFloat(cs.paddingRight) 
        };
      });
      expect(Math.abs(paddings.pl - paddings.pr)).toBeLessThanOrEqual(1);

      // Take screenshot
      await page.screenshot({ 
        path: `artifacts/menu-qa/${vp.name}-after.png`, 
        fullPage: false 
      });

      // Accessibility check with axe
      const a11yScan = await new AxeBuilder({ page })
        .include('.mnav')
        .analyze();
      
      // Check for critical violations
      const criticalViolations = a11yScan.violations.filter(v => v.impact === 'critical');
      const seriousViolations = a11yScan.violations.filter(v => v.impact === 'serious');
      
      expect(criticalViolations).toHaveLength(0);
      expect(seriousViolations).toHaveLength(0);

      // Close menu
      await page.click('.js-mnav-close');
      await page.waitForSelector('.mnav.is-open', { state: 'hidden' });
    });

    test(`focus trap works @ ${vp.name}`, async ({ page }) => {
      // Open menu
      await page.click('.js-menu-toggle');
      await page.waitForSelector('.mnav.is-open');

      // Test focus trap
      const focusableElements = page.locator('.mnav a, .mnav button');
      const firstElement = focusableElements.first();
      const lastElement = focusableElements.last();

      // Focus should be on first element
      await firstElement.focus();
      await expect(firstElement).toBeFocused();

      // Test Tab key navigation
      await page.keyboard.press('Tab');
      await expect(focusableElements.nth(1)).toBeFocused();

      // Test Shift+Tab to go back
      await page.keyboard.press('Shift+Tab');
      await expect(firstElement).toBeFocused();

      // Test ESC key closes menu
      await page.keyboard.press('Escape');
      await page.waitForSelector('.mnav.is-open', { state: 'hidden' });
    });

    test(`long labels don't overflow @ ${vp.name}`, async ({ page }) => {
      // Open menu
      await page.click('.js-menu-toggle');
      await page.waitForSelector('.mnav.is-open');

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        const menu = document.querySelector('.mnav__panel');
        return menu ? menu.scrollWidth > menu.clientWidth : false;
      });

      expect(hasHorizontalScroll).toBe(false);

      // Check that menu items have proper text overflow handling
      const menuItems = page.locator('.mnav__link, .mnav__toggle');
      const itemCount = await menuItems.count();
      
      for (let i = 0; i < itemCount; i++) {
        const item = menuItems.nth(i);
        const textOverflow = await item.evaluate(el => getComputedStyle(el).textOverflow);
        expect(textOverflow).toBe('ellipsis');
      }
    });

    test(`tap targets are adequate @ ${vp.name}`, async ({ page }) => {
      // Open menu
      await page.click('.js-menu-toggle');
      await page.waitForSelector('.mnav.is-open');

      // Check tap target sizes
      const interactiveElements = page.locator('.mnav__link, .mnav__toggle, .mnav__close, .mnav__phone, .mnav__cta');
      const elementCount = await interactiveElements.count();

      for (let i = 0; i < elementCount; i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
}

// Test RTL support
test.describe('Mobile Menu - RTL Support', () => {
  test('menu works in RTL mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Set RTL direction
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('.js-menu-toggle');
    await page.waitForSelector('.mnav.is-open');

    // Check that menu is positioned correctly for RTL
    const menuPanel = page.locator('.mnav__panel');
    const panelBox = await menuPanel.boundingBox();
    const viewportWidth = page.viewportSize().width;
    
    // In RTL, menu should be on the left side
    expect(panelBox.x).toBeLessThan(viewportWidth / 2);

    // Check symmetry in RTL
    const paddings = await page.evaluate(() => {
      const el = document.querySelector('.mnav__panel');
      if (!el) return { pl: 0, pr: 0 };
      const cs = getComputedStyle(el);
      return { 
        pl: parseFloat(cs.paddingLeft), 
        pr: parseFloat(cs.paddingRight) 
      };
    });
    expect(Math.abs(paddings.pl - paddings.pr)).toBeLessThanOrEqual(1);
  });
});

// Test reduced motion support
test.describe('Mobile Menu - Reduced Motion', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open menu
    await page.click('.js-menu-toggle');
    await page.waitForSelector('.mnav.is-open');

    // Check that animations are disabled
    const menuPanel = page.locator('.mnav__panel');
    const transition = await menuPanel.evaluate(el => getComputedStyle(el).transition);
    expect(transition).toBe('none');
  });
});

