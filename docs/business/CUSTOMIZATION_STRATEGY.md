# FairTradeWorker: Advanced Customization Options & Implementation Guide

**Date:** January 2026
**Status:** Feature Enhancement Specification
**Audience:** Product, Engineering, Design

---

## EXECUTIVE OVERVIEW

This document outlines **12 new customization options** to be implemented across FairTradeWorker's UI/UX system, with pricing tiers and technical implementation details.

**Current State:** 8 customization dimensions (colors, density, fonts, etc.)
**Enhanced State:** 20+ customization dimensions with AI recommendations
**Revenue Impact:** +$1.8K - $3K annually per enterprise customer

---

## PART I: EXPANDED CUSTOMIZATION DIMENSIONS

### Category 1: Visual Customization (Currently Partial)

#### 1.1 Color System (ENHANCED)

**Current:**
- 12 predefined color themes (blue, emerald, violet, etc.)
- Dark mode toggle

**Proposed Enhancements:**
```typescript
// NEW: Custom Color Picker
interface ColorCustomization {
  // Primary colors (full control)
  primary: string;           // Hex or RGB
  secondary: string;
  accent: string;

  // Semantic colors (for accessibility)
  success: string;
  warning: string;
  error: string;
  info: string;

  // Neutral palette (5 grays)
  neutral100: string;        // Lightest
  neutral200: string;
  neutral400: string;
  neutral600: string;
  neutral900: string;        // Darkest

  // Advanced
  contrastEnhanced: boolean; // WCAG AAA compliance
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}
```

**Pricing Tiers:**
| Tier | Colors | Blind Modes | Contrast Control |
|------|--------|-------------|------------------|
| FREE | 12 presets | None | WCAG AA default |
| PRO | 12 + custom picker | None | WCAG AA/AAA toggle |
| ELITE | Unlimited + AI recommendations | 3 modes | Full WCAG control |
| BRANDED | All ELITE + auto-generated palettes | All 4 modes | Custom contrast matrix |

---

#### 1.2 Typography System (NEW)

**Currently:** 2 fonts (sans/mono)

**Proposed:**
```typescript
interface TypographyCustomization {
  // Font family selection
  headingFont: FontFamily;     // H1-H3
  bodyFont: FontFamily;        // Paragraphs, labels
  monoFont: FontFamily;        // Code, terminals

  // Scale control
  baseFontSize: 12 | 14 | 16 | 18;  // Current: 16
  scaleRatio: 1.0 | 1.125 | 1.25 | 1.5;  // Golden ratio variants

  // Letter spacing
  letterSpacing: {
    tight: -0.02em,
    normal: 0em,
    relaxed: 0.02em,
    loose: 0.05em
  };

  // Line height
  lineHeight: {
    compact: 1.3,
    normal: 1.5,
    relaxed: 1.8,
    spaced: 2.0
  };

  // Weight matrix (which weights available)
  weights: 300 | 400 | 500 | 600 | 700 | 800;
}
```

**Available Font Options:**
- **Serif:** Georgia, Crimson Text, Playfair Display
- **Sans:** Inter, Poppins, DM Sans, JetBrains Mono
- **Mono:** Fira Code, Source Code Pro, Courier Prime

**Pricing Tiers:**
| Tier | Font Options | Custom Upload | Scale Control |
|------|-------------|---------------|---------------|
| FREE | 5 system fonts | No | 16px fixed |
| PRO | 15 web fonts | No | 4 sizes |
| ELITE | 30+ fonts + upload | Yes (2 fonts) | 6 sizes + ratio control |
| BRANDED | Unlimited + licensing | Yes (unlimited) | Full typographic control |

---

#### 1.3 Spacing & Layout System (NEW)

**Currently:** 2 density levels (comfortable/compact)

