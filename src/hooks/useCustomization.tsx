/**
 * Custom Hook: useCustomization
 *
 * Comprehensive customization management for themes, layouts, components,
 * typography, animations, and accessibility settings
 *
 * Features:
 * - Multiple theme options (light, dark, high-contrast, custom)
 * - Layout customization (sidebar position, density, mode)
 * - Component styling (colors, borders, shadows)
 * - Typography options (font families, sizes, weights)
 * - Animation controls (speed, easing, enable/disable)
 * - Dark mode persistence
 * - Export/import settings
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react'

// Type definitions for customization
export interface CustomTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
    success: string
    warning: string
    error: string
    info: string
  }
  isDark: boolean
}

export interface CustomLayout {
  sidebarPosition: 'left' | 'right' | 'hidden'
  sidebarCollapsed: boolean
  topNavVisible: boolean
  density: 'compact' | 'normal' | 'spacious'
  containerMaxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  gridColumns: 1 | 2 | 3 | 4
}

export interface CustomTypography {
  fontFamily: {
    heading: string
    body: string
    mono: string
  }
  fontSize: {
    xs: number
    sm: number
    base: number
    lg: number
    xl: number
    '2xl': number
    '3xl': number
  }
  fontWeight: {
    light: number
    normal: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

export interface CustomComponent {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  borderWidth: 1 | 2 | 4
  shadowSize: 'none' | 'sm' | 'md' | 'lg'
  buttonStyle: 'solid' | 'outline' | 'ghost'
  cardStyle: 'elevated' | 'flat' | 'bordered'
  inputStyle: 'filled' | 'outlined'
}

export interface CustomAnimation {
  speed: 0.5 | 1 | 1.5 | 2 // Multiplier
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  enabled: boolean
  transitionDuration: number // ms
  hoverEffects: boolean
}

export interface CustomAccessibility {
  highContrast: boolean
  reduceMotion: boolean
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  lineHeight: 'tight' | 'normal' | 'relaxed'
  showFocusOutlines: boolean
  enableCaptions: boolean
  language: string
}

export interface CustomNotifications {
  enableEmail: boolean
  enableSMS: boolean
  enablePush: boolean
  enableInApp: boolean
  frequency: 'instant' | 'daily' | 'weekly' | 'never'
  quietHours: {
    enabled: boolean
    start: string // HH:MM
    end: string // HH:MM
    timezone: string
  }
  priority: 'all' | 'important' | 'critical'
}

export interface CustomDashboard {
  widgets: Array<{
    id: string
    name: string
    enabled: boolean
    position: number
    size: 'sm' | 'md' | 'lg'
  }>
  defaultView: 'grid' | 'list'
  itemsPerPage: 10 | 20 | 50 | 100
  sortBy: 'date' | 'name' | 'status'
  filterPresets: Array<{
    id: string
    name: string
    filters: Record<string, any>
  }>
}

export interface CustomizationSettings {
  theme: CustomTheme
  layout: CustomLayout
  typography: CustomTypography
  component: CustomComponent
  animation: CustomAnimation
  accessibility: CustomAccessibility
  notifications: CustomNotifications
  dashboard: CustomDashboard
  lastUpdated: string
  version: string
}

// Default settings
const DEFAULT_THEME: CustomTheme = {
  id: 'light',
  name: 'Light',
  colors: {
    primary: '#007AFF',
    secondary: '#5AC8FA',
    accent: '#FF2D55',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#00C7BE',
  },
  isDark: false,
}

const DEFAULT_DARK_THEME: CustomTheme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    primary: '#0A84FF',
    secondary: '#30B0C7',
    accent: '#FF375F',
    background: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    success: '#32D74B',
    warning: '#FF9500',
    error: '#FF453A',
    info: '#00D9D9',
  },
  isDark: true,
}

const DEFAULT_HIGH_CONTRAST_THEME: CustomTheme = {
  id: 'high-contrast',
  name: 'High Contrast',
  colors: {
    primary: '#0000FF',
    secondary: '#FFFF00',
    accent: '#FF0000',
    background: '#FFFFFF',
    text: '#000000',
    border: '#000000',
    success: '#008000',
    warning: '#FF8C00',
    error: '#FF0000',
    info: '#0000FF',
  },
  isDark: false,
}

const DEFAULT_LAYOUT: CustomLayout = {
  sidebarPosition: 'left',
  sidebarCollapsed: false,
  topNavVisible: true,
  density: 'normal',
  containerMaxWidth: 'lg',
  gridColumns: 3,
}

const DEFAULT_TYPOGRAPHY: CustomTypography = {
  fontFamily: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, Monaco, monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    light: 300,
    normal: 400,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

const DEFAULT_COMPONENT: CustomComponent = {
  borderRadius: 'md',
  borderWidth: 1,
  shadowSize: 'md',
  buttonStyle: 'solid',
  cardStyle: 'elevated',
  inputStyle: 'outlined',
}

const DEFAULT_ANIMATION: CustomAnimation = {
  speed: 1,
  easing: 'ease-in-out',
  enabled: true,
  transitionDuration: 200,
  hoverEffects: true,
}

const DEFAULT_ACCESSIBILITY: CustomAccessibility = {
  highContrast: false,
  reduceMotion: false,
  fontSize: 'md',
  lineHeight: 'normal',
  showFocusOutlines: false,
  enableCaptions: false,
  language: 'en',
}

const DEFAULT_NOTIFICATIONS: CustomNotifications = {
  enableEmail: true,
  enableSMS: true,
  enablePush: true,
  enableInApp: true,
  frequency: 'instant',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC',
  },
  priority: 'all',
}

const DEFAULT_DASHBOARD: CustomDashboard = {
  widgets: [],
  defaultView: 'grid',
  itemsPerPage: 20,
  sortBy: 'date',
  filterPresets: [],
}

const DEFAULT_SETTINGS: CustomizationSettings = {
  theme: DEFAULT_THEME,
  layout: DEFAULT_LAYOUT,
  typography: DEFAULT_TYPOGRAPHY,
  component: DEFAULT_COMPONENT,
  animation: DEFAULT_ANIMATION,
  accessibility: DEFAULT_ACCESSIBILITY,
  notifications: DEFAULT_NOTIFICATIONS,
  dashboard: DEFAULT_DASHBOARD,
  lastUpdated: new Date().toISOString(),
  version: '1.0',
}

// Predefined themes
export const PREDEFINED_THEMES: Record<string, CustomTheme> = {
  light: DEFAULT_THEME,
  dark: DEFAULT_DARK_THEME,
  'high-contrast': DEFAULT_HIGH_CONTRAST_THEME,
  'blue-theme': {
    id: 'blue-theme',
    name: 'Blue',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#06B6D4',
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
    isDark: false,
  },
  'purple-theme': {
    id: 'purple-theme',
    name: 'Purple',
    colors: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      accent: '#EC4899',
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
    isDark: false,
  },
  'green-theme': {
    id: 'green-theme',
    name: 'Green',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#14B8A6',
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
    isDark: false,
  },
}

// Context type
interface CustomizationContextType {
  settings: CustomizationSettings
  updateTheme: (theme: CustomTheme | string) => void
  updateLayout: (layout: Partial<CustomLayout>) => void
  updateTypography: (typography: Partial<CustomTypography>) => void
  updateComponent: (component: Partial<CustomComponent>) => void
  updateAnimation: (animation: Partial<CustomAnimation>) => void
  updateAccessibility: (accessibility: Partial<CustomAccessibility>) => void
  updateNotifications: (notifications: Partial<CustomNotifications>) => void
  updateDashboard: (dashboard: Partial<CustomDashboard>) => void
  resetToDefaults: () => void
  exportSettings: () => string
  importSettings: (json: string) => void
  exportAsCSS: () => string
}

// Create context
export const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined)

// Custom hook
export const useCustomization = (): CustomizationContextType => {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('fairtradeworker-customization')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load customization settings:', error)
    }
    return DEFAULT_SETTINGS
  })

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(
        'fairtradeworker-customization',
        JSON.stringify({ ...settings, lastUpdated: new Date().toISOString() })
      )

      // Apply theme to document
      applyThemeToDOM(settings.theme)
    } catch (error) {
      console.error('Failed to save customization settings:', error)
    }
  }, [settings])

  const updateTheme = useCallback((theme: CustomTheme | string) => {
    setSettings(prev => ({
      ...prev,
      theme: typeof theme === 'string' ? PREDEFINED_THEMES[theme] || DEFAULT_THEME : theme,
    }))
  }, [])

  const updateLayout = useCallback((layout: Partial<CustomLayout>) => {
    setSettings(prev => ({
      ...prev,
      layout: { ...prev.layout, ...layout },
    }))
  }, [])

  const updateTypography = useCallback((typography: Partial<CustomTypography>) => {
    setSettings(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        ...typography,
        fontFamily: { ...prev.typography.fontFamily, ...typography.fontFamily },
        fontSize: { ...prev.typography.fontSize, ...typography.fontSize },
        fontWeight: { ...prev.typography.fontWeight, ...typography.fontWeight },
        lineHeight: { ...prev.typography.lineHeight, ...typography.lineHeight },
      },
    }))
  }, [])

  const updateComponent = useCallback((component: Partial<CustomComponent>) => {
    setSettings(prev => ({
      ...prev,
      component: { ...prev.component, ...component },
    }))
  }, [])

  const updateAnimation = useCallback((animation: Partial<CustomAnimation>) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, ...animation },
    }))
  }, [])

  const updateAccessibility = useCallback((accessibility: Partial<CustomAccessibility>) => {
    setSettings(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...accessibility },
    }))
  }, [])

  const updateNotifications = useCallback((notifications: Partial<CustomNotifications>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }))
  }, [])

  const updateDashboard = useCallback((dashboard: Partial<CustomDashboard>) => {
    setSettings(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, ...dashboard },
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2)
  }, [settings])

  const importSettings = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json) as CustomizationSettings
      setSettings(imported)
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw new Error('Invalid settings format')
    }
  }, [])

  const exportAsCSS = useCallback(() => {
    const { theme, typography, component, animation } = settings

    return `
/* Generated by FairTradeWorker Customization */

