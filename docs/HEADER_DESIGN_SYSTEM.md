# Diaeta Header & Navigation Design System

## Overview

This document provides comprehensive documentation for the Diaeta header and navigation design system. The system implements a **calm, premium, clinical** header that is **mobile-first**, accessible (WCAG 2.2 AA), and consistent across all breakpoints and languages.

## 🎯 Design Goals

- **Calm & Premium**: Professional appearance that instills trust
- **Clinical**: Clean, medical-grade aesthetic appropriate for healthcare
- **Mobile-First**: Optimized for mobile devices with progressive enhancement
- **Accessible**: WCAG 2.2 AA compliant with full keyboard navigation
- **Consistent**: Unified experience across all languages (EN/FR/NL/DE)
- **Performance**: Optimized for speed and smooth animations

## 🏗️ Architecture

The design system follows **ITCSS (Inverted Triangle CSS)** architecture:

```
src/styles/
├── settings/          # Design tokens and mixins
│   ├── _tokens.scss   # Colors, typography, spacing, etc.
│   └── _mixins.scss   # Reusable patterns and utilities
├── base/              # Reset and normalization
│   └── _reset.scss    # Header-specific resets
├── layout/            # Layout components
│   └── _header.scss   # Header grid and structure
├── components/        # UI components
│   └── _utilities.scss # Search, phone, language, CTA
├── utilities/         # Utility classes
│   └── _helpers.scss  # Small, composable utilities
└── main.scss          # Entry point
```

## 🎨 Design Tokens

### Colors

The color system is based on professional healthcare aesthetics:

```scss
// Primary Brand Colors
--color-brand: #2B7A78;           // Primary teal (trust, professionalism)
--color-brand-light: #3A9B99;     // Lighter teal for hover states
--color-brand-dark: #1F5A58;      // Darker teal for active states
--color-brand-weak: rgba(43, 122, 120, 0.08); // 8% opacity for subtle backgrounds

// Text Colors
--color-ink: #1A1A1A;             // Primary text (near black)
--color-ink-dim: #6B7280;         // Secondary text (gray-500)
--color-ink-invert: #FFFFFF;      // White text for dark backgrounds

// Surface Colors
--color-surface: #FFFFFF;         // Pure white
--color-surface-weak: rgba(255, 255, 255, 0.92); // 92% white for glass effect
--color-surface-glass: rgba(255, 255, 255, 0.75); // 75% white for glass header
```

### Typography

```scss
// Font Family
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// Font Weights
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;

// Line Height
--line-height-normal: 1.5;
```

### Spacing & Sizing

```scss
// Header Heights (responsive)
--header-h: 56px;  // XL (≥1280px)
--header-h: 52px;  // LG (1180-1279px)
--header-h: 48px;  // MD (768-1179px)
--header-h: 44px;  // SM (≤767px)

// Gaps (responsive)
--header-gap: 24px;  // XL
--header-gap: 20px;  // LG
--header-gap: 16px;  // MD/SM

// Border Radius
--header-radius-lg: 18px;  // For dropdowns and menus
```

## 🎭 Theme Variants

### Solid Theme (Default)
- White background with subtle shadow
- Clean, professional appearance
- Best for most content backgrounds

### Glass Theme
- Translucent background with backdrop blur
- Modern, premium feel
- Perfect for hero sections with background images

```javascript
// Switch themes programmatically
window.headerNavigation.switchTheme('glass');
window.headerNavigation.switchTheme('solid');
```

## 📱 Responsive Behavior

### Breakpoints
- **SM**: ≤767px (Mobile)
- **MD**: 768-1179px (Tablet)
- **LG**: 1180-1279px (Small Desktop)
- **XL**: ≥1280px (Large Desktop)

### Mobile-First Approach
1. **Mobile (≤767px)**: Burger menu, stacked utilities in drawer
2. **Tablet (768-1179px)**: Compressed navigation, reduced gaps
3. **Desktop (≥1180px)**: Full navigation with all utilities visible

## 🧩 Components

### 1. Site Header Container
```html
<header class="site-header theme-solid" data-header>
  <div class="site-header__inner">
    <!-- 3-column grid: Logo | Primary Nav | Utilities -->
  </div>
</header>
```

**Features:**
- Sticky positioning with scroll state changes
- 3-column grid layout (auto | 1fr | auto)
- Theme switching support
- Responsive height adjustments