**Proposed:**
```typescript
interface SpacingCustomization {
  // Grid base unit (all spacing derives from this)
  baseUnit: 4 | 6 | 8 | 12;  // pixels

  // Predefined scales
  scale: 'compact' | 'comfortable' | 'spacious' | 'custom';

  // Component-specific padding
  padding: {
    button: { x: 12, y: 8 },
    card: { x: 16, y: 12 },
    input: { x: 12, y: 10 },
    badge: { x: 8, y: 4 }
  };

  // Gaps between elements
  gaps: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  };

  // Breakpoints for responsive
  breakpoints: {
    mobile: 320 | 375 | 390 | 412,
    tablet: 768 | 834 | 1024,
    desktop: 1280 | 1440 | 1920 | 2560
  };
}
```

**Pricing Impact:**
| Tier | Preset Scales | Custom Override | Breakpoint Control |
|------|---|---|---|
| FREE | 2 scales | No | Fixed |
| PRO | 4 scales | Limited (±10%) | 3 breakpoints |
| ELITE | 6 scales | Full override | Custom breakpoints |
| BRANDED | Custom builder | Full control | AI-optimized |

---

### Category 2: Interactive & Motion (NEW)

#### 2.1 Animation & Transition System

**Currently:** 4 animation speed presets

**Proposed:**
```typescript
interface MotionCustomization {
  // Global animation speed multiplier
  globalAnimationSpeed: 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

  // Component-specific timings (milliseconds)
  transitions: {
    hover: 200 | 300 | 500;        // Button/link hover
    focus: 300 | 500 | 700;        // Focus states
    dialog: 300 | 500 | 800;       // Modal open/close
    nav: 400 | 600 | 1000;         // Navigation changes
    toast: 300 | 500 | 1000;       // Toast notifications
    collapse: 300 | 500 | 800;     // Accordion expand/collapse
  };

  // Easing function library
  easing: {
    none: 'linear',
    gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  };

  // Parallax & depth effects
  parallaxIntensity: 'none' | 'subtle' | 'medium' | 'dramatic';

  // Reduced motion (accessibility)
  prefersReducedMotion: boolean;

  // Physics-based animations
  usePhysicsAnimations: boolean;  // Spring, elastic effects
}
```

**New Pricing Model:**
- **Motion Pack**: +$19.99/month (all custom transitions + easing)
- Bundle with PRO Customization: +$14.99/month

**Enterprise impact:** Smoother UX = 8-15% better engagement

---

#### 2.2 Microinteraction Customization (NEW)

```typescript
interface MicrointeractionCustomization {
  // Button feedback
  buttonFeedback: 'subtle' | 'medium' | 'strong' | 'haptic';

  // Hover indicators
  hoverStyle: 'scale' | 'brighten' | 'shadow' | 'underline' | 'combine';
  hoverIntensity: 0.05 | 0.1 | 0.15 | 0.2;

  // Click feedback (ripple effect)
  clickRipple: boolean;
  rippleColor: string;         // Hex override
  rippleSpread: 'tight' | 'normal' | 'wide';

  // Focus indicators
  focusIndicator: 'ring' | 'outline' | 'underline' | 'background';
  focusColor: string;
  focusThickness: 1 | 2 | 3 | 4 | 5;

  // Input field feedback
  inputFeedback: {
    successState: 'checkmark' | 'background' | 'border' | 'both';
    errorState: 'icon' | 'shake' | 'background' | 'combined';
    focusAnnouncement: boolean;  // Screen reader
  };

  // Loading states
  loadingIndicator: 'spinner' | 'skeleton' | 'progress' | 'pulse';
  loadingColor: string;
  loadingSpeed: 'slow' | 'normal' | 'fast';
}
```

---

### Category 3: Accessibility & Perception (ENHANCED)

#### 3.1 Accessibility Options (EXPANDED)

**Currently:** High contrast mode toggle

**Proposed:**
```typescript
interface AccessibilityCustomization {
  // Text scaling
  textScaling: 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.5 | 2.0;

  // Color blindness simulation
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

  // Focus management
  focusIndicator: {
    visible: boolean;
    thickness: 1 | 2 | 3 | 4 | 5;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
  };

  // Motion sensitivity
  prefersReducedMotion: boolean;
  vestibularMode: boolean;       // Minimizes vertigo triggers

  // Keyboard navigation
  keyboardNavigationMode: boolean;
  tabIndexVisibility: boolean;   // Show tab order visually

  // Screen reader optimization
  screenReaderOptimization: boolean;
  verbosity: 'minimal' | 'standard' | 'verbose';

  // Contrast
  contrastMode: 'standard' | 'enhanced' | 'maximum';
  customContrast: number;        // 1.0 - 3.0 multiplier

  // Reading mode
  readingMode: boolean;          // Dyslexia-friendly font + spacing
  dyslexiaFriendlyFont: boolean;
}
```