:root {
  /* Colors */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --color-border: ${theme.colors.border};
  --color-success: ${theme.colors.success};
  --color-warning: ${theme.colors.warning};
  --color-error: ${theme.colors.error};
  --color-info: ${theme.colors.info};

  /* Typography */
  --font-heading: ${typography.fontFamily.heading};
  --font-body: ${typography.fontFamily.body};
  --font-mono: ${typography.fontFamily.mono};

  --font-size-xs: ${typography.fontSize.xs}px;
  --font-size-sm: ${typography.fontSize.sm}px;
  --font-size-base: ${typography.fontSize.base}px;
  --font-size-lg: ${typography.fontSize.lg}px;
  --font-size-xl: ${typography.fontSize.xl}px;
  --font-size-2xl: ${typography.fontSize['2xl']}px;
  --font-size-3xl: ${typography.fontSize['3xl']}px;

  --font-weight-light: ${typography.fontWeight.light};
  --font-weight-normal: ${typography.fontWeight.normal};
  --font-weight-semibold: ${typography.fontWeight.semibold};
  --font-weight-bold: ${typography.fontWeight.bold};

  --line-height-tight: ${typography.lineHeight.tight};
  --line-height-normal: ${typography.lineHeight.normal};
  --line-height-relaxed: ${typography.lineHeight.relaxed};

  /* Component */
  --border-radius: ${component.borderRadius === 'none' ? '0' : component.borderRadius === 'sm' ? '4px' : component.borderRadius === 'md' ? '8px' : component.borderRadius === 'lg' ? '12px' : '9999px'};
  --border-width: ${component.borderWidth}px;
  --shadow-size: ${component.shadowSize === 'none' ? '0' : component.shadowSize === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' : component.shadowSize === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 10px 15px rgba(0,0,0,0.1)'};

  /* Animation */
  --transition-duration: ${animation.transitionDuration}ms;
  --animation-speed: ${animation.speed};
  --animation-easing: ${animation.easing};
}
    `.trim()
  }, [settings])

  return {
    settings,
    updateTheme,
    updateLayout,
    updateTypography,
    updateComponent,
    updateAnimation,
    updateAccessibility,
    updateNotifications,
    updateDashboard,
    resetToDefaults,
    exportSettings,
    importSettings,
    exportAsCSS,
  }
}

// Helper function to apply theme to DOM
function applyThemeToDOM(theme: CustomTheme) {
  const root = document.documentElement

  // Set CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })

  // Add dark class if needed
  if (theme.isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Provider component
export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const customization = useCustomization()

  return (
    <CustomizationContext.Provider value={customization}>
      {children}
    </CustomizationContext.Provider>
  )
}

// Hook to use customization from context
export const useCustomizationContext = () => {
  const context = useContext(CustomizationContext)
  if (!context) {
    throw new Error('useCustomizationContext must be used within CustomizationProvider')
  }
  return context
}
