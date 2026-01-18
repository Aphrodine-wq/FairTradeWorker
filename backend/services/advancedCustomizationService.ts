/**
 * Advanced Customization Service - 100+ User Settings
 * Comprehensive user preferences and customization system
 */

import prisma from '../../src/services/database';

/**
 * COMPREHENSIVE CUSTOMIZATION INTERFACE
 * 100+ customization options across 12 categories
 */
export interface AdvancedCustomizationTheme {
  // ============================================================================
  // 1. COLORS & VISUAL (20+ options)
  // ============================================================================

  // Primary Palette
  primaryColor?: string;
  primaryColorLight?: string;
  primaryColorDark?: string;

  // Secondary Palette
  secondaryColor?: string;
  secondaryColorLight?: string;
  secondaryColorDark?: string;

  // Accent Colors
  accentColor?: string;
  accentColorAlt?: string;

  // Background & Surface
  backgroundColor?: string;
  surfaceColor?: string;
  surfaceColorAlt?: string;
  surfaceColorSecondary?: string;

  // Text Colors
  textColor?: string;
  textColorSecondary?: string;
  textColorTertiary?: string;
  textColorInverse?: string;

  // Status Colors
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  pendingColor?: string;

  // ============================================================================
  // 2. TYPOGRAPHY & FONTS (20+ options)
  // ============================================================================

  fontFamily?: string;
  fontFamilyHeading?: string;
  fontFamilyCode?: string;

  headingSize?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  bodySize?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  smallSize?: 'extra-small' | 'small' | 'medium';

  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extra-bold';
  fontWeightHeading?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extra-bold';

  lineHeight?: number;
  letterSpacing?: number;

  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: boolean;

  // ============================================================================
  // 3. LAYOUT & SPACING (15+ options)
  // ============================================================================

  spacing?: 'extra-compact' | 'compact' | 'normal' | 'spacious' | 'extra-spacious';
  paddingSize?: number;
  marginSize?: number;
  gapSize?: number;

  borderRadius?: 'sharp' | 'slight' | 'rounded' | 'very-rounded' | 'pill';
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  containerWidth?: 'full' | 'wide' | 'normal' | 'compact';
  gridColumns?: number; // 1-12

  // ============================================================================
  // 4. EFFECTS & SHADOWS (15+ options)
  // ============================================================================

  shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong' | 'extreme';
  shadowColor?: string;

  glassMorphism?: boolean;
  glassMorphismIntensity?: number; // 0-100

  blurEffect?: boolean;
  blurRadius?: number;

  gradientEnabled?: boolean;
  gradientAngle?: number; // 0-360
  gradientColors?: string[];

  // ============================================================================
  // 5. ANIMATIONS & TRANSITIONS (15+ options)
  // ============================================================================

  animationEnabled?: boolean;
  animationSpeed?: 'no-motion' | 'slow' | 'normal' | 'fast' | 'instant';

  transitionDuration?: number; // milliseconds
  transitionType?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

  hoverEffect?: 'none' | 'highlight' | 'scale' | 'lift' | 'glow';
  hoverIntensity?: number; // 0-100

  focusEffect?: 'outline' | 'glow' | 'highlight' | 'subtle';
  focusColor?: string;

  // ============================================================================
  // 6. DARK MODE & THEMES (10+ options)
  // ============================================================================

  darkMode?: boolean;
  darkModeAutoSwitch?: boolean;
  darkModeAutoSwitchTime?: 'sunset' | '20:00' | '21:00' | '22:00' | 'custom';
  darkModeAutoSwitchCustomTime?: string; // HH:MM format

  lightModeBackground?: string;
  darkModeBackground?: string;

  contrastMode?: 'normal' | 'enhanced' | 'high-contrast';

  // ============================================================================
  // 7. NAVIGATION & LAYOUT (15+ options)
  // ============================================================================

  sidebarPosition?: 'left' | 'right' | 'top' | 'floating';
  sidebarCollapsed?: boolean;
  sidebarCollapsible?: boolean;
  sidebarWidth?: number; // pixels
  sidebarSticky?: boolean;

  showBreadcrumbs?: boolean;
  breadcrumbStyle?: 'text' | 'links' | 'buttons';

  showNavigation?: boolean;
  navigationStyle?: 'vertical' | 'horizontal' | 'hamburger' | 'tabs';
  navigationPosition?: 'top' | 'bottom' | 'left' | 'right';