**Accessibility Tier Pricing:**
| Tier | Features | Support |
|------|----------|---------|
| FREE | Basic text scaling | Standard support |
| PRO | All accessibility options | Email support |
| ELITE | All + dyslexia fonts | Priority support |
| BRANDED | All + AI optimization | Dedicated support |

---

#### 3.2 Sensory & Perceptual Customization (NEW)

```typescript
interface SensoryCustomization {
  // Brightness & display
  brightness: 0.7 | 0.8 | 0.9 | 1.0 | 1.1 | 1.2;
  screenGamma: 1.8 | 2.0 | 2.2 | 2.4;  // Monitor calibration

  // Color temperature (blue light filter)
  colorTemperature: 'cool' | 'neutral' | 'warm' | 'cozy';
  nightMode: {
    enabled: boolean;
    startTime: string;            // HH:MM format
    endTime: string;
    gradualTransition: boolean;
  };

  // Audio cues
  enableSoundFeedback: boolean;
  soundVolume: 0 | 25 | 50 | 75 | 100;
  soundType: 'gentle' | 'standard' | 'bold';

  // Haptic feedback
  enableHaptics: boolean;
  hapticIntensity: 'light' | 'medium' | 'strong';
}
```

---

### Category 4: Navigation & Information Architecture (NEW)

#### 4.1 Navigation Customization

**Currently:** Sidebar show/hide per view type

**Proposed:**
```typescript
interface NavigationCustomization {
  // Sidebar position & style
  sidebarPosition: 'left' | 'right' | 'hidden';
  sidebarWidth: 'narrow' | 'standard' | 'wide';
  sidebarStyle: 'overlay' | 'push' | 'collapse';
  sidebarBehavior: 'always-open' | 'collapse-on-nav' | 'auto-hide';

  // Navigation items visibility
  navItems: {
    [key in View]: {
      visible: boolean;
      customLabel?: string;
      customIcon?: string;
      reorder?: number;
    }
  };

  // Breadcrumb behavior
  showBreadcrumb: boolean;
  breadcrumbStyle: 'text' | 'icons' | 'mixed';

  // Tab behavior
  tabStyle: 'tabs' | 'buttons' | 'vertical';
  tabPosition: 'top' | 'left' | 'right';

  // Search position
  searchPosition: 'sidebar' | 'header' | 'modal-only';

  // Command palette
  commandPaletteEnabled: boolean;
  commandPaletteShortcut: string;  // Default: Cmd+K
}
```

**Pricing:** Included in PRO+ tiers

---

#### 4.2 Content Density Customization (NEW)

```typescript
interface ContentDensityCustomization {
  // List density
  listDensity: 'compact' | 'comfortable' | 'spacious';

  // Card density
  cardStyle: 'compact' | 'elevated' | 'filled' | 'outlined';
  cardPadding: 'tight' | 'standard' | 'generous';

  // Table density
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  tableStriped: boolean;
  tableHoverHighlight: boolean;

  // Grid columns
  gridColumns: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4 | 5;
    ultrawide: 4 | 5 | 6;
  };
}
```

---

### Category 5: Data Display & Visualization (NEW)

#### 5.1 Chart & Graph Customization

```typescript
interface DataVisualizationCustomization {
  // Chart defaults
  chartTheme: 'light' | 'dark' | 'custom';
  chartColorScheme: string[];    // Hex colors

  // Specific chart preferences
  lineCharts: {
    showDataPoints: boolean;
    smoothLines: boolean;
    animateOnLoad: boolean;
  };

  barCharts: {
    barRadius: 0 | 4 | 8 | 12;
    groupedVsStacked: 'auto' | 'grouped' | 'stacked';
  };

  pieCharts: {
    donutHole: boolean;
    holeSize: 30 | 40 | 50;
    labelPosition: 'inside' | 'outside' | 'legend';
  };

  // Data table display
  tableColumnDefaults: {
    minWidth: 100 | 150 | 200 | 300;
    freezeFirstColumn: boolean;
    allowReordering: boolean;
    allowResizing: boolean;
  };
}
```

