/**
 * CustomizationPanel Component
 *
 * Comprehensive UI for customizing all aspects of the application:
 * - Theme selection and custom color picker
 * - Layout options (sidebar, density, container)
 * - Typography (fonts, sizes, weights)
 * - Component styling (borders, shadows, styles)
 * - Animation controls
 * - Accessibility options
 * - Notification preferences
 * - Dashboard widget customization
 *
 * Features:
 * - Real-time preview
 * - Export/import settings
 * - Reset to defaults
 * - Keyboard navigation
 * - Dark mode support
 */

import React, { useState } from 'react'
import {
  useCustomization,
  PREDEFINED_THEMES,
  type CustomTheme,
  type CustomLayout,
  type CustomTypography,
  type CustomComponent,
  type CustomAnimation,
  type CustomAccessibility,
  type CustomNotifications,
} from '../hooks/useCustomization'
import { ChevronDown, Download, Upload, RotateCcw, Eye, EyeOff } from 'lucide-react'

interface TabConfig {
  id: string
  label: string
  icon?: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: 'theme', label: 'Theme' },
  { id: 'layout', label: 'Layout' },
  { id: 'typography', label: 'Typography' },
  { id: 'components', label: 'Components' },
  { id: 'animations', label: 'Animations' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'advanced', label: 'Advanced' },
]

const CustomizationPanel: React.FC = () => {
  const {
    settings,
    updateTheme,
    updateLayout,
    updateTypography,
    updateComponent,
    updateAnimation,
    updateAccessibility,
    updateNotifications,
    resetToDefaults,
    exportSettings,
    importSettings,
    exportAsCSS,
  } = useCustomization()

  const [activeTab, setActiveTab] = useState('theme')
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="customization-panel flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
        </div>

        <nav className="space-y-1 px-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 w-48 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <ExportImportButtons exportSettings={exportSettings} importSettings={importSettings} />
          <button
            onClick={resetToDefaults}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'theme' && (
            <ThemeSettings settings={settings} updateTheme={updateTheme} />
          )}
          {activeTab === 'layout' && (
            <LayoutSettings settings={settings} updateLayout={updateLayout} />
          )}
          {activeTab === 'typography' && (
            <TypographySettings settings={settings} updateTypography={updateTypography} />
          )}
          {activeTab === 'components' && (
            <ComponentSettings settings={settings} updateComponent={updateComponent} />
          )}
          {activeTab === 'animations' && (
            <AnimationSettings settings={settings} updateAnimation={updateAnimation} />
          )}
          {activeTab === 'accessibility' && (
            <AccessibilitySettings settings={settings} updateAccessibility={updateAccessibility} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings
              settings={settings}
              updateNotifications={updateNotifications}
            />
          )}
          {activeTab === 'advanced' && (
            <AdvancedSettings
              exportSettings={exportSettings}
              exportAsCSS={exportAsCSS}
              resetToDefaults={resetToDefaults}
            />
          )}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <EyeOff size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Preview Content */}
          <PreviewSection settings={settings} />
        </div>
      )}

      {!showPreview && (
        <button
          onClick={() => setShowPreview(true)}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        >
          <Eye size={20} />
        </button>
      )}
    </div>
  )
}

// Theme Settings Tab
const ThemeSettings: React.FC<{ settings: any; updateTheme: (theme: any) => void }> = ({
  settings,
  updateTheme,
}) => {
  const [customColor, setCustomColor] = useState(false)
  const [selectedColor, setSelectedColor] = useState('primary')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Color Themes</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(PREDEFINED_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => updateTheme(theme)}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme.id === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="font-medium text-gray-900 dark:text-white">{theme.name}</span>
              </div>
              <div className="flex gap-1">
                {Object.values(theme.colors)
                  .slice(0, 5)
                  .map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: color as string }}
                    />
                  ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Custom Colors</h4>
        <div className="space-y-3">
          {Object.keys(settings.theme.colors).map(colorKey => (
            <div key={colorKey} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {colorKey}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.theme.colors[colorKey]}
                  onChange={e => {
                    const newTheme = { ...settings.theme }
                    newTheme.colors[colorKey] = e.target.value
                    updateTheme(newTheme)
                  }}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {settings.theme.colors[colorKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Layout Settings Tab
const LayoutSettings: React.FC<{ settings: any; updateLayout: (layout: any) => void }> = ({
  settings,
  updateLayout,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Layout</h3>

      <SettingGroup label="Sidebar Position">
        <SelectInput
          value={settings.layout.sidebarPosition}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'hidden', label: 'Hidden' },
          ]}
          onChange={value => updateLayout({ sidebarPosition: value })}
        />
      </SettingGroup>

      <SettingGroup label="Density">
        <SelectInput
          value={settings.layout.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal', label: 'Normal' },
            { value: 'spacious', label: 'Spacious' },
          ]}
          onChange={value => updateLayout({ density: value })}
        />
      </SettingGroup>

      <SettingGroup label="Container Width">
        <SelectInput
          value={settings.layout.containerMaxWidth}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
            { value: 'xl', label: 'Extra Large' },
            { value: 'full', label: 'Full Width' },
          ]}
          onChange={value => updateLayout({ containerMaxWidth: value })}
        />
      </SettingGroup>

      <SettingGroup label="Grid Columns">
        <SelectInput
          value={settings.layout.gridColumns}
          options={[
            { value: '1', label: '1 Column' },
            { value: '2', label: '2 Columns' },
            { value: '3', label: '3 Columns' },
            { value: '4', label: '4 Columns' },
          ]}
          onChange={value => updateLayout({ gridColumns: parseInt(value) })}
        />
      </SettingGroup>

      <SettingGroup label="Sidebar Collapsed">
        <ToggleSwitch
          checked={settings.layout.sidebarCollapsed}
          onChange={value => updateLayout({ sidebarCollapsed: value })}
        />
      </SettingGroup>

      <SettingGroup label="Top Navigation">
        <ToggleSwitch
          checked={settings.layout.topNavVisible}
          onChange={value => updateLayout({ topNavVisible: value })}
        />
      </SettingGroup>
    </div>
  )
}