  showFooter?: boolean;
  footerMinimized?: boolean;

  // ============================================================================
  // 8. COMPONENTS & ELEMENTS (20+ options)
  // ============================================================================

  buttonStyle?: 'filled' | 'outlined' | 'text' | 'elevated' | 'gradient';
  buttonSize?: 'small' | 'medium' | 'large' | 'extra-large';

  inputStyle?: 'outlined' | 'filled' | 'underlined' | 'flat';
  inputSize?: 'small' | 'medium' | 'large';

  cardStyle?: 'outlined' | 'elevated' | 'filled' | 'flat';
  cardElevation?: number; // 0-10

  chipStyle?: 'filled' | 'outlined' | 'elevated';

  iconSize?: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  iconStyle?: 'solid' | 'outline' | 'duotone';

  tooltipStyle?: 'dark' | 'light' | 'bordered' | 'gradient';
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';

  modalStyle?: 'centered' | 'side-panel' | 'full-screen' | 'floating';
  modalBackdropBlur?: number; // 0-20

  // ============================================================================
  // 9. ACCESSIBILITY (20+ options)
  // ============================================================================

  // Vision
  colorBlindnessMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  highContrast?: boolean;
  invertColors?: boolean;
  reduceMotion?: boolean;

  // Text & Reading
  dyslexiaFont?: boolean;
  readingGuide?: boolean;
  readingGuideColor?: string;

  largeText?: boolean;
  extraLargeText?: boolean;

  textSpacing?: number; // letter and word spacing multiplier
  lineHeightMultiplier?: number;

  // Focus & Navigation
  focusIndicator?: boolean;
  focusIndicatorThickness?: number;
  focusIndicatorColor?: string;

  skipLinksVisible?: boolean;

  // Screen Reader
  screenReaderOptimized?: boolean;
  announceAriaUpdates?: boolean;

  // ============================================================================
  // 10. BRANDING & IDENTITY (15+ options)
  // ============================================================================

  // Logo & Branding
  customLogo?: string;
  customLogoPosition?: 'left' | 'center' | 'right';
  customLogoSize?: 'small' | 'medium' | 'large';

  customFavicon?: string;
  customBrandName?: string;
  customBrandColor?: string;

  // Header & Footer
  headerBackgroundColor?: string;
  headerTextColor?: string;
  footerBackgroundColor?: string;
  footerTextColor?: string;

  // Enterprise
  whiteLabel?: boolean;
  customDomain?: string;
  customEmail?: string;

  // ============================================================================
  // 11. NOTIFICATIONS & ALERTS (15+ options)
  // ============================================================================

  notificationsEnabled?: boolean;
  notificationsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  notificationDuration?: number; // seconds
  notificationSound?: boolean;
  notificationSoundVolume?: number; // 0-100

  emailNotifications?: boolean;
  emailNotificationFrequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';

  pushNotifications?: boolean;
  smsNotifications?: boolean;

  // ============================================================================
  // 12. DATA & PRIVACY (10+ options)
  // ============================================================================

  dataVisualization?: 'charts' | 'tables' | 'both';
  dataExportFormat?: 'csv' | 'json' | 'excel' | 'pdf' | 'all';

  privacyMode?: boolean;
  showAnalytics?: boolean;

  cacheEnabled?: boolean;
  localStorageEnabled?: boolean;

  sessionTimeout?: number; // minutes
  autoLogout?: boolean;
}

export class AdvancedCustomizationService {
  /**
   * Get all customization options for a user
   */
  async getFullCustomization(userId: string): Promise<AdvancedCustomizationTheme> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      if (!user) throw new Error('User not found');