**Enterprise Use Case:** CFOs want specific chart formats for board presentations

---

#### 5.2 Dashboard Layout Customization (ENHANCED)

**Currently:** Fixed dashboard layouts

**Proposed:**
```typescript
interface DashboardCustomization {
  // Widget grid
  gridSize: 12 | 16 | 20;  // Columns
  gridGap: 8 | 12 | 16 | 20;

  // Widget management
  allowWidgetReordering: boolean;
  allowWidgetResizing: boolean;
  allowWidgetCRUD: boolean;  // Create/remove widgets

  // Widget defaults
  widgetDefaults: {
    minHeight: 4 | 6 | 8 | 12;  // Grid units
    animateOnLoad: boolean;
    showBorders: boolean;
  };

  // Responsive layout
  responsiveBehavior: 'stack' | 'hide-columns' | 'horizontal-scroll';
}
```

**Feature Release:** Q2 2026 (estimated)

---

### Category 6: Brand & Identity (NEW - PREMIUM)

#### 6.1 White-Label Customization

**For BRANDED ELITE & ENTERPRISE tiers:**

```typescript
interface BrandCustomization {
  // Company branding
  company: {
    name: string;
    logo: ImageFile;           // SVG or PNG
    favicon: ImageFile;        // 32x32+
    headerBgImage?: ImageFile;
  };

  // Color customization
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Email branding
  emailTemplate: {
    headerImage: ImageFile;
    footerContent: string;     // HTML/Markdown
    signatureBlock: string;
    unsubscribeUrl: string;
  };

  // Domain customization
  customDomain: string;        // e.g., jobs.mycompany.com
  enableWhiteLabel: boolean;   // Remove "Powered by FairTradeWorker"

  // App customization
  appTitle: string;
  appDescription: string;
  socialMeta: {
    ogImage: ImageFile;
    twitterHandle?: string;
  };
}
```

**Pricing:** BRANDED ELITE: $999/month (includes this)

---

## PART II: IMPLEMENTATION PRIORITY & ROADMAP

### Phase 1: Foundation (Weeks 1-2)
**Prerequisite: Refactor theme system in React**

```typescript
// Current structure in types.ts
interface ThemeSettings {
  color: ThemeColor;
  radius: BorderRadius;
  density: InterfaceDensity;
  // ... (8 dimensions)
}

// New structure
interface ThemeSettings extends {
  // Visual
  color: ColorCustomization;
  typography: TypographyCustomization;
  spacing: SpacingCustomization;

  // Interactive
  motion: MotionCustomization;
  microinteractions: MicrointeractionCustomization;

  // Accessibility
  accessibility: AccessibilityCustomization;
  sensory: SensoryCustomization;

  // Architecture
  navigation: NavigationCustomization;
  contentDensity: ContentDensityCustomization;

  // Data
  dataVisualization: DataVisualizationCustomization;
  dashboard: DashboardCustomization;

  // Brand (Enterprise only)
  brand?: BrandCustomization;
}
```

**Tasks:**
- [ ] Refactor `useCustomization.tsx` hook
- [ ] Create `ThemeProvider` context wrapper
- [ ] Add `ThemeGenerator` utility functions
- [ ] Create `ColorPalette` component
- [ ] Add theme persistence to localStorage

---

### Phase 2: UI Components (Weeks 3-4)

**Create customization control components:**

```typescript
// Component hierarchy
<CustomizationHub>
  <ColorCustomizer />          // Color picker + presets
  <TypographyCustomizer />     // Font selection + sizing
  <SpacingCustomizer />        // Density + padding controls
  <MotionCustomizer />         // Animation speed + easing
  <AccessibilityPanel />       // A11y toggles
  <NavigationBuilder />        // Sidebar reordering
  <DashboardBuilder />         // Widget management
  <BrandCustomizer />          // Logo + domain (PREMIUM)
  <PreviewPanel />             // Live theme preview
  <ExportTheme />              // JSON export option
</CustomizationHub>
```

