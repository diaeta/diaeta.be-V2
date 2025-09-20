const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright');

// Viewport matrix for comprehensive testing
const viewports = [
  // Small phones
  { width: 320, height: 480, name: '320x480' },
  { width: 320, height: 568, name: '320x568' },
  { width: 320, height: 640, name: '320x640' },
  { width: 320, height: 720, name: '320x720' },
  
  // Common Android
  { width: 360, height: 640, name: '360x640' },
  { width: 360, height: 720, name: '360x720' },
  { width: 360, height: 780, name: '360x780' },
  
  // iPhone variants
  { width: 390, height: 844, name: '390x844' }, // iPhone 15/14/13
  { width: 393, height: 852, name: '393x852' }, // Pixel 8/7
  { width: 414, height: 896, name: '414x896' }, // iPhone 11/XS Max
  { width: 412, height: 915, name: '412x915' }, // Pixel 7 Pro
  
  // Ultra-short heights (worst case scenarios)
  { width: 320, height: 400, name: '320x400' },
  { width: 360, height: 480, name: '360x480' },
  
  // Tablet portrait
  { width: 768, height: 1024, name: '768x1024' },
  { width: 820, height: 1180, name: '820x1180' },
  
  // Tablet landscape
  { width: 834, height: 1112, name: '834x1112' },
  { width: 1024, height: 1366, name: '1024x1366' },
];