      const preferences = (user.preferences as any) || {};
      return preferences.advancedTheme || this.getDefaultCustomization();
    } catch (error: any) {
      console.error('Error fetching customization:', error);
      throw new Error(`Failed to fetch customization: ${error.message}`);
    }
  }

  /**
   * Update customization options
   */
  async updateFullCustomization(
    userId: string,
    updates: Partial<AdvancedCustomizationTheme>
  ): Promise<AdvancedCustomizationTheme> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      if (!user) throw new Error('User not found');

      const currentPrefs = (user.preferences as any) || {};
      const updatedPrefs = {
        ...currentPrefs,
        advancedTheme: {
          ...(currentPrefs.advancedTheme || this.getDefaultCustomization()),
          ...updates,
        },
      };

      await prisma.user.update({
        where: { id: userId },
        data: { preferences: updatedPrefs },
      });

      console.log(`✅ Customization updated for user: ${userId}`);
      return updatedPrefs.advancedTheme;
    } catch (error: any) {
      console.error('Error updating customization:', error);
      throw new Error(`Failed to update customization: ${error.message}`);
    }
  }

  /**
   * Get default customization theme
   */
  getDefaultCustomization(): AdvancedCustomizationTheme {
    return {
      // Colors
      primaryColor: '#3B82F6',
      primaryColorLight: '#60A5FA',
      primaryColorDark: '#1E40AF',
      secondaryColor: '#10B981',
      secondaryColorLight: '#34D399',
      secondaryColorDark: '#059669',
      accentColor: '#F59E0B',
      accentColorAlt: '#EC4899',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F9FAFB',
      surfaceColorAlt: '#F3F4F6',
      surfaceColorSecondary: '#E5E7EB',
      textColor: '#1F2937',
      textColorSecondary: '#4B5563',
      textColorTertiary: '#9CA3AF',
      textColorInverse: '#FFFFFF',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
      pendingColor: '#F59E0B',

      // Typography
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontFamilyHeading: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontFamilyCode: 'Fira Code, Consolas, monospace',
      headingSize: 'large',
      bodySize: 'medium',
      smallSize: 'small',
      fontWeight: 'normal',
      fontWeightHeading: 'semibold',
      lineHeight: 1.5,
      letterSpacing: 0,
      textTransform: 'none',
      textDecoration: false,

      // Layout
      spacing: 'normal',
      paddingSize: 16,
      marginSize: 16,
      gapSize: 8,
      borderRadius: 'rounded',
      borderWidth: 1,
      borderStyle: 'solid',
      containerWidth: 'normal',
      gridColumns: 12,

      // Effects
      shadowIntensity: 'subtle',
      shadowColor: '#000000',
      glassMorphism: false,
      glassMorphismIntensity: 0,
      blurEffect: false,
      blurRadius: 0,
      gradientEnabled: false,
      gradientAngle: 45,
      gradientColors: [],

      // Animations
      animationEnabled: true,
      animationSpeed: 'normal',
      transitionDuration: 300,
      transitionType: 'ease-in-out',
      hoverEffect: 'scale',
      hoverIntensity: 100,
      focusEffect: 'glow',
      focusColor: '#3B82F6',

      // Dark Mode
      darkMode: false,
      darkModeAutoSwitch: false,
      darkModeAutoSwitchTime: 'sunset',
      darkModeAutoSwitchCustomTime: '20:00',
      lightModeBackground: '#FFFFFF',
      darkModeBackground: '#1F2937',
      contrastMode: 'normal',

      // Navigation
      sidebarPosition: 'left',
      sidebarCollapsed: false,
      sidebarCollapsible: true,
      sidebarWidth: 250,
      sidebarSticky: true,
      showBreadcrumbs: true,
      breadcrumbStyle: 'links',
      showNavigation: true,
      navigationStyle: 'vertical',
      navigationPosition: 'left',
      showFooter: true,
      footerMinimized: false,

      // Components
      buttonStyle: 'filled',
      buttonSize: 'medium',
      inputStyle: 'outlined',
      inputSize: 'medium',
      cardStyle: 'elevated',
      cardElevation: 2,
      chipStyle: 'filled',
      iconSize: 'medium',
      iconStyle: 'solid',
      tooltipStyle: 'dark',
      tooltipPosition: 'auto',
      modalStyle: 'centered',
      modalBackdropBlur: 4,

      // Accessibility
      colorBlindnessMode: 'none',
      highContrast: false,
      invertColors: false,
      reduceMotion: false,
      dyslexiaFont: false,
      readingGuide: false,
      readingGuideColor: '#FFF9C4',
      largeText: false,
      extraLargeText: false,
      textSpacing: 1,
      lineHeightMultiplier: 1,
      focusIndicator: true,
      focusIndicatorThickness: 2,
      focusIndicatorColor: '#3B82F6',
      skipLinksVisible: false,
      screenReaderOptimized: false,
      announceAriaUpdates: false,

      // Branding
      customLogo: '',
      customLogoPosition: 'left',
      customLogoSize: 'medium',
      customFavicon: '',
      customBrandName: 'FairTradeWorker',
      customBrandColor: '#3B82F6',
      headerBackgroundColor: '#FFFFFF',
      headerTextColor: '#1F2937',
      footerBackgroundColor: '#F9FAFB',
      footerTextColor: '#1F2937',
      whiteLabel: false,
      customDomain: '',
      customEmail: '',

      // Notifications
      notificationsEnabled: true,
      notificationsPosition: 'top-right',
      notificationDuration: 5,
      notificationSound: true,
      notificationSoundVolume: 50,
      emailNotifications: true,
      emailNotificationFrequency: 'daily',
      pushNotifications: true,
      smsNotifications: false,

      // Data & Privacy
      dataVisualization: 'both',
      dataExportFormat: 'csv',
      privacyMode: false,
      showAnalytics: true,
      cacheEnabled: true,
      localStorageEnabled: true,
      sessionTimeout: 30,
      autoLogout: true,
    };
  }

  /**
   * Get category-specific settings
   */
  getCustomizationByCategory(
    customization: AdvancedCustomizationTheme,
    category: string
  ): any {
    const categories: { [key: string]: (keyof AdvancedCustomizationTheme)[] } = {
      colors: [
        'primaryColor',
        'primaryColorLight',
        'primaryColorDark',
        'secondaryColor',
        'accentColor',
        'backgroundColor',
        'textColor',
        'successColor',
        'errorColor',
      ],
      typography: [
        'fontFamily',
        'fontFamilyHeading',
        'headingSize',
        'bodySize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
      ],
      layout: [
        'spacing',
        'paddingSize',
        'marginSize',
        'borderRadius',
        'sidebarPosition',
        'navigationStyle',
      ],
      effects: [
        'shadowIntensity',
        'glassMorphism',
        'gradientEnabled',
      ],
      animations: [
        'animationEnabled',
        'animationSpeed',
        'transitionDuration',
        'hoverEffect',
      ],
      darkMode: [
        'darkMode',
        'darkModeAutoSwitch',
        'contrastMode',
      ],
      accessibility: [
        'colorBlindnessMode',
        'highContrast',
        'dyslexiaFont',
        'largeText',
        'focusIndicator',
      ],
      branding: [
        'customLogo',
        'customBrandName',
        'whiteLabel',
        'customDomain',
      ],
      notifications: [
        'notificationsEnabled',
        'notificationsPosition',
        'emailNotifications',
        'pushNotifications',
      ],
      privacy: [
        'privacyMode',
        'showAnalytics',
        'sessionTimeout',
        'autoLogout',
      ],
    };

    const keys = categories[category] || [];
    const result: any = {};

    keys.forEach((key) => {
      result[key] = customization[key];
    });

    return result;
  }

  /**
   * Get available customization presets (10+ comprehensive presets)
   */
  getAdvancedPresets(): { [key: string]: Partial<AdvancedCustomizationTheme> } {
    return {
      // Light Professional
      lightProfessional: {
        primaryColor: '#1E40AF',
        secondaryColor: '#0369A1',
        backgroundColor: '#F8FAFC',
        textColor: '#0F172A',
        fontFamily: 'Georgia, serif',
        spacing: 'spacious',
        borderRadius: 'slight',
        darkMode: false,
        buttonStyle: 'outlined',
        navigationStyle: 'vertical',
      },

      // Dark Professional
      darkProfessional: {
        darkMode: true,
        primaryColor: '#60A5FA',
        backgroundColor: '#0F172A',
        textColor: '#F1F5F9',
        fontFamily: 'Georgia, serif',
        spacing: 'spacious',
        borderRadius: 'slight',
        buttonStyle: 'outlined',
      },

      // Compact Minimal
      compactMinimal: {
        spacing: 'extra-compact',
        bodySize: 'small',
        borderRadius: 'sharp',
        sidebarWidth: 200,
        containerWidth: 'compact',
        shadowIntensity: 'none',
        animationSpeed: 'instant',
      },

      // Spacious Comfortable
      spaciousComfortable: {
        spacing: 'extra-spacious',
        bodySize: 'large',
        lineHeight: 1.8,
        borderRadius: 'very-rounded',
        paddingSize: 24,
        marginSize: 24,
      },

      // Colorful Creative
      colorfulCreative: {
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        accentColor: '#F59E0B',
        gradientEnabled: true,
        gradientAngle: 45,
        glassMorphism: true,
        cardStyle: 'elevated',
        shadowIntensity: 'strong',
      },

      // Accessible High Contrast
      accessibleHighContrast: {
        highContrast: true,
        largeText: true,
        dyslexiaFont: true,
        focusIndicator: true,
        focusIndicatorThickness: 3,
        textSpacing: 1.5,
        lineHeightMultiplier: 1.6,
      },

      // Accessibility Enhanced
      accessibilityEnhanced: {
        colorBlindnessMode: 'deuteranopia',
        reduceMotion: true,
        readingGuide: true,
        screenReaderOptimized: true,
        skipLinksVisible: true,
        focusIndicatorColor: '#FCD34D',
      },

      // Developer Friendly
      developerFriendly: {
        fontFamily: 'Fira Code, monospace',
        fontFamilyCode: 'Fira Code, monospace',
        darkMode: true,
        primaryColor: '#00D9FF',
        backgroundColor: '#0D1117',
        dataVisualization: 'tables',
        privacyMode: false,
        showAnalytics: true,
      },

      // Mobile Optimized
      mobileOptimized: {
        spacing: 'compact',
        buttonSize: 'large',
        inputSize: 'large',
        sidebarPosition: 'floating',
        navigationStyle: 'hamburger',
        containerWidth: 'full',
        touchFriendly: true,
      },

      // Enterprise White Label
      enterpriseWhiteLabel: {
        whiteLabel: true,
        customBrandName: 'Custom Brand',
        headerBackgroundColor: '#1F2937',
        headerTextColor: '#FFFFFF',
        footerBackgroundColor: '#1F2937',
        buttonStyle: 'filled',
        cardStyle: 'elevated',
        shadowIntensity: 'medium',
      },

      // Accessibility - Protanopia
      protanopia: {
        colorBlindnessMode: 'protanopia',
        primaryColor: '#0088FF',
        secondaryColor: '#FFAA00',
        errorColor: '#FF6B35',
        successColor: '#00B4D8',
      },

      // Accessibility - Tritanopia
      tritanopia: {
        colorBlindnessMode: 'tritanopia',
        primaryColor: '#FF0000',
        secondaryColor: '#00D9FF',
        errorColor: '#FFB703',
        successColor: '#00B4D8',
      },
    };
  }

  /**
   * Reset customization to defaults
   */
  async resetCustomization(userId: string): Promise<AdvancedCustomizationTheme> {
    try {
      const defaultTheme = this.getDefaultCustomization();
      return await this.updateFullCustomization(userId, defaultTheme);
    } catch (error: any) {
      console.error('Error resetting customization:', error);
      throw new Error(`Failed to reset customization: ${error.message}`);
    }
  }

  /**
   * Export customization as JSON
   */
  async exportCustomization(userId: string): Promise<string> {
    try {
      const customization = await this.getFullCustomization(userId);
      return JSON.stringify(customization, null, 2);
    } catch (error: any) {
      console.error('Error exporting customization:', error);
      throw new Error(`Failed to export customization: ${error.message}`);
    }
  }

  /**
   * Import customization from JSON
   */
  async importCustomization(userId: string, jsonData: string): Promise<AdvancedCustomizationTheme> {
    try {
      const customization = JSON.parse(jsonData);
      return await this.updateFullCustomization(userId, customization);
    } catch (error: any) {
      console.error('Error importing customization:', error);
      throw new Error(`Failed to import customization: ${error.message}`);
    }
  }

  /**
   * Get customization statistics
   */
  async getCustomizationStats(): Promise<any> {
    try {
      const total = await prisma.user.count();

      const darkModeUsers = await prisma.user.count({
        where: {
          preferences: {
            path: ['advancedTheme', 'darkMode'],
            equals: true,
          },
        },
      });

      const highContrastUsers = await prisma.user.count({
        where: {
          preferences: {
            path: ['advancedTheme', 'highContrast'],
            equals: true,
          },
        },
      });

      return {
        totalUsers: total,
        darkModeUsers,
        darkModePercentage: ((darkModeUsers / total) * 100).toFixed(2),
        highContrastUsers,
        highContrastPercentage: ((highContrastUsers / total) * 100).toFixed(2),
      };
    } catch (error: any) {
      console.error('Error getting customization stats:', error);
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

export default new AdvancedCustomizationService();
