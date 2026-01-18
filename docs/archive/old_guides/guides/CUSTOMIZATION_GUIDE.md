# Customization Guide

**FairTradeWorker** offers extensive customization options to tailor the application to your preferences.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Theme Customization](#theme-customization)
3. [Layout Customization](#layout-customization)
4. [Typography Customization](#typography-customization)
5. [Component Styling](#component-styling)
6. [Animation Controls](#animation-controls)
7. [Accessibility Options](#accessibility-options)
8. [Notification Preferences](#notification-preferences)
9. [Dashboard Customization](#dashboard-customization)
10. [Advanced Options](#advanced-options)
11. [Import/Export Settings](#importexport-settings)
12. [Programmatic Usage](#programmatic-usage)

---

## Quick Start

### Access Customization Settings

```typescript
// Method 1: Via Settings Menu
User Menu → Settings → Customization

// Method 2: Via Keyboard Shortcut
Cmd+Shift+, (Mac)
Ctrl+Shift+, (Windows/Linux)
```

### Opening the Customization Panel

```tsx
import CustomizationPanel from '@/components/CustomizationPanel'

function SettingsPage() {
  return <CustomizationPanel />
}
```

### Using the Customization Hook

```typescript
import { useCustomization } from '@/hooks/useCustomization'

function MyComponent() {
  const { settings, updateTheme, updateLayout } = useCustomization()

  return (
    <div style={{ color: settings.theme.colors.primary }}>
      Content styled with current theme
    </div>
  )
}
```

---

## Theme Customization

### Predefined Themes

FairTradeWorker comes with 6 built-in themes:

1. **Light** - Clean, minimalist light theme
   - Primary: `#007AFF` (Blue)
   - Background: `#FFFFFF` (White)
   - Best for: Daytime, offices, bright environments

2. **Dark** - Eye-friendly dark theme
   - Primary: `#0A84FF` (Light Blue)
   - Background: `#1C1C1E` (Dark Gray)
   - Best for: Nighttime, reduced eye strain

3. **High Contrast** - WCAG AAA compliant
   - Primary: `#0000FF` (Pure Blue)
   - Background: `#FFFFFF` (Pure White)
   - Best for: Accessibility, vision impairment

4. **Blue Theme** - Professional blue palette
   - Primary: `#1E40AF` (Deep Blue)
   - Secondary: `#3B82F6` (Sky Blue)

5. **Purple Theme** - Creative purple palette
   - Primary: `#7C3AED` (Vibrant Purple)
   - Accent: `#EC4899` (Pink)

6. **Green Theme** - Nature-inspired green palette
   - Primary: `#059669` (Forest Green)
   - Secondary: `#10B981` (Emerald)

### Switching Themes

```typescript
import { useCustomization, PREDEFINED_THEMES } from '@/hooks/useCustomization'

function ThemeSwitcher() {
  const { settings, updateTheme } = useCustomization()

  return (
    <div>
      {Object.entries(PREDEFINED_THEMES).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => updateTheme(theme)}
          className={settings.theme.id === key ? 'active' : ''}
        >
          {theme.name}
        </button>
      ))}
    </div>
  )
}
```

### Custom Colors

Each theme has 10 customizable colors:

```typescript
interface ThemeColors {
  primary: string       // Main brand color
  secondary: string     // Secondary brand color
  accent: string        // Accent/highlight color
  background: string    // Page background
  text: string          // Primary text color
  border: string        // Border color
  success: string       // Success state (green)
  warning: string       // Warning state (orange)
  error: string         // Error state (red)
  info: string          // Info state (cyan)
}
```

### Creating Custom Theme

```typescript
import { useCustomization, type CustomTheme } from '@/hooks/useCustomization'

function CustomThemeCreator() {
  const { updateTheme } = useCustomization()

  const createCustomTheme = () => {
    const customTheme: CustomTheme = {
      id: 'my-brand-theme',
      name: 'My Brand',
      colors: {
        primary: '#FF6B35',      // Custom orange
        secondary: '#F7931E',    // Custom gold
        accent: '#004E89',       // Custom dark blue
        background: '#FFFFFF',
        text: '#333333',
        border: '#CCCCCC',
        success: '#06A77D',
        warning: '#F19F00',
        error: '#D62828',
        info: '#0071BC',
      },
      isDark: false,
    }

    updateTheme(customTheme)
  }

  return <button onClick={createCustomTheme}>Apply Custom Theme</button>
}
```

---

## Layout Customization

### Available Layout Options

```typescript
interface CustomLayout {
  sidebarPosition: 'left' | 'right' | 'hidden'
  sidebarCollapsed: boolean
  topNavVisible: boolean
  density: 'compact' | 'normal' | 'spacious'
  containerMaxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  gridColumns: 1 | 2 | 3 | 4
}
```

### Density Levels

1. **Compact**
   - Smaller padding
   - Condensed spacing
   - More items per screen
   - Use: Data-heavy views, mobile devices

2. **Normal** (Default)
   - Standard padding
   - Balanced spacing
   - Good readability
   - Use: General use

3. **Spacious**
   - Larger padding
   - Generous spacing
   - Fewer items per screen
   - Use: Accessibility, tablet devices

### Container Width

- **Small (sm)**: 640px - Narrow focused layout
- **Medium (md)**: 768px - Tablet-optimized
- **Large (lg)**: 1024px - Desktop standard
- **Extra Large (xl)**: 1280px - Wide displays
- **Full**: 100% - Full screen width

### Grid Customization

```typescript
import { useCustomization } from '@/hooks/useCustomization'

function ResponsiveGrid() {
  const { settings } = useCustomization()
  const { gridColumns } = settings.layout

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: settings.layout.density === 'compact' ? '8px' : '16px',
      }}
    >
      {/* Grid items */}
    </div>
  )
}
```

### Sidebar Management

```typescript
const { settings, updateLayout } = useCustomization()

// Hide sidebar
updateLayout({ sidebarPosition: 'hidden' })

// Collapse sidebar
updateLayout({ sidebarCollapsed: true })

// Move to right
updateLayout({ sidebarPosition: 'right' })
```

---

## Typography Customization

### Font Families

```typescript
interface TypographyFonts {
  heading: string  // For h1, h2, h3, etc
  body: string     // For paragraphs, body text
  mono: string     // For code, preformatted text
}
```

### Predefined Font Combinations

```typescript
// Modern & Clean
{
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'Menlo, Monaco, monospace'
}

// Serif & Professional
{
  heading: 'Georgia, serif',
  body: 'Georgia, serif',
  mono: 'Courier New, monospace'
}

// Modern Minimal
{
  heading: 'Helvetica Neue, sans-serif',
  body: 'Helvetica Neue, sans-serif',
  mono: 'SF Mono, Monaco, monospace'
}
```

### Font Sizes

Customize sizes for all text levels:

```typescript
interface FontSizes {
  xs: number    // Extra small (12px default)
  sm: number    // Small (14px)
  base: number  // Base (16px)
  lg: number    // Large (18px)
  xl: number    // Extra large (20px)
  '2xl': number // 24px
  '3xl': number // 30px
}
```

### Font Weights

```typescript
interface FontWeights {
  light: number     // 300
  normal: number    // 400
  semibold: number  // 600
  bold: number      // 700
}
```

### Line Heights

```typescript
interface LineHeights {
  tight: number    // 1.2 (compact lines)
  normal: number   // 1.5 (standard)
  relaxed: number  // 1.75 (spacious)
}
```

### Applying Typography

```typescript
import { useCustomization } from '@/hooks/useCustomization'

function StyledText() {
  const { settings } = useCustomization()
  const { fontFamily, fontSize, fontWeight, lineHeight } = settings.typography

  return (
    <h1
      style={{
        fontFamily: fontFamily.heading,
        fontSize: `${fontSize['2xl']}px`,
        fontWeight: fontWeight.bold,
        lineHeight: lineHeight.relaxed,
      }}
    >
      Customized Heading
    </h1>
  )
}
```

---

## Component Styling

### Border Radius

```typescript
type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'

// Mapping:
// none: 0px
// sm: 4px
// md: 8px
// lg: 12px
// full: 9999px (completely rounded)
```

### Border Width

```typescript
type BorderWidth = 1 | 2 | 4

// 1px: Thin, subtle borders
// 2px: Standard borders
// 4px: Bold, prominent borders
```

### Shadow Size

```typescript
type ShadowSize = 'none' | 'sm' | 'md' | 'lg'

// none: No shadow
// sm: Subtle shadow (small lifts)
// md: Medium shadow (standard depth)
// lg: Large shadow (prominent depth)
```

### Button Styles

```typescript
type ButtonStyle = 'solid' | 'outline' | 'ghost'

// solid: Filled background with text
// outline: Border with transparent background
// ghost: No border, text-only appearance
```

### Card Styles

```typescript
type CardStyle = 'elevated' | 'flat' | 'bordered'

// elevated: Shadow-based depth
// flat: No shadow, clean appearance
// bordered: Border-based definition
```

### Input Styles

```typescript
type InputStyle = 'filled' | 'outlined'

// filled: Background-filled inputs
// outlined: Border-only inputs
```

---

## Animation Controls

### Global Animation Settings

```typescript
interface AnimationSettings {
  enabled: boolean          // Enable/disable all animations
  speed: 0.5 | 1 | 1.5 | 2  // Animation speed multiplier
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  transitionDuration: number // Duration in milliseconds
  hoverEffects: boolean      // Show hover effects
}
```

### Animation Speed

- **0.5x**: Slower animations (better for motion sensitivity)
- **1x**: Normal speed (default)
- **1.5x**: Faster animations (for power users)
- **2x**: Very fast (minimal wait)

### Easing Functions

- **ease-in**: Slow start, fast end
- **ease-out**: Fast start, slow end
- **ease-in-out**: Slow start and end (smooth)
- **linear**: Constant speed throughout

### Using Custom Animations

```typescript
import { useCustomization } from '@/hooks/useCustomization'

function AnimatedComponent() {
  const { settings } = useCustomization()
  const { speed, transitionDuration, easing } = settings.animation

  return (
    <div
      style={{
        transition: `all ${transitionDuration * speed}ms ${easing}`,
        opacity: hovered ? 1 : 0.7,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Hover me!
    </div>
  )
}
```

---

## Accessibility Options

### High Contrast Mode

Increases color contrast to WCAG AAA standards:

```typescript
updateAccessibility({ highContrast: true })

// Benefits:
// - Better visibility for low vision users
// - Reduced eye strain in bright environments
// - Improved text readability
```

### Reduce Motion

Respects `prefers-reduced-motion` and disables animations:

```typescript
updateAccessibility({ reduceMotion: true })

// Disables:
// - Transitions
// - Animations
// - Hover effects
// Benefits vestibular issues and motion sensitivity
```

### Font Size Options

```typescript
interface AccessibilityFontSize {
  sm: 'Small'
  md: 'Medium' (default)
  lg: 'Large'
  xl: 'Extra Large'
}

updateAccessibility({ fontSize: 'lg' })
```

### Line Height Options

```typescript
updateAccessibility({ lineHeight: 'relaxed' })

// tight: 1.2 (compact)
// normal: 1.5 (standard)
// relaxed: 1.75 (spacious, better readability)
```

### Focus Outlines

Shows visible focus indicators for keyboard navigation:

```typescript
updateAccessibility({ showFocusOutlines: true })
```

### Captions

Enables video/audio captions:

```typescript
updateAccessibility({ enableCaptions: true })
```

### Language/Localization

```typescript
updateAccessibility({ language: 'es' })

// Supported: en, es, fr, de, ja, zh
```

---

## Notification Preferences

### Channel Control

```typescript
interface NotificationChannels {
  enableEmail: boolean  // Email notifications
  enableSMS: boolean    // SMS text notifications
  enablePush: boolean   // Push notifications
  enableInApp: boolean  // In-app notifications
}
```

### Notification Frequency

```typescript
type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never'

// instant: Immediate notifications
// daily: Once per day digest
// weekly: Once per week digest
// never: Disable notifications
```

### Priority Filtering

```typescript
type NotificationPriority = 'all' | 'important' | 'critical'

// all: Receive all notifications
// important: Only important and above
// critical: Only critical alerts
```

### Quiet Hours

```typescript
interface QuietHours {
  enabled: boolean
  start: string      // HH:MM format, e.g., "22:00"
  end: string        // HH:MM format, e.g., "08:00"
  timezone: string   // e.g., "America/New_York"
}

updateNotifications({
  quietHours: {
    enabled: true,
    start: '22:00',  // 10 PM
    end: '08:00',    // 8 AM
    timezone: 'UTC'
  }
})
```

---

## Dashboard Customization

### Widget Management

```typescript
interface DashboardWidget {
  id: string           // Unique identifier
  name: string         // Display name
  enabled: boolean     // Show/hide widget
  position: number     // Order on dashboard
  size: 'sm' | 'md' | 'lg'
}
```

### View Options

```typescript
// Default view type
defaultView: 'grid' | 'list'

// Items per page
itemsPerPage: 10 | 20 | 50 | 100

// Sort by
sortBy: 'date' | 'name' | 'status'
```

### Filter Presets

```typescript
interface FilterPreset {
  id: string
  name: string
  filters: Record<string, any>
}

// Example: Save a custom filter
{
  id: 'my-active-jobs',
  name: 'My Active Jobs',
  filters: {
    status: 'ACTIVE',
    assignedTo: 'me',
    dueDate: { from: today, to: nextWeek }
  }
}
```

---

## Advanced Options

### Import/Export Settings

#### Export Settings as JSON

```typescript
import { useCustomization } from '@/hooks/useCustomization'

function ExportButton() {
  const { exportSettings } = useCustomization()

  const handleExport = () => {
    const json = exportSettings()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings-${new Date().toISOString()}.json`
    a.click()
  }

  return <button onClick={handleExport}>Export Settings</button>
}
```

#### Import Settings from JSON

```typescript
function ImportButton() {
  const { importSettings } = useCustomization()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const json = evt.target?.result as string
          importSettings(json)
          alert('Settings imported successfully!')
        } catch (error) {
          alert('Failed to import settings: ' + (error as Error).message)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <button onClick={() => fileInputRef.current?.click()}>
        Import Settings
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </>
  )
}
```

#### Export as CSS

```typescript
function ExportCSSButton() {
  const { exportAsCSS } = useCustomization()

  const handleExport = () => {
    const css = exportAsCSS()
    const blob = new Blob([css], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customization.css'
    a.click()
  }

  return <button onClick={handleExport}>Export as CSS</button>
}
```

### Settings Storage

Settings are automatically saved to `localStorage`:

```javascript
// Manually access stored settings
const stored = localStorage.getItem('fairtradeworker-customization')
const settings = JSON.parse(stored)
console.log(settings)
```

### Reset to Defaults

```typescript
const { resetToDefaults } = useCustomization()

// Requires confirmation
if (confirm('Reset all customizations?')) {
  resetToDefaults()
}
```

---

## Programmatic Usage

### Creating Custom Hooks

```typescript
import { useCustomization } from '@/hooks/useCustomization'

export const useThemeColor = (colorKey: keyof CustomTheme['colors']) => {
  const { settings } = useCustomization()
  return settings.theme.colors[colorKey]
}

// Usage:
function MyComponent() {
  const primaryColor = useThemeColor('primary')
  return <div style={{ color: primaryColor }}>Colored text</div>
}
```

### Theming with Tailwind

```tsx
// Using CSS variables set by customization hook
function TailwindComponent() {
  const { settings } = useCustomization()

  return (
    <div style={{'--color-primary': settings.theme.colors.primary}}>
      <button className="bg-[var(--color-primary)]">
        Themed Button
      </button>
    </div>
  )
}
```

### Dark Mode Detection

```typescript
export const useIsDarkMode = () => {
  const { settings } = useCustomization()
  return settings.theme.isDark
}

function ResponsiveComponent() {
  const isDark = useIsDarkMode()
  return (
    <div className={isDark ? 'dark' : 'light'}>
      Responsive to dark mode
    </div>
  )
}
```

### Responsive to Accessibility Settings

```typescript
export const useAccessibleFontSize = () => {
  const { settings } = useCustomization()
  const { fontSize } = settings.accessibility

  const multiplier = {
    sm: 0.875,
    md: 1,
    lg: 1.125,
    xl: 1.25,
  }

  return {
    h1: 2.25 * multiplier[fontSize],
    h2: 1.875 * multiplier[fontSize],
    body: 1 * multiplier[fontSize],
  }
}
```

---

## Best Practices

### For Users

1. **Start with a Predefined Theme**
   - Choose a theme that matches your preference
   - Customize specific colors if needed

2. **Adjust Density for Your Workflow**
   - Use "compact" for data-heavy tasks
   - Use "spacious" for accessibility

3. **Enable Quiet Hours**
   - Prevent notifications during sleep
   - Focus time without distractions

4. **Use High Contrast for Accessibility**
   - Improves readability
   - Reduces eye strain

5. **Export Settings Regularly**
   - Back up your customizations
   - Transfer settings between devices

### For Developers

1. **Always Use the Hook**
   ```typescript
   import { useCustomization } from '@/hooks/useCustomization'
   const { settings } = useCustomization()
   ```

2. **Respect Accessibility Settings**
   ```typescript
   if (settings.accessibility.reduceMotion) {
     // Use instant transitions instead
   }
   ```

3. **Use CSS Variables**
   ```css
   .component {
     color: var(--color-text);
     background: var(--color-background);
   }
   ```

4. **Create Reusable Theme Utilities**
   ```typescript
   export const useThemeColor = (key: string) => {
     const { settings } = useCustomization()
     return settings.theme.colors[key]
   }
   ```

5. **Persist Important States**
   - Customization automatically saves
   - No additional action needed

---

## Troubleshooting

### Settings Not Persisting

**Check localStorage**
```javascript
// In browser console
localStorage.getItem('fairtradeworker-customization')
```

**Clear and reset**
```javascript
localStorage.removeItem('fairtradeworker-customization')
// Reload page - defaults will be used
```

### Colors Not Applying

1. Ensure CSS variables are injected
2. Check for `!important` declarations overriding
3. Verify color format (use hex codes)
4. Clear browser cache

### Animation Issues

```typescript
// Reduce motion takes precedence
if (settings.accessibility.reduceMotion) {
  return 'all 0ms ease-in-out' // No animation
}
```

### Import Fails

1. Ensure JSON is valid
2. Check file format (must be `.json`)
3. Settings must match `CustomizationSettings` interface
4. Try exporting from same app first

---

## Summary

**FairTradeWorker Customization Offers:**

✅ 6 predefined themes
✅ Custom color picker
✅ 3 density levels
✅ Font customization (family, size, weight)
✅ Component styling options
✅ Animation speed controls
✅ Accessibility features (high contrast, reduce motion, font size)
✅ Notification frequency & channel control
✅ Dashboard widget customization
✅ Import/export settings
✅ Dark mode support
✅ Auto-save to localStorage
✅ CSS export capability
✅ Programmatic hook API

**Create your perfect workspace!** 🎨

---

Last Updated: January 4, 2026