// Test each viewport
for (const viewport of viewports) {
  test.describe(`Mobile Menu - ${viewport.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
    });

    test(`Menu opens and displays correctly at ${viewport.name}`, async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      const menuToggle = page.locator('.js-menu-toggle');
      await expect(menuToggle).toBeVisible();
      await menuToggle.click();
      
      // Wait for menu to be visible
      const menuPanel = page.locator('.mnav__panel');
      await expect(menuPanel).toBeVisible();
      
      // Check that menu header is visible
      const menuHeader = page.locator('.mnav__header');
      await expect(menuHeader).toBeVisible();
      
      // Check that menu footer is visible
      const menuFooter = page.locator('.mnav__footer');
      await expect(menuFooter).toBeVisible();
      
      // Check that scrollable area is visible
      const menuScroll = page.locator('.mnav__scroll');
      await expect(menuScroll).toBeVisible();
      
      // Verify no horizontal scroll on body
      const bodyOverflowX = await page.evaluate(() => {
        return getComputedStyle(document.body).overflowX;
      });
      expect(['hidden', 'clip']).toContain(bodyOverflowX);
      
      // Check menu panel positioning and sizing
      const panelBox = await menuPanel.boundingBox();
      expect(panelBox).toBeTruthy();
      expect(panelBox.width).toBeLessThanOrEqual(viewport.width);
      expect(panelBox.height).toBeLessThanOrEqual(viewport.height);
      
      // Verify symmetric gutters
      const panelStyle = await page.evaluate(() => {
        const panel = document.querySelector('.mnav__panel');
        const computed = getComputedStyle(panel);
        return {
          paddingLeft: parseFloat(computed.paddingLeft),
          paddingRight: parseFloat(computed.paddingRight)
        };
      });
      expect(Math.abs(panelStyle.paddingLeft - panelStyle.paddingRight)).toBeLessThanOrEqual(1);
      
      // Take screenshot
      await page.screenshot({ 
        path: `artifacts/menu-qa/${viewport.name}-after.png`,
        fullPage: false 
      });
    });

    test(`Menu accessibility at ${viewport.name}`, async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      
      // Run axe accessibility tests
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('.mnav')
        .analyze();
      
      // Check for critical and serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
      const seriousViolations = accessibilityScanResults.violations.filter(v => v.impact === 'serious');
      
      expect(criticalViolations).toHaveLength(0);
      expect(seriousViolations).toHaveLength(0);
      
      // Check ARIA attributes
      const menuPanel = page.locator('.mnav');
      await expect(menuPanel).toHaveAttribute('aria-hidden', 'false');
      await expect(menuPanel).toHaveAttribute('aria-modal', 'true');
      await expect(menuPanel).toHaveAttribute('role', 'dialog');
      
      // Check menu toggle ARIA
      const menuToggle = page.locator('.js-menu-toggle');
      await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    });

    test(`Menu focus trap at ${viewport.name}`, async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      
      // Get all focusable elements in menu
      const focusableElements = await page.locator('.mnav a, .mnav button, .mnav input, .mnav select, .mnav textarea, .mnav [tabindex]:not([tabindex="-1"])').all();
      
      if (focusableElements.length > 0) {
        // Focus should be on first element
        const firstElement = focusableElements[0];
        await expect(firstElement).toBeFocused();
        
        // Test Tab key navigation
        await page.keyboard.press('Tab');
        if (focusableElements.length > 1) {
          await expect(focusableElements[1]).toBeFocused();
        }
        
        // Test Shift+Tab navigation
        await page.keyboard.press('Shift+Tab');
        await expect(firstElement).toBeFocused();
      }
      
      // Test ESC key closes menu
      await page.keyboard.press('Escape');
      await expect(page.locator('.mnav__panel')).not.toBeVisible();
    });

    test(`Menu scroll behavior at ${viewport.name}`, async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      
      const menuScroll = page.locator('.mnav__scroll');
      
      // Test that scroll area is scrollable
      const scrollHeight = await menuScroll.evaluate(el => el.scrollHeight);
      const clientHeight = await menuScroll.evaluate(el => el.clientHeight);
      
      if (scrollHeight > clientHeight) {
        // Should be able to scroll
        await menuScroll.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }));
        const scrollTop = await menuScroll.evaluate(el => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
        
        // Scroll back to top
        await menuScroll.evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }));
        const scrollTopAfter = await menuScroll.evaluate(el => el.scrollTop);
        expect(scrollTopAfter).toBe(0);
      }
    });

    test(`Menu tap targets at ${viewport.name}`, async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      
      // Check all interactive elements have minimum tap target size
      const interactiveElements = await page.locator('.mnav__link, .mnav__toggle, .mnav__close, .mnav__phone, .mnav__cta, .mnav__langbtn').all();
      
      for (const element of interactiveElements) {
        const box = await element.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test(`Menu handles long text at ${viewport.name}`, async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Open mobile menu
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      
      // Inject long text into a menu item to test overflow handling
      await page.evaluate(() => {
        const firstLink = document.querySelector('.mnav__link');
        if (firstLink) {
          firstLink.textContent = 'This is a very long menu item text that should be handled gracefully with ellipsis or wrapping';
        }
      });
      
      // Check that no horizontal scroll appears
      const bodyOverflowX = await page.evaluate(() => {
        return getComputedStyle(document.body).overflowX;
      });
      expect(['hidden', 'clip']).toContain(bodyOverflowX);
      
      // Check that menu panel doesn't overflow
      const panelBox = await page.locator('.mnav__panel').boundingBox();
      expect(panelBox.width).toBeLessThanOrEqual(viewport.width);
      
      // Take screenshot of long text handling
      await page.screenshot({ 
        path: `artifacts/menu-qa/${viewport.name}-long-text.png`,
        fullPage: false 
      });
    });
  });
}

// Additional tests for specific scenarios
test.describe('Mobile Menu - Special Cases', () => {
  test('Menu respects reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open and close menu multiple times to check for animations
    for (let i = 0; i < 3; i++) {
      await page.locator('.js-menu-toggle').click();
      await page.waitForSelector('.mnav__panel', { state: 'visible' });
      await page.locator('.js-mnav-close').click();
      await page.waitForSelector('.mnav__panel', { state: 'hidden' });
    }
    
    // Menu should still function properly
    await page.locator('.js-menu-toggle').click();
    await expect(page.locator('.mnav__panel')).toBeVisible();
  });

  test('Menu handles orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone portrait
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu in portrait
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500); // Allow for orientation change handling
    
    // Menu should still be visible and properly sized
    const menuPanel = page.locator('.mnav__panel');
    await expect(menuPanel).toBeVisible();
    
    const panelBox = await menuPanel.boundingBox();
    expect(panelBox.width).toBeLessThanOrEqual(844);
    expect(panelBox.height).toBeLessThanOrEqual(390);
  });

  test('Menu handles browser UI changes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Simulate browser UI change by changing viewport height
    await page.setViewportSize({ width: 390, height: 700 }); // Simulate address bar appearing
    await page.waitForTimeout(500);
    
    // Menu should still be properly sized
    const menuPanel = page.locator('.mnav__panel');
    await expect(menuPanel).toBeVisible();
    
    const panelBox = await menuPanel.boundingBox();
    expect(panelBox.height).toBeLessThanOrEqual(700);
  });
});

