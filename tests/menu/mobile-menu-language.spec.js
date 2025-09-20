const { test, expect } = require('@playwright/test');

test.describe('Mobile Menu - Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('Language dropdown opens and closes correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Find language toggle button
    const langToggle = page.locator('.js-mobile-lang-toggle');
    await expect(langToggle).toBeVisible();
    
    // Click to open dropdown
    await langToggle.click();
    
    // Check that dropdown is visible
    const langDropdown = page.locator('.js-mobile-lang-dropdown');
    await expect(langDropdown).toBeVisible();
    await expect(langDropdown).toHaveClass(/open/);
    
    // Check ARIA attributes
    await expect(langToggle).toHaveAttribute('aria-expanded', 'true');
    
    // Click again to close
    await langToggle.click();
    await expect(langDropdown).not.toHaveClass(/open/);
    await expect(langToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Language dropdown closes when clicking outside', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Open language dropdown
    const langToggle = page.locator('.js-mobile-lang-toggle');
    await langToggle.click();
    
    const langDropdown = page.locator('.js-mobile-lang-dropdown');
    await expect(langDropdown).toBeVisible();
    
    // Click outside the dropdown (on menu scroll area)
    await page.locator('.mnav__scroll').click();
    
    // Dropdown should close
    await expect(langDropdown).not.toHaveClass(/open/);
    await expect(langToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Language options are accessible and clickable', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Open language dropdown
    await page.locator('.js-mobile-lang-toggle').click();
    
    // Check that all language options are visible and have proper attributes
    const langOptions = page.locator('.mnav__langopt');
    const optionCount = await langOptions.count();
    expect(optionCount).toBeGreaterThan(0);
    
    // Check each option
    for (let i = 0; i < optionCount; i++) {
      const option = langOptions.nth(i);
      await expect(option).toBeVisible();
      
      // Check that option has proper text and href
      const text = await option.textContent();
      const href = await option.getAttribute('href');
      
      expect(text).toBeTruthy();
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/(fr|en|nl|de|ar)\/$/);
    }
    
    // Check that current language is marked as active
    const activeOption = page.locator('.mnav__langopt.active');
    await expect(activeOption).toBeVisible();
    await expect(activeOption).toHaveAttribute('aria-current', 'true');
  });

  test('Language dropdown handles keyboard navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Focus on language toggle
    const langToggle = page.locator('.js-mobile-lang-toggle');
    await langToggle.focus();
    await expect(langToggle).toBeFocused();
    
    // Press Enter to open dropdown
    await page.keyboard.press('Enter');
    
    const langDropdown = page.locator('.js-mobile-lang-dropdown');
    await expect(langDropdown).toBeVisible();
    
    // Press Escape to close dropdown
    await page.keyboard.press('Escape');
    await expect(langDropdown).not.toHaveClass(/open/);
  });

  test('Language dropdown is properly positioned', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Open language dropdown
    await page.locator('.js-mobile-lang-toggle').click();
    
    const langDropdown = page.locator('.js-mobile-lang-dropdown');
    const dropdownBox = await langDropdown.boundingBox();
    
    // Dropdown should be positioned above the toggle button
    const langToggle = page.locator('.js-mobile-lang-toggle');
    const toggleBox = await langToggle.boundingBox();
    
    expect(dropdownBox.y).toBeLessThan(toggleBox.y);
    
    // Dropdown should be horizontally centered relative to toggle
    const dropdownCenterX = dropdownBox.x + dropdownBox.width / 2;
    const toggleCenterX = toggleBox.x + toggleBox.width / 2;
    expect(Math.abs(dropdownCenterX - toggleCenterX)).toBeLessThan(10);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'artifacts/menu-qa/language-dropdown.png',
      fullPage: false 
    });
  });

  test('Language dropdown handles small viewports', async ({ page }) => {
    // Test on very small viewport
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    await page.locator('.js-menu-toggle').click();
    await page.waitForSelector('.mnav__panel', { state: 'visible' });
    
    // Open language dropdown
    await page.locator('.js-mobile-lang-toggle').click();
    
    const langDropdown = page.locator('.js-mobile-lang-dropdown');
    await expect(langDropdown).toBeVisible();
    
    // Check that dropdown doesn't overflow viewport
    const dropdownBox = await langDropdown.boundingBox();
    expect(dropdownBox.x).toBeGreaterThanOrEqual(0);
    expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(320);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'artifacts/menu-qa/language-dropdown-small.png',
      fullPage: false 
    });
  });
});