### 2. Brand/Logo
```html
<a class="brand" href="/en/" aria-label="Diaeta — Home">
  <img src="/images/logo.svg" alt="Diaeta" width="142" height="50" />
</a>
```

**Features:**
- Responsive sizing (max height: calc(--header-h - 12px))
- Hover opacity effect
- Proper focus management

### 3. Primary Navigation
```html
<nav class="nav" aria-label="Primary">
  <ul class="nav__list" role="menubar">
    <li class="nav__item" role="none">
      <a class="nav__link" href="/en/#hero">Home</a>
    </li>
    <li class="nav__item nav__item--has-sub" role="none">
      <button class="nav__link nav__toggle" aria-expanded="false" aria-haspopup="true" aria-controls="about-sub">
        <span class="nav__label">About</span>
        <span class="nav__caret" aria-hidden="true">▼</span>
      </button>
      <div id="about-sub" class="nav-sub" role="menu">
        <a role="menuitem" class="nav-sub__link" href="/en/#philosophy">Our Philosophy</a>
        <!-- More menu items -->
      </div>
    </li>
  </ul>
</nav>
```

**Features:**
- Typographic styling (no outer pills)
- Hover states with micro-chips or underlines
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management and ARIA compliance

### 4. Utilities Cluster

#### Search Component
```html
<div class="search">
  <button class="search__button" aria-expanded="false" aria-controls="search-input" aria-label="Search">
    <svg class="search__icon"><!-- Search icon --></svg>
  </button>
  <form role="search" action="/en/search/" method="get">
    <input id="search-input" class="search__input" type="search" name="q" placeholder="Search..." aria-label="Search" />
  </form>
</div>
```

**Features:**
- Icon-only by default, expands on click
- Smooth width animation (clamp(180px, 22vw, 260px))
- Keyboard support (Escape to close)
- Screen reader announcements

#### Phone Component
```html
<a class="header-phone" href="tel:+32479355551" aria-label="Call +32 479 35 55 51">
  <svg class="phone__icon"><!-- Phone icon --></svg>
  <span class="phone__number">+32 479 35 55 51</span>
</a>
```

**Features:**
- Soft background with brand color
- Responsive text (hides number on small screens)
- Hover lift effect
- Full number in aria-label for accessibility

#### Language Selector
```html
<div class="lang-selector">
  <button class="lang" aria-label="Language" aria-expanded="false" aria-haspopup="true" aria-controls="lang-dropdown">
    <span class="lang-current">EN</span>
    <span class="lang-arrow" aria-hidden="true">▼</span>
  </button>
  <div id="lang-dropdown" class="lang-dropdown" role="menu">
    <a role="menuitem" class="lang-option active" href="/en/" data-lang="en">English</a>
    <a role="menuitem" class="lang-option" href="/fr/" data-lang="fr">Français</a>
    <a role="menuitem" class="lang-option" href="/nl/" data-lang="nl">Nederlands</a>
    <a role="menuitem" class="lang-option" href="/de/" data-lang="de">Deutsch</a>
  </div>
</div>
```

**Features:**
- Compact display (icon + 2-letter code)
- Keyboard navigation
- Active language marking
- Responsive compression

#### CTA Button
```html
<a class="header-cta" href="/en/appointment/">Book Appointment</a>
```

**Features:**
- Strong visual hierarchy (brand gradient)
- Hover lift effect
- Proper focus ring
- Responsive padding

### 5. Mobile Navigation

#### Burger Menu
```html
<button class="burger" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
  <span class="burger__bar"></span>
  <span class="burger__bar"></span>
  <span class="burger__bar"></span>
</button>
```

**Features:**
- 3-bar animation to X on open
- 44px minimum touch target
- Proper ARIA attributes

#### Mobile Drawer
```html
<div id="mobile-menu" class="mnav" hidden>
  <div class="mnav__panel" role="dialog" aria-modal="true" aria-label="Main menu">
    <button class="mnav__close" aria-label="Close menu">✕</button>
    <nav class="mnav__nav">
      <!-- Navigation links -->
    </nav>
    <form class="mnav__search" role="search" action="/en/search/" method="get">
      <input class="mnav__input" type="search" name="q" placeholder="Search…" aria-label="Search" />
    </form>
    <div class="mnav__actions">
      <a class="btn btn-primary" href="/en/appointment/">Book Appointment</a>
      <a class="btn btn-ghost" href="tel:+32479355551">Call +32 479 35 55 51</a>
      <div class="mnav__lang">
        <!-- Language options -->
      </div>
    </div>
  </div>
  <div class="mnav__backdrop" data-close></div>
</div>
```