// Typography Settings Tab
const TypographySettings: React.FC<{
  settings: any
  updateTypography: (typography: any) => void
}> = ({ settings, updateTypography }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Typography</h3>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Font Families</h4>
        <div className="space-y-3">
          <SettingGroup label="Heading Font">
            <input
              type="text"
              value={settings.typography.fontFamily.heading}
              onChange={e =>
                updateTypography({
                  fontFamily: { ...settings.typography.fontFamily, heading: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Inter, sans-serif"
            />
          </SettingGroup>

          <SettingGroup label="Body Font">
            <input
              type="text"
              value={settings.typography.fontFamily.body}
              onChange={e =>
                updateTypography({
                  fontFamily: { ...settings.typography.fontFamily, body: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Inter, sans-serif"
            />
          </SettingGroup>

          <SettingGroup label="Mono Font">
            <input
              type="text"
              value={settings.typography.fontFamily.mono}
              onChange={e =>
                updateTypography({
                  fontFamily: { ...settings.typography.fontFamily, mono: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Menlo, monospace"
            />
          </SettingGroup>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Font Sizes</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(settings.typography.fontSize).map(([key, value]) => (
            <SettingGroup key={key} label={`${key} (${value}px)`}>
              <input
                type="range"
                min="10"
                max="40"
                value={value}
                onChange={e =>
                  updateTypography({
                    fontSize: {
                      ...settings.typography.fontSize,
                      [key]: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
            </SettingGroup>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component Settings Tab
const ComponentSettings: React.FC<{
  settings: any
  updateComponent: (component: any) => void
}> = ({ settings, updateComponent }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Component Styling</h3>

      <SettingGroup label="Border Radius">
        <SelectInput
          value={settings.component.borderRadius}
          options={[
            { value: 'none', label: 'None' },
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
            { value: 'full', label: 'Full' },
          ]}
          onChange={value => updateComponent({ borderRadius: value })}
        />
      </SettingGroup>

      <SettingGroup label="Border Width">
        <SelectInput
          value={settings.component.borderWidth}
          options={[
            { value: '1', label: '1px' },
            { value: '2', label: '2px' },
            { value: '4', label: '4px' },
          ]}
          onChange={value => updateComponent({ borderWidth: parseInt(value) })}
        />
      </SettingGroup>

      <SettingGroup label="Shadow Size">
        <SelectInput
          value={settings.component.shadowSize}
          options={[
            { value: 'none', label: 'None' },
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ]}
          onChange={value => updateComponent({ shadowSize: value })}
        />
      </SettingGroup>

      <SettingGroup label="Button Style">
        <SelectInput
          value={settings.component.buttonStyle}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' },
          ]}
          onChange={value => updateComponent({ buttonStyle: value })}
        />
      </SettingGroup>

      <SettingGroup label="Card Style">
        <SelectInput
          value={settings.component.cardStyle}
          options={[
            { value: 'elevated', label: 'Elevated' },
            { value: 'flat', label: 'Flat' },
            { value: 'bordered', label: 'Bordered' },
          ]}
          onChange={value => updateComponent({ cardStyle: value })}
        />
      </SettingGroup>

      <SettingGroup label="Input Style">
        <SelectInput
          value={settings.component.inputStyle}
          options={[
            { value: 'filled', label: 'Filled' },
            { value: 'outlined', label: 'Outlined' },
          ]}
          onChange={value => updateComponent({ inputStyle: value })}
        />
      </SettingGroup>
    </div>
  )
}

// Animation Settings Tab
const AnimationSettings: React.FC<{
  settings: any
  updateAnimation: (animation: any) => void
}> = ({ settings, updateAnimation }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Animations</h3>

      <SettingGroup label="Enable Animations">
        <ToggleSwitch
          checked={settings.animation.enabled}
          onChange={value => updateAnimation({ enabled: value })}
        />
      </SettingGroup>

      <SettingGroup label="Animation Speed">
        <SelectInput
          value={settings.animation.speed}
          options={[
            { value: '0.5', label: '0.5x (Slower)' },
            { value: '1', label: '1x (Normal)' },
            { value: '1.5', label: '1.5x (Faster)' },
            { value: '2', label: '2x (Much Faster)' },
          ]}
          onChange={value => updateAnimation({ speed: parseFloat(value) })}
        />
      </SettingGroup>

      <SettingGroup label="Animation Easing">
        <SelectInput
          value={settings.animation.easing}
          options={[
            { value: 'ease-in', label: 'Ease In' },
            { value: 'ease-out', label: 'Ease Out' },
            { value: 'ease-in-out', label: 'Ease In-Out' },
            { value: 'linear', label: 'Linear' },
          ]}
          onChange={value => updateAnimation({ easing: value })}
        />
      </SettingGroup>

      <SettingGroup label="Transition Duration (ms)">
        <input
          type="range"
          min="0"
          max="1000"
          value={settings.animation.transitionDuration}
          onChange={e => updateAnimation({ transitionDuration: parseInt(e.target.value) })}
          className="w-full"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">
          {settings.animation.transitionDuration}ms
        </span>
      </SettingGroup>

      <SettingGroup label="Hover Effects">
        <ToggleSwitch
          checked={settings.animation.hoverEffects}
          onChange={value => updateAnimation({ hoverEffects: value })}
        />
      </SettingGroup>
    </div>
  )
}

// Accessibility Settings Tab
const AccessibilitySettings: React.FC<{
  settings: any
  updateAccessibility: (accessibility: any) => void
}> = ({ settings, updateAccessibility }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Accessibility</h3>

      <SettingGroup label="High Contrast">
        <ToggleSwitch
          checked={settings.accessibility.highContrast}
          onChange={value => updateAccessibility({ highContrast: value })}
        />
      </SettingGroup>

      <SettingGroup label="Reduce Motion">
        <ToggleSwitch
          checked={settings.accessibility.reduceMotion}
          onChange={value => updateAccessibility({ reduceMotion: value })}
        />
      </SettingGroup>

      <SettingGroup label="Font Size">
        <SelectInput
          value={settings.accessibility.fontSize}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
            { value: 'xl', label: 'Extra Large' },
          ]}
          onChange={value => updateAccessibility({ fontSize: value })}
        />
      </SettingGroup>

      <SettingGroup label="Line Height">
        <SelectInput
          value={settings.accessibility.lineHeight}
          options={[
            { value: 'tight', label: 'Tight' },
            { value: 'normal', label: 'Normal' },
            { value: 'relaxed', label: 'Relaxed' },
          ]}
          onChange={value => updateAccessibility({ lineHeight: value })}
        />
      </SettingGroup>

      <SettingGroup label="Show Focus Outlines">
        <ToggleSwitch
          checked={settings.accessibility.showFocusOutlines}
          onChange={value => updateAccessibility({ showFocusOutlines: value })}
        />
      </SettingGroup>

      <SettingGroup label="Enable Captions">
        <ToggleSwitch
          checked={settings.accessibility.enableCaptions}
          onChange={value => updateAccessibility({ enableCaptions: value })}
        />
      </SettingGroup>

      <SettingGroup label="Language">
        <SelectInput
          value={settings.accessibility.language}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
            { value: 'zh', label: 'Chinese' },
          ]}
          onChange={value => updateAccessibility({ language: value })}
        />
      </SettingGroup>
    </div>
  )
}

// Notification Settings Tab
const NotificationSettings: React.FC<{
  settings: any
  updateNotifications: (notifications: any) => void
}> = ({ settings, updateNotifications }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>

      <SettingGroup label="Email Notifications">
        <ToggleSwitch
          checked={settings.notifications.enableEmail}
          onChange={value => updateNotifications({ enableEmail: value })}
        />
      </SettingGroup>

      <SettingGroup label="SMS Notifications">
        <ToggleSwitch
          checked={settings.notifications.enableSMS}
          onChange={value => updateNotifications({ enableSMS: value })}
        />
      </SettingGroup>

      <SettingGroup label="Push Notifications">
        <ToggleSwitch
          checked={settings.notifications.enablePush}
          onChange={value => updateNotifications({ enablePush: value })}
        />
      </SettingGroup>

      <SettingGroup label="In-App Notifications">
        <ToggleSwitch
          checked={settings.notifications.enableInApp}
          onChange={value => updateNotifications({ enableInApp: value })}
        />
      </SettingGroup>

      <SettingGroup label="Notification Frequency">
        <SelectInput
          value={settings.notifications.frequency}
          options={[
            { value: 'instant', label: 'Instant' },
            { value: 'daily', label: 'Daily Digest' },
            { value: 'weekly', label: 'Weekly Digest' },
            { value: 'never', label: 'Never' },
          ]}
          onChange={value => updateNotifications({ frequency: value })}
        />
      </SettingGroup>

      <SettingGroup label="Notification Priority">
        <SelectInput
          value={settings.notifications.priority}
          options={[
            { value: 'all', label: 'All Notifications' },
            { value: 'important', label: 'Important Only' },
            { value: 'critical', label: 'Critical Only' },
          ]}
          onChange={value => updateNotifications({ priority: value })}
        />
      </SettingGroup>

      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quiet Hours</h4>
        <div className="space-y-3">
          <SettingGroup label="Enable Quiet Hours">
            <ToggleSwitch
              checked={settings.notifications.quietHours.enabled}
              onChange={value =>
                updateNotifications({
                  quietHours: { ...settings.notifications.quietHours, enabled: value },
                })
              }
            />
          </SettingGroup>

          {settings.notifications.quietHours.enabled && (
            <>
              <SettingGroup label="Start Time">
                <input
                  type="time"
                  value={settings.notifications.quietHours.start}
                  onChange={e =>
                    updateNotifications({
                      quietHours: { ...settings.notifications.quietHours, start: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </SettingGroup>

              <SettingGroup label="End Time">
                <input
                  type="time"
                  value={settings.notifications.quietHours.end}
                  onChange={e =>
                    updateNotifications({
                      quietHours: { ...settings.notifications.quietHours, end: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                />
              </SettingGroup>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Advanced Settings Tab
const AdvancedSettings: React.FC<{
  exportSettings: () => string
  exportAsCSS: () => string
  resetToDefaults: () => void
}> = ({ exportSettings, exportAsCSS, resetToDefaults }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Advanced</h3>

      <ExportImportButtons exportSettings={exportSettings} importSettings={() => {}} />

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export as CSS</h4>
        <button
          onClick={() => {
            const css = exportAsCSS()
            const blob = new Blob([css], { type: 'text/css' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'customization.css'
            a.click()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          Download CSS
        </button>
      </div>

      <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Danger Zone</h4>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all customizations?')) {
              resetToDefaults()
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RotateCcw size={16} />
          Reset All Settings
        </button>
      </div>
    </div>
  )
}

// Preview Section
const PreviewSection: React.FC<{ settings: any }> = ({ settings }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Colors</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(settings.theme.colors)
            .slice(0, 6)
            .map(([key, color]) => (
              <div key={key} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded mb-1" style={{ backgroundColor: color as string }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{key}</span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Typography</h4>
        <div
          style={{
            fontFamily: settings.typography.fontFamily.heading,
            fontSize: settings.typography.fontSize.lg,
          }}
          className="p-2 bg-white dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
        >
          Heading Text
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Components</h4>
        <div
          style={{
            borderRadius: settings.component.borderRadius === 'full' ? '9999px' : settings.component.borderRadius,
          }}
          className="p-3 bg-blue-500 text-white rounded text-center text-sm"
        >
          Sample Button
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Layout</h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>Density: <span className="font-medium capitalize">{settings.layout.density}</span></p>
          <p>Sidebar: <span className="font-medium capitalize">{settings.layout.sidebarPosition}</span></p>
          <p>Columns: <span className="font-medium">{settings.layout.gridColumns}</span></p>
        </div>
      </div>
    </div>
  )
}

// Helper Components

const SettingGroup: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="flex-1 ml-4">{children}</div>
  </div>
)

const SelectInput: React.FC<{
  value: any
  options: Array<{ value: string | number; label: string }>
  onChange: (value: string) => void
}> = ({ value, options, onChange }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({
  checked,
  onChange,
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const ExportImportButtons: React.FC<{
  exportSettings: () => string
  importSettings: (json: string) => void
}> = ({ exportSettings, importSettings }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        onClick={() => {
          const json = exportSettings()
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `fairtradeworker-settings-${new Date().toISOString().split('T')[0]}.json`
          a.click()
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
      >
        <Download size={16} />
        Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
      >
        <Upload size={16} />
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = evt => {
              try {
                const json = evt.target?.result as string
                importSettings(json)
              } catch (error) {
                alert('Failed to import settings: ' + (error as Error).message)
              }
            }
            reader.readAsText(file)
          }
        }}
      />
    </>
  )
}

export default CustomizationPanel
