const { test, expect } = require('@playwright/test');

test.describe('Mobile Menu - RTL Support', () => {
  test.beforeEach(async ({ page }) => {
    // Set RTL direction
    await page.addInitScript(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    });
    
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('Menu displays correctly in RTL mode', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Check that menu panel is positioned on the left in RTL
    const menuPanel = page.locator('.mnav__panel');
    const panelBox = await menuPanel.boundingBox();
    
    // In RTL, the panel should be positioned on the left
    expect(panelBox.x).toBeLessThan(200); // Should be closer to left edge
    
    // Check that gutters are still symmetric
    const panelStyle = await page.evaluate(() => {
      const panel = document.querySelector('.mnav__panel');
      const computed = getComputedStyle(panel);
      return {
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingRight: parseFloat(computed.paddingRight)
      };
    });
    expect(Math.abs(panelStyle.paddingLeft - panelStyle.paddingRight)).toBeLessThanOrEqual(1);
    
    // Check that close button is positioned correctly
    const closeButton = page.locator('.mnav__close');
    const closeBox = await closeButton.boundingBox();
    expect(closeBox.x).toBeGreaterThan(panelBox.x); // Should be on the right side of panel
    
    // Take screenshot
    await page.screenshot({ 
      path: 'artifacts/menu-qa/rtl-390x844.png',
      fullPage: false 
    });
  });

  test('Menu handles long Arabic text', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Inject long Arabic text
    await page.evaluate(() => {
      const firstLink = document.querySelector('.mnav__link');
      if (firstLink) {
        firstLink.textContent = 'هذا نص طويل جداً في اللغة العربية يجب أن يتم التعامل معه بشكل صحيح';
      }
    });
    
    // Check that no horizontal scroll appears
    const bodyOverflowX = await page.evaluate(() => {
      return getComputedStyle(document.body).overflowX;
    });
    expect(['hidden', 'clip']).toContain(bodyOverflowX);
    
    // Check that menu panel doesn't overflow
    const panelBox = await page.locator('.mnav__panel').boundingBox();
    expect(panelBox.width).toBeLessThanOrEqual(390);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'artifacts/menu-qa/rtl-long-text.png',
      fullPage: false 
    });
  });

  test('Menu focus trap works in RTL', async ({ page }) => {
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
      
      // Test Tab key navigation (should work the same in RTL)
      await page.keyboard.press('Tab');
      if (focusableElements.length > 1) {
        await expect(focusableElements[1]).toBeFocused();
      }
      
      // Test Shift+Tab navigation
      await page.keyboard.press('Shift+Tab');
      await expect(firstElement).toBeFocused();
    }
  });
});