**Features:**
- Full-height slide-in panel
- Backdrop dismiss
- Focus trap when open
- All utilities accessible in mobile

## ⌨️ Accessibility Features

### WCAG 2.2 AA Compliance
- **Contrast**: All text meets 4.5:1 minimum ratio
- **Focus**: Visible focus rings on all interactive elements
- **Keyboard**: Full keyboard navigation support
- **Screen Readers**: Proper ARIA labels and roles

### Keyboard Navigation
- **Tab**: Navigate through all interactive elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate dropdown menus
- **Escape**: Close all open menus and search
- **Home/End**: Jump to first/last menu items

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Announcements for state changes
- **Skip Links**: Jump to main content
- **Semantic HTML**: Proper heading structure and landmarks

## 🚀 JavaScript API

### Initialization
```javascript
// Automatically initialized on DOM ready
window.headerNavigation = new HeaderNavigation();
```

### Public Methods
```javascript
// Theme Management
headerNavigation.switchTheme('glass');  // Switch to glass theme
headerNavigation.switchTheme('solid');  // Switch to solid theme
headerNavigation.getCurrentTheme();     // Get current theme

// State Checking
headerNavigation.isMobileMenuOpen();    // Check if mobile menu is open
headerNavigation.isSearchOpen();        // Check if search is open
```

### Events
The system automatically handles:
- Scroll detection for header state changes
- Window resize for responsive behavior
- Click outside to close dropdowns
- Keyboard navigation for all components

## 🎨 Customization

### CSS Custom Properties
All design tokens are available as CSS custom properties for easy customization:

```css
:root {
  --color-brand: #2B7A78;        /* Change primary color */
  --header-h: 60px;              /* Change header height */
  --header-gap: 32px;            /* Change spacing */
  --header-transition: 300ms;    /* Change animation speed */
}
```

### Adding New Components
1. Create component styles in `src/styles/components/`
2. Add JavaScript functionality in `src/scripts/header.js`
3. Update the header template in `src/_includes/partials/header_en.njk`
4. Follow BEM naming conventions

### Responsive Adjustments
Use the provided mixins for consistent responsive behavior:

```scss
@include respond-to('lg') {
  // Large screen styles
}

@include respond-below('md') {
  // Below medium screen styles
}
```

## 🧪 Testing Checklist

### Visual Testing
- [ ] Header renders correctly on all breakpoints
- [ ] Logo scales appropriately
- [ ] Navigation items don't wrap unexpectedly
- [ ] Utilities cluster compresses gracefully
- [ ] Mobile drawer slides in smoothly
- [ ] Glass theme renders with proper backdrop blur

### Functional Testing
- [ ] All dropdowns open/close correctly
- [ ] Search expands and collapses smoothly
- [ ] Mobile menu opens/closes with backdrop
- [ ] Language selector works properly
- [ ] Phone link opens dialer on mobile
- [ ] CTA button navigates to appointment page

### Accessibility Testing
- [ ] All interactive elements are keyboard accessible
- [ ] Focus rings are visible and consistent
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG 2.2 AA standards
- [ ] Skip link works properly
- [ ] ARIA attributes are correct

### Performance Testing
- [ ] CSS loads quickly (< 50ms)
- [ ] JavaScript initializes without blocking
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during interactions
- [ ] Memory usage is reasonable

## 🔧 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Works with all major screen readers
- **Progressive Enhancement**: Core functionality works without JavaScript

## 📚 Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [BEM Methodology](https://getbem.com/)

## 🤝 Contributing

When making changes to the header design system:

1. **Follow BEM naming conventions**
2. **Update design tokens for consistency**
3. **Test across all breakpoints**
4. **Verify accessibility compliance**
5. **Update this documentation**

## 📝 Changelog

### v1.0.0 (Current)
- Initial implementation of header design system
- Glass and Solid theme variants
- Full responsive behavior
- WCAG 2.2 AA accessibility compliance
- Mobile-first approach with progressive enhancement
- Comprehensive JavaScript API
- Multilingual support (EN/FR/NL/DE)

---

*This design system ensures a consistent, accessible, and professional header experience across all devices and languages for the Diaeta website.*