**New Settings.tsx layout:**
```
Settings
├─ Profile Tab
├─ Customization Tab  [NEW SECTION]
│  ├─ Colors
│  ├─ Typography
│  ├─ Spacing & Density
│  ├─ Motion & Animations
│  ├─ Accessibility
│  ├─ Navigation
│  ├─ Data Visualization
│  └─ Branding (if eligible)
├─ Notifications
└─ Billing
```

---

### Phase 3: Backend Persistence (Weeks 5-6)

**Database schema for theme storage:**

```prisma
model UserTheme {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id])

  // Theme data (JSON blob)
  themeData Json

  // Metadata
  name String @default("My Theme")
  isDefault Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SharedTheme {
  id String @id @default(cuid())
  creatorId String
  creator User @relation(fields: [creatorId], references: [id])

  name String
  description String?
  themeData Json

  isPublic Boolean @default(false)
  downloads Int @default(0)

  createdAt DateTime @default(now())
}
```

**API endpoints:**
```
POST   /api/themes                  - Save theme
GET    /api/themes                  - Get user's themes
GET    /api/themes/:id              - Get theme details
PUT    /api/themes/:id              - Update theme
DELETE /api/themes/:id              - Delete theme
POST   /api/themes/:id/duplicate    - Duplicate theme
GET    /api/themes/public/featured  - Featured public themes
POST   /api/themes/export           - Export as JSON
POST   /api/themes/import           - Import from JSON
```

---

### Phase 4: AI Theme Generation (Weeks 7-8)

**Using Gemini API to auto-generate themes:**

```typescript
// New function in geminiService.ts
async function generateThemeRecommendation(
  userProfile: UserProfile,
  preferences: {
    industry: string;        // e.g., "plumbing", "real estate"
    mood: string;            // e.g., "professional", "modern", "creative"
    targetAudience: string;  // e.g., "homeowners", "contractors"
  }
): Promise<ThemeSettings> {
  const prompt = `
You are a UI/UX expert. Generate a professional color scheme and theme settings
for a home services marketplace user.

Industry: ${preferences.industry}
Mood: ${preferences.mood}
Target Audience: ${preferences.targetAudience}

Return a JSON object with:
{
  "color": { primary: hex, secondary: hex, accent: hex, ... },
  "typography": { headingFont: string, bodyFont: string, ... },
  "spacing": { scale: "comfortable" | "spacious" | "compact", ... },
  "motion": { animationSpeed: 1.0, easing: "..." }
}
`;

  const response = await ai.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return JSON.parse(response.text()) as ThemeSettings;
}
```

**UI for theme generation:**
```
🤖 Let AI Create Your Theme
├─ Industry: [Plumbing ▼]
├─ Mood: [Professional ▼]
├─ Audience: [Homeowners ▼]
└─ [Generate Theme] button
   ↓ (shows preview)
   [Accept] [Regenerate] [Customize]
```

---

## PART III: TECHNICAL SPECIFICATIONS

### Database Schema Updates

**File:** `prisma/schema.prisma`

```prisma
// Existing User model - add field
model User {
  // ... existing fields
  theme UserTheme?
  customThemes UserTheme[]
  savedPublicThemes SharedTheme[]
}

// New tables
model UserTheme {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Colors
  colorCustomization Json?
  typographyCustomization Json?
  spacingCustomization Json?

  // Interactivity
  motionCustomization Json?
  microinteractionCustomization Json?

  // Accessibility
  accessibilityCustomization Json?
  sensoryCustomization Json?

  // Navigation
  navigationCustomization Json?
  contentDensityCustomization Json?

  // Data display
  dataVisualizationCustomization Json?
  dashboardCustomization Json?

  // Branding (enterprise)
  brandCustomization Json?

  // Metadata
  name String
  description String?
  isDefault Boolean @default(false)
  isPublic Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, isDefault])
}

model SharedTheme {
  id String @id @default(cuid())
  creatorId String
  creator User @relation(fields: [creatorId], references: [id], onDelete: Cascade)

  name String
  description String?

  // Full theme JSON
  fullTheme Json

  // Metadata
  industry String?  // e.g., "plumbing"
  mood String?      // e.g., "professional"

  isPublic Boolean @default(false)
  downloads Int @default(0)
  likes Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### React Implementation Pattern

**File:** `src/hooks/useCustomization.tsx` (REFACTORED)

```typescript
import React, { createContext, useState, useCallback } from 'react';
import type { ThemeSettings } from '../types';

interface CustomizationContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  saveTheme: (name: string) => Promise<void>;
  loadTheme: (id: string) => Promise<void>;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (json: string) => void;
}

export const CustomizationContext = createContext<CustomizationContextType | null>(null);

export function CustomizationProvider({ children }) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
    // Apply theme to DOM
    applyThemeToDOM(theme);
    // Persist to localStorage
    localStorage.setItem('userTheme', JSON.stringify(theme));
  }, [theme]);

  const saveTheme = useCallback(async (name: string) => {
    await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, themeData: theme })
    });
  }, [theme]);

  return (
    <CustomizationContext.Provider value={{ theme, updateTheme, saveTheme, ... }}>
      <ThemeRoot theme={theme}>
        {children}
      </ThemeRoot>
    </CustomizationContext.Provider>
  );
}

// Usage in components
export function useCustomization() {
  const context = React.useContext(CustomizationContext);
  if (!context) throw new Error('useCustomization must be used within CustomizationProvider');
  return context;
}
```

---

### CSS-in-JS Integration

**File:** `src/styles/themeToCSS.ts` (NEW)

```typescript
export function generateCSSVariables(theme: ThemeSettings): string {
  const colors = theme.color as ColorCustomization;
  const typography = theme.typography as TypographyCustomization;
  const spacing = theme.spacing as SpacingCustomization;
  const motion = theme.motion as MotionCustomization;

  return `
:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};

  /* Typography */
  --font-heading: ${typography.headingFont};
  --font-body: ${typography.bodyFont};
  --font-mono: ${typography.monoFont};
  --font-size-base: ${typography.baseFontSize}px;

  /* Spacing */
  --spacing-unit: ${spacing.baseUnit}px;
  --spacing-xs: ${spacing.gaps.xs}px;
  --spacing-sm: ${spacing.gaps.sm}px;
  --spacing-md: ${spacing.gaps.md}px;

  /* Motion */
  --duration-hover: ${motion.transitions.hover}ms;
  --easing-smooth: ${motion.easing.smooth};

  /* Accessibility */
  --prefers-reduced-motion: ${theme.accessibility.prefersReducedMotion ? 'reduce' : 'no-preference'};
}
  `;
}

// Apply to DOM
function applyThemeToDOM(theme: ThemeSettings) {
  const styleEl = document.getElementById('theme-root') || document.createElement('style');
  styleEl.id = 'theme-root';
  styleEl.textContent = generateCSSVariables(theme);
  document.head.appendChild(styleEl);
}
```

---

## PART IV: NEW SETTINGS UI MOCKUP

**File:** `components/SettingsCustomization.tsx` (NEW)

```
┌─ CUSTOMIZATION SETTINGS ─────────────────────────────┐
│                                                      │
│ [Color Scheme] [Typography] [Spacing] [Motion] [...] │
│                                                      │
│ ╔════ COLOR CUSTOMIZATION ═════════════════════╗    │
│ ║ Theme: [Dark Blue ▼] [Custom Picker]         ║    │
│ ║                                               ║    │
│ ║ Primary: [████████] #4F46E5 [Pick Color]      ║    │
│ ║ Secondary: [████████] #0891B2 [Pick Color]    ║    │
│ ║ Accent: [████████] #EC4899 [Pick Color]       ║    │
│ ║                                               ║    │
│ ║ [✓] High Contrast Mode                        ║    │
│ ║ [✓] Color Blind Mode: [Deuteranopia ▼]       ║    │
│ ║                                               ║    │
│ ║ [Preview] [Reset] [Save as New Theme]        ║    │
│ ╚═══════════════════════════════════════════════╝   │
│                                                      │
│ ╔════ TYPOGRAPHY ══════════════════════════════╗    │
│ ║ Heading Font: [Inter ▼]                      ║    │
│ ║ Body Font: [Poppins ▼]                       ║    │
│ ║ Monospace: [Fira Code ▼]                     ║    │
│ ║                                               ║    │
│ ║ Base Size: 16px [- 14 16 18 +]               ║    │
│ ║ Scale Ratio: [Golden (1.25) ▼]               ║    │
│ ║                                               ║    │
│ ║ Line Height: [Normal ▼] (1.5)                ║    │
│ ║ Letter Spacing: [Normal ▼] (0em)             ║    │
│ ╚═══════════════════════════════════════════════╝   │
│                                                      │
│ [Apply Changes] [Export Theme] [Load Theme]  [Help] │
└──────────────────────────────────────────────────────┘
```

---

## PART V: PREMIUM TIER GATING

**Pricing model for customization features:**

```typescript
// In Settings.tsx - visibility control
interface CustomizationFeatureGate {
  feature: string;
  requiredTier: UserTier;
  upsellMessage: string;
  isPremiumAddon: boolean;
  monthlyPrice?: number;
}

const FEATURE_GATES: Record<string, CustomizationFeatureGate> = {
  'color-picker': {
    requiredTier: 'PRO',
    upsellMessage: 'Custom colors available in PRO tier (+$100/mo)',
    isPremiumAddon: false
  },
  'font-upload': {
    requiredTier: 'ELITE',
    upsellMessage: 'Upload custom fonts in ELITE tier (+$350/mo)',
    isPremiumAddon: false
  },
  'theme-export': {
    requiredTier: 'PRO',
    upsellMessage: 'Export themes as JSON (+$10/mo addon)',
    isPremiumAddon: true,
    monthlyPrice: 10
  },
  'white-label': {
    requiredTier: 'BRANDED_ELITE',
    upsellMessage: 'White-label customization in BRANDED ELITE tier (+$500/mo)',
    isPremiumAddon: false
  }
};

// Usage in component
function ColorCustomizer() {
  const { user } = useAuth();
  const gate = FEATURE_GATES['color-picker'];

  if (!canAccessFeature(user.tier, gate.requiredTier)) {
    return <UpsellCard message={gate.upsellMessage} />;
  }

  return <ColorPickerUI />;
}
```

---

## PART VI: MIGRATION & ROLLOUT PLAN

### Week 1: Preparation
- [ ] Review & approve customization specs
- [ ] Set up feature flags in environment config
- [ ] Create database migration scripts

### Week 2-3: Development
- [ ] Refactor theme system in React
- [ ] Implement Phase 1 components (colors, typography)
- [ ] Add API endpoints for theme CRUD

### Week 4: Testing
- [ ] Unit tests for theme generation
- [ ] E2E tests for customization flow
- [ ] Browser compatibility testing

### Week 5: Soft Launch
- [ ] Release to 10% of users (feature flag)
- [ ] Monitor performance & bug reports
- [ ] Gather feedback via surveys

### Week 6: Full Launch
- [ ] Enable for all users
- [ ] Update help documentation
- [ ] Announce in release notes

### Week 7-8: Polish
- [ ] Add Phase 2-4 features based on feedback
- [ ] Implement AI theme generation
- [ ] Create tutorials & video guides

---

## CONCLUSION

This customization enhancement transforms FairTradeWorker from a **functional tool** into a **premium, adaptable platform** that serves contractors' diverse visual preferences and accessibility needs.

**Expected outcomes:**
- 8-12% improvement in user engagement (customization drives stickiness)
- 5-10% reduction in churn (invested users retain longer)
- +$1.8K-$3K revenue per enterprise customer
- 2-3 point NPS improvement

**Start date:** After security fixes (Phase 1) complete
**Estimated timeline:** 6-8 weeks to full release

---

**Document Status:** FINAL v1.0
**Next Update:** Post-launch feedback incorporation
**Owner:** Product & Engineering
