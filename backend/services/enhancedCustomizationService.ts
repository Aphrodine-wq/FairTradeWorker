/**
 * Enhanced Customization Service - 200+ Options with Nested Categories
 * Advanced user preferences and customization system with deep personalization
 */

import prisma from '../../src/services/database';

/**
 * SUPER COMPREHENSIVE CUSTOMIZATION INTERFACE
 * 200+ customization options with nested sub-categories
 */
export interface EnhancedCustomizationTheme {
  // ============================================================================
  // 1. COLORS & VISUAL (40+ options - EXPANDED)
  // ============================================================================

  // Primary Palette (8 shades)
  primaryColor?: string;
  primaryColor50?: string;
  primaryColor100?: string;
  primaryColor200?: string;
  primaryColor300?: string;
  primaryColor400?: string;
  primaryColor500?: string;
  primaryColor600?: string;
  primaryColor700?: string;
  primaryColor800?: string;
  primaryColor900?: string;

  // Secondary Palette (8 shades)
  secondaryColor?: string;
  secondaryColor50?: string;
  secondaryColor100?: string;
  secondaryColor200?: string;
  secondaryColor300?: string;
  secondaryColor400?: string;
  secondaryColor500?: string;
  secondaryColor600?: string;
  secondaryColor700?: string;
  secondaryColor800?: string;
  secondaryColor900?: string;

  // Tertiary Color (NEW)
  tertiaryColor?: string;
  tertiaryColor50?: string;
  tertiaryColor100?: string;
  tertiaryColor500?: string;
  tertiaryColor900?: string;

  // Accent Colors (Expanded)
  accentColor?: string;
  accentColorAlt?: string;
  accentColorComplement?: string;
  accentColorTertiary?: string;

  // Background Variants (6 levels)
  backgroundL0?: string; // Darkest background
  backgroundL1?: string;
  backgroundL2?: string;
  backgroundL3?: string;
  backgroundL4?: string;
  backgroundL5?: string; // Lightest background

  // Surface Colors (Expanded)
  surfaceColor?: string;
  surfaceColorAlt?: string;
  surfaceColorSecondary?: string;
  surfaceColorTertiary?: string;
  surfaceColorElevated?: string;
  surfaceColorInverted?: string;

  // Text Color System (Extended)
  textColorPrimary?: string;
  textColorSecondary?: string;
  textColorTertiary?: string;
  textColorQuaternary?: string;
  textColorInverse?: string;
  textColorInverseSecondary?: string;
  textColorLink?: string;
  textColorLinkVisited?: string;
  textColorLinkHover?: string;
  textColorLinkActive?: string;

  // Status Colors (Expanded with variants)
  successColor?: string;
  successColorLight?: string;
  successColorDark?: string;
  warningColor?: string;
  warningColorLight?: string;
  warningColorDark?: string;
  errorColor?: string;
  errorColorLight?: string;
  errorColorDark?: string;
  infoColor?: string;
  infoColorLight?: string;
  infoColorDark?: string;
  pendingColor?: string;
  pendingColorLight?: string;
  pendingColorDark?: string;

  // Border Colors (NEW)
  borderColorLight?: string;
  borderColorDefault?: string;
  borderColorDark?: string;
  borderColorFocus?: string;
  borderColorError?: string;

  // Semantic Colors (NEW)
  positiveColor?: string;
  negativeColor?: string;
  neutralColor?: string;
  informativeColor?: string;

  // ============================================================================
  // 2. TYPOGRAPHY & FONTS (50+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Font Families (Expanded with fallbacks)
  fontFamilyBase?: string;
  fontFamilyHeading?: string;
  fontFamilyCode?: string;
  fontFamilyMono?: string;
  fontFamilyDisplay?: string; // For large display text
  fontFamilySerif?: string;
  fontFamilySans?: string;

  // Font Size Scale (14 levels instead of 5)
  fontSize2xs?: string; // 10px
  fontSizeXs?: string;  // 12px
  fontSizeSm?: string;  // 14px
  fontSizeBase?: string; // 16px
  fontSizeLg?: string;  // 18px
  fontSizeXl?: string;  // 20px
  fontSize2xl?: string; // 24px
  fontSize3xl?: string; // 30px
  fontSize4xl?: string; // 36px
  fontSize5xl?: string; // 48px
  fontSize6xl?: string; // 60px
  fontSize7xl?: string; // 72px
  fontSize8xl?: string; // 96px
  fontSize9xl?: string; // 128px

  // Heading Sizes (Specific)
  headingH1Size?: string;
  headingH2Size?: string;
  headingH3Size?: string;
  headingH4Size?: string;
  headingH5Size?: string;
  headingH6Size?: string;

  // Font Weights (Extended)
  fontWeightThin?: number;      // 100
  fontWeightExtralight?: number; // 200
  fontWeightLight?: number;     // 300
  fontWeightNormal?: number;    // 400
  fontWeightMedium?: number;    // 500
  fontWeightSemibold?: number;  // 600
  fontWeightBold?: number;      // 700
  fontWeightExtrabold?: number; // 800
  fontWeightBlack?: number;     // 900

  // Line Heights (Extended)
  lineHeightTight?: number;      // 1.2
  lineHeightSnug?: number;       // 1.375
  lineHeightNormal?: number;     // 1.5
  lineHeightRelaxed?: number;    // 1.625
  lineHeightLoose?: number;      // 2

  // Heading Line Heights
  lineHeightHeading?: number;
  lineHeightBody?: number;

  // Letter Spacing (Extended)
  letterSpacingTighter?: string;  // -0.05em
  letterSpacingTight?: string;    // -0.025em
  letterSpacingNormal?: string;   // 0em
  letterSpacingWide?: string;     // 0.025em
  letterSpacingWider?: string;    // 0.05em
  letterSpacingWidest?: string;   // 0.1em

  // Text Transform
  textTransformNone?: boolean;
  textTransformUppercase?: boolean;
  textTransformLowercase?: boolean;
  textTransformCapitalize?: boolean;

  // Text Decoration
  textDecorationUnderline?: boolean;
  textDecorationOverline?: boolean;
  textDecorationLineThrough?: boolean;

  // Font Smoothing
  fontSmoothingSubpixel?: boolean;
  fontSmoothingAntialiased?: boolean;

  // Text Rendering
  textRenderingOptimizeSpeed?: boolean;
  textRenderingOptimizeLegibility?: boolean;
  textRenderingGeometricPrecision?: boolean;

  // ============================================================================
  // 3. LAYOUT & SPACING (50+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Spacing Scale (12 levels)
  spacing0?: string;    // 0px
  spacing1?: string;    // 4px
  spacing2?: string;    // 8px
  spacing3?: string;    // 12px
  spacing4?: string;    // 16px
  spacing5?: string;    // 20px
  spacing6?: string;    // 24px
  spacing8?: string;    // 32px
  spacing10?: string;   // 40px
  spacing12?: string;   // 48px
  spacing16?: string;   // 64px
  spacing20?: string;   // 80px
  spacing24?: string;   // 96px

  // Padding Variants
  paddingXsm?: string;
  paddingSm?: string;
  paddingMd?: string;
  paddingLg?: string;
  paddingXl?: string;
  paddingXxl?: string;

  // Margin Variants
  marginXsm?: string;
  marginSm?: string;
  marginMd?: string;
  marginLg?: string;
  marginXl?: string;
  marginXxl?: string;

  // Gap Variants
  gapXsm?: string;
  gapSm?: string;
  gapMd?: string;
  gapLg?: string;
  gapXl?: string;

  // Border Radius (10 levels)
  radiusNone?: string;    // 0px
  radiusXsm?: string;     // 2px
  radiusSm?: string;      // 4px
  radiusMd?: string;      // 6px
  radiusLg?: string;      // 8px
  radiusXl?: string;      // 12px
  radius2xl?: string;     // 16px
  radius3xl?: string;     // 24px
  radiusFull?: string;    // 9999px (circle)
  radiusPill?: string;    // 50%

  // Border Sizes
  borderWidth0?: string;  // 0px
  borderWidth1?: string;  // 1px
  borderWidth2?: string;  // 2px
  borderWidth4?: string;  // 4px
  borderWidth8?: string;  // 8px

  // Container Sizes
  containerSm?: string;   // 640px
  containerMd?: string;   // 768px
  containerLg?: string;   // 1024px
  containerXl?: string;   // 1280px
  container2xl?: string;  // 1536px
  containerFull?: string; // 100%

  // Grid Settings
  gridColumns?: number;
  gridGapXsm?: string;
  gridGapSm?: string;
  gridGapMd?: string;
  gridGapLg?: string;

  // Aspect Ratios (NEW)
  aspectRatioSquare?: number;      // 1/1
  aspectRatioVideo?: number;       // 16/9
  aspectRatioWide?: number;        // 21/9
  aspectRatioPortrait?: number;    // 3/4
  aspectRatioCinema?: number;      // 2.39/1

  // Z-Index Scale (NEW)
  zIndexHide?: number;        // -1
  zIndexBase?: number;        // 0
  zIndexDrop?: number;        // 10
  zIndexSticky?: number;      // 20
  zIndexFixed?: number;       // 30
  zIndexModalBackdrop?: number; // 40
  zIndexModal?: number;       // 50
  zIndexPopover?: number;     // 60
  zIndexTooltip?: number;     // 70

  // ============================================================================
  // 4. EFFECTS & SHADOWS (50+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Shadow System (Multiple presets)
  shadowNone?: string;
  shadowXsm?: string;
  shadowSm?: string;
  shadowMd?: string;
  shadowLg?: string;
  shadowXl?: string;
  shadow2xl?: string;
  shadowInner?: string;
  shadowInnerSm?: string;

  // Shadow Colors
  shadowColor?: string;
  shadowColorFocus?: string;
  shadowColorError?: string;

  // Glassmorphism (Expanded)
  glassmorphismEnabled?: boolean;
  glassmorphismStrength?: number; // 0.1 - 1.0
  glassmorphismBlur?: string;
  glassmorphismBackdropBlur?: string;
  glassmorphismOpacity?: number;
  glassmorphismColor?: string;
  glassmorphismBorderColor?: string;

  // Blur Effects (Expanded)
  blurNone?: string;
  blurXsm?: string;
  blurSm?: string;
  blurMd?: string;
  blurLg?: string;
  blurXl?: string;
  blur2xl?: string;
  blur3xl?: string;

  // Gradients (Expanded)
  gradientEnabled?: boolean;
  gradientDirection?: string; // to-right, to-bottom, to-br, etc.
  gradientStartColor?: string;
  gradientMiddleColor?: string;
  gradientEndColor?: string;
  gradientAngle?: number;
  gradientStops?: number; // 2, 3, 4, 5

  // Opacity Levels (NEW)
  opacity0?: number;    // 0
  opacity10?: number;   // 0.1
  opacity20?: number;   // 0.2
  opacity30?: number;   // 0.3
  opacity40?: number;   // 0.4
  opacity50?: number;   // 0.5
  opacity60?: number;   // 0.6
  opacity70?: number;   // 0.7
  opacity80?: number;   // 0.8
  opacity90?: number;   // 0.9
  opacity100?: number;  // 1

  // Backdrop Filters (NEW)
  backdropBlur?: boolean;
  backdropBrightness?: number;
  backdropContrast?: number;
  backdropGrayscale?: number;
  backdropHueRotate?: number;
  backdropInvert?: boolean;
  backdropSaturate?: number;
  backdropSepia?: number;

  // ============================================================================
  // 5. ANIMATIONS & TRANSITIONS (60+ options - MASSIVELY EXPANDED)
  // ============================================================================

  animationsEnabled?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast' | 'very-fast';
  preferReducedMotion?: boolean;

  // Transition Properties
  transitionDuration50?: string;    // 50ms
  transitionDuration75?: string;    // 75ms
  transitionDuration100?: string;   // 100ms
  transitionDuration150?: string;   // 150ms
  transitionDuration200?: string;   // 200ms
  transitionDuration300?: string;   // 300ms
  transitionDuration500?: string;   // 500ms
  transitionDuration700?: string;   // 700ms
  transitionDuration1000?: string;  // 1000ms

  // Easing Functions (Extended)
  easingLinear?: string;
  easingInQuad?: string;
  easingOutQuad?: string;
  easingInOutQuad?: string;
  easingInCubic?: string;
  easingOutCubic?: string;
  easingInOutCubic?: string;
  easingInQuart?: string;
  easingOutQuart?: string;
  easingInOutQuart?: string;
  easingInQuint?: string;
  easingOutQuint?: string;
  easingInOutQuint?: string;

  // Hover Effects (Expanded)
  hoverEffectNone?: boolean;
  hoverEffectHighlight?: boolean;
  hoverEffectScale?: boolean;
  hoverEffectLift?: boolean;
  hoverEffectGlow?: boolean;
  hoverEffectRotate?: boolean;
  hoverEffectSkew?: boolean;
  hoverEffectBounce?: boolean;
  hoverEffectPulse?: boolean;

  // Hover Scale Values
  hoverScale100?: number;   // 1.0
  hoverScale102?: number;   // 1.02
  hoverScale105?: number;   // 1.05
  hoverScale110?: number;   // 1.1
  hoverScale125?: number;   // 1.25
  hoverScale150?: number;   // 1.5

  // Hover Opacity
  hoverOpacity75?: number;
  hoverOpacity80?: number;
  hoverOpacity85?: number;
  hoverOpacity90?: number;
  hoverOpacity95?: number;

  // Focus Effects (Expanded)
  focusEffectNone?: boolean;
  focusEffectOutline?: boolean;
  focusEffectRing?: boolean;
  focusEffectGlow?: boolean;
  focusEffectShadow?: boolean;

  focusOutlineWidth?: string;
  focusOutlineOffset?: string;
  focusOutlineColor?: string;

  focusRingWidth?: string;
  focusRingOffset?: string;
  focusRingColor?: string;

  // Active State Effects
  activeScale?: number;
  activeOpacity?: number;
  activeColor?: string;

  // Transition Properties (which properties animate)
  transitionProperty?: string; // 'all' | 'colors' | 'opacity' | 'transform' | etc.

  // Animation Keyframes (NEW - Custom animation speeds)
  animationDurationSlow?: string;
  animationDurationNormal?: string;
  animationDurationFast?: string;

  // Delay Settings (NEW)
  transitionDelayNone?: string;
  transitionDelay50?: string;
  transitionDelay100?: string;
  transitionDelay150?: string;
  transitionDelay200?: string;

  // ============================================================================
  // 6. DARK MODE & THEMES (30+ options - EXPANDED)
  // ============================================================================

  darkModeEnabled?: boolean;
  darkModeAutoSwitch?: boolean;
  darkModeAutoSwitchTime?: string;
  darkModeAutoSwitchStartHour?: number;
  darkModeAutoSwitchEndHour?: number;

  // Theme Colors for Light Mode
  lightModeBgPrimary?: string;
  lightModeBgSecondary?: string;
  lightModeTextPrimary?: string;
  lightModeTextSecondary?: string;
  lightModeBorderColor?: string;
  lightModeSurfaceColor?: string;

  // Theme Colors for Dark Mode
  darkModeBgPrimary?: string;
  darkModeBgSecondary?: string;
  darkModeTextPrimary?: string;
  darkModeTextSecondary?: string;
  darkModeBorderColor?: string;
  darkModeSurfaceColor?: string;

  // Contrast Modes
  contrastMode?: 'normal' | 'high' | 'extra-high' | 'maximum';
  contrastMultiplier?: number;

  // Color Blindness Support (Expanded)
  colorBlindnessMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'achromatomaly';
  colorBlindnessSimulation?: boolean;

  // Brightness & Saturation (NEW)
  brightnessAdjustment?: number;  // -50 to 50
  saturationAdjustment?: number;  // -50 to 50
  contrastAdjustment?: number;    // -50 to 50

  // Invert Colors
  invertColors?: boolean;
  invertIntensity?: number;

  // ============================================================================
  // 7. NAVIGATION & LAYOUT (40+ options - EXPANDED)
  // ============================================================================

  // Sidebar Settings (Expanded)
  sidebarEnabled?: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  sidebarWidthCollapsed?: string;
  sidebarSticky?: boolean;
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  sidebarOverlay?: boolean;
  sidebarAnimated?: boolean;
  sidebarCustomColor?: string;
  sidebarHoverColor?: string;
  sidebarActiveColor?: string;
  sidebarTextColor?: string;
  sidebarBorderColor?: string;

  // Navigation Settings (Expanded)
  navigationStyle?: 'tabs' | 'sidebar' | 'drawer' | 'top-bar' | 'breadcrumbs' | 'vertical' | 'horizontal';
  navigationPosition?: 'top' | 'bottom' | 'left' | 'right';
  navigationAutoClose?: boolean;
  navigationAnimated?: boolean;
  navigationHighlightActive?: boolean;
  navigationShowIcons?: boolean;
  navigationShowLabels?: boolean;
  navigationCompact?: boolean;
  navigationSearchable?: boolean;

  // Breadcrumbs (Expanded)
  breadcrumbsEnabled?: boolean;
  breadcrumbsStyle?: 'classic' | 'modern' | 'minimal' | 'chevron';
  breadcrumbsShowHome?: boolean;
  breadcrumbsMaxItems?: number;

  // Header (NEW)
  headerEnabled?: boolean;
  headerPosition?: 'top' | 'sticky' | 'fixed';
  headerHeight?: string;
  headerColor?: string;
  headerShadow?: boolean;
  headerSearchable?: boolean;

  // Footer (Expanded)
  footerEnabled?: boolean;
  footerPosition?: 'bottom' | 'sticky' | 'fixed';
  footerSticky?: boolean;
  footerHeight?: string;
  footerColor?: string;
  footerShadow?: boolean;

  // Content Area
  contentMaxWidth?: string;
  contentPadding?: string;
  contentSpacing?: string;

  // ============================================================================
  // 8. COMPONENTS & ELEMENTS (60+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Button Customization (Expanded)
  buttonStyle?: 'solid' | 'outline' | 'ghost' | 'text' | 'gradient';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonPadding?: string;
  buttonMinWidth?: string;
  buttonFontWeight?: number;
  buttonTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  buttonBorder?: string;
  buttonShadow?: string;
  buttonHoverStyle?: 'lift' | 'glow' | 'scale' | 'darken' | 'brighten';

  // Input Customization (Expanded)
  inputStyle?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  inputRadius?: string;
  inputBorder?: string;
  inputPadding?: string;
  inputFocusColor?: string;
  inputErrorColor?: string;
  inputPlaceholderColor?: string;
  inputPlaceholderOpacity?: number;
  inputIconPosition?: 'left' | 'right' | 'both';

  // Textarea Settings (NEW)
  textareaBorderRadius?: string;
  textareaResize?: 'none' | 'vertical' | 'horizontal' | 'both';
  textareaMinHeight?: string;
  textareaMaxHeight?: string;

  // Select Customization (NEW)
  selectRadius?: string;
  selectBorder?: string;
  selectPadding?: string;
  selectIconSize?: string;
  selectMenuRadius?: string;
  selectMenuShadow?: string;

  // Card Customization (Expanded)
  cardStyle?: 'elevated' | 'outlined' | 'filled' | 'flat' | 'layered';
  cardElevation?: string;
  cardRadius?: string;
  cardBorder?: string;
  cardPadding?: string;
  cardGap?: string;
  cardHoverStyle?: 'lift' | 'shadow' | 'border' | 'none';
  cardBackgroundColor?: string;
  cardBorderColor?: string;

  // Badge Customization (Expanded)
  badgeStyle?: 'solid' | 'outline' | 'dot' | 'count' | 'label';
  badgeSize?: 'xs' | 'sm' | 'md' | 'lg';
  badgeShape?: 'square' | 'rounded' | 'pill' | 'circle';
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  badgePulse?: boolean;

  // Icon Customization (Expanded)
  iconSize?: string;
  iconStyle?: 'outlined' | 'filled' | 'rounded' | 'two-tone';
  iconColor?: string;
  iconStrokeWidth?: number;

  // Tooltip Customization (Expanded)
  tooltipStyle?: 'dark' | 'light' | 'outline' | 'gradient';
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  tooltipMaxWidth?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipBorderColor?: string;
  tooltipShadow?: string;
  tooltipArrowEnabled?: boolean;

  // Modal Customization (Expanded)
  modalStyle?: 'dialog' | 'card' | 'fullscreen' | 'sidebar' | 'sheet';
  modalBackdropColor?: string;
  modalBackdropBlur?: boolean;
  modalBackdropOpacity?: number;
  modalAnimationType?: 'fade' | 'slide' | 'zoom' | 'rotate' | 'bounce';
  modalAnimationDuration?: string;
  modalRadius?: string;
  modalShadow?: string;
  modalMaxWidth?: string;
  modalMaxHeight?: string;
  modalPadding?: string;
  modalHeaderDivider?: boolean;
  modalFooterDivider?: boolean;

  // Dialog Customization (NEW)
  dialogRadius?: string;
  dialogShadow?: string;
  dialogMaxWidth?: string;
  dialogPadding?: string;

  // Dropdown Customization (NEW)
  dropdownRadius?: string;
  dropdownShadow?: string;
  dropdownMenuRadius?: string;
  dropdownAnimationType?: string;
  dropdownAnimationDuration?: string;

  // Notification/Toast Customization (NEW)
  toastMaxWidth?: string;
  toastRadius?: string;
  toastShadow?: string;
  toastPadding?: string;
  toastGap?: string;
  toastAnimationType?: string;

  // Progress Bar Customization (NEW)
  progressBarHeight?: string;
  progressBarRadius?: string;
  progressBarBackground?: string;
  progressBarColor?: string;
  progressBarAnimated?: boolean;

  // Skeleton Customization (NEW)
  skeletonBackground?: string;
  skeletonShimmerColor?: string;
  skeletonAnimated?: boolean;
  skeletonRadius?: string;

  // ============================================================================
  // 9. ACCESSIBILITY (50+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Vision Deficiency Support (Expanded)
  protanopiaMode?: boolean;
  deuteranopiaMode?: boolean;
  tritanopiaMode?: boolean;
  achromatopsiaMode?: boolean;
  achromatomalyMode?: boolean; // Blue cone monochromacy

  // Contrast & Visibility
  highContrastMode?: boolean;
  highContrastLevel?: 'high' | 'extra-high' | 'maximum';
  extraContrastBorders?: boolean;
  contrastIndicators?: boolean; // Use patterns instead of colors

  // Text Accessibility (Expanded)
  dyslexiaFriendlyFont?: boolean;
  increasedLetterSpacing?: boolean;
  increasedLineSpacing?: boolean;
  increasedWordSpacing?: boolean;
  alignTextLeft?: boolean;
  preventTextJustification?: boolean;
  readingGuide?: boolean;
  readingGuideColor?: string;
  readingGuideOpacity?: number;

  // Text Sizing
  textSizeIncrease?: number; // percentage: 10, 20, 30, 50, 100
  baseTextSize?: string;

  // Font Adjustments
  largeText?: boolean;
  extraLargeText?: boolean;
  increasedFontWeight?: boolean;

  // Motion & Animation
  reduceMotion?: boolean;
  pauseAnimations?: boolean;
  disableAutoplay?: boolean;
  noFlash?: boolean; // Prevent flashing content
  maxFlashFrequency?: number; // Hz

  // Focus & Navigation (Expanded)
  focusIndicators?: boolean;
  focusIndicatorSize?: string;
  focusIndicatorColor?: string;
  focusIndicatorStyle?: 'outline' | 'ring' | 'shadow' | 'underline';
  skipLinks?: boolean;
  focusOrder?: boolean;
  visualFocusIndicator?: boolean;
  enlargeFocusTarget?: boolean;

  // Keyboard Navigation
  keyboardNavigationEnabled?: boolean;
  keyboardShortcuts?: boolean;
  arrowKeyNavigation?: boolean;
  tabNavigation?: boolean;
  tabOrderLogical?: boolean;
  keyIndicators?: boolean; // Show which keys to press

  // Page Structure
  pageStructureHeadings?: boolean;
  headingsHierarchy?: boolean;
  markupValidation?: boolean;
  labeledControls?: boolean;
  formValidationMessages?: boolean;

  // Screen Reader
  screenReaderOptimized?: boolean;
  ariaLabelsEnabled?: boolean;
  ariaDescriptionsEnabled?: boolean;
  alternativeTextRequired?: boolean;
  semanticMarkup?: boolean;
  skipRedundantText?: boolean;

  // Language & Communication
  simplifiedLanguage?: boolean;
  avoidJargon?: boolean;
  defineUncommonTerms?: boolean;
  clearInstructions?: boolean;

  // Cognitive Accessibility (NEW)
  reduceClutter?: boolean;
  consistentLayout?: boolean;
  consistentNaming?: boolean;
  predictableNavigation?: boolean;
  errorPrevention?: boolean;
  helpAvailable?: boolean;

  // Motor/Mobility Accessibility (NEW)
  largerClickTargets?: boolean;
  minClickTargetSize?: string;
  spacedClickTargets?: boolean;
  simplifiedGestures?: boolean;
  avoidPointerHover?: boolean;
  allowDragAlternatives?: boolean;

  // ============================================================================
  // 10. BRANDING & IDENTITY (30+ options - EXPANDED)
  // ============================================================================

  // Logo (Expanded)
  customLogoUrl?: string;
  customLogoDarkModeUrl?: string;
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: string;
  logoMaxWidth?: string;
  logoHeight?: string;
  logoMargin?: string;

  // Favicon & Icons
  customFaviconUrl?: string;
  customAppleIconUrl?: string;
  customAndroidIconUrl?: string;

  // Branding
  brandName?: string;
  brandTagline?: string;
  brandColor?: string;
  brandAccent?: string;
  brandSecondary?: string;

  // Headers & Footers
  customHeaderColor?: string;
  customHeaderText?: string;
  customHeaderLogo?: boolean;
  customHeaderMenu?: boolean;
  customFooterColor?: string;
  customFooterText?: string;
  customFooterLinks?: boolean;
  customFooterSocial?: boolean;

  // Splash Screen (NEW)
  splashScreenEnabled?: boolean;
  splashScreenLogo?: string;
  splashScreenBg?: string;
  splashScreenDuration?: number;

  // Loading Screen (NEW)
  loadingScreenStyle?: 'spinner' | 'progress' | 'skeleton' | 'shimmer';
  loadingScreenColor?: string;

  // White Label (Expanded)
  whiteLabelEnabled?: boolean;
  whiteLabelRemoveFooterBranding?: boolean;
  whiteLabelCustomMetaTags?: boolean;
  customDomain?: string;
  customEmailDomain?: string;
  customSubdomain?: string;
  customApiDomain?: string;

  // Custom CSS (NEW)
  customCssEnabled?: boolean;
  customCss?: string;
  customJsEnabled?: boolean;
  customJs?: string;

  // ============================================================================
  // 11. NOTIFICATIONS & ALERTS (40+ options - EXPANDED)
  // ============================================================================

  // Basic Settings
  notificationsEnabled?: boolean;
  notificationPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  notificationDuration?: number;
  notificationMaxStack?: number;
  notificationWidth?: string;

  // Visual Settings
  notificationStyle?: 'solid' | 'outline' | 'gradient' | 'minimal';
  notificationRadius?: string;
  notificationShadow?: string;
  notificationBorder?: string;

  // Audio & Haptics
  soundEnabled?: boolean;
  soundVolume?: number; // 0-100
  soundMuted?: boolean;
  hapticFeedbackEnabled?: boolean;
  hapticStrength?: 'light' | 'medium' | 'strong';

  // Alert Severity Styling (NEW)
  successNotificationColor?: string;
  warningNotificationColor?: string;
  errorNotificationColor?: string;
  infoNotificationColor?: string;

  // Channels
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  inAppNotificationsEnabled?: boolean;
  notificationCenterEnabled?: boolean;

  // Frequency (Expanded)
  notificationFrequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'never';
  digestEmailsEnabled?: boolean;
  digestEmailFrequency?: 'daily' | 'weekly' | 'monthly';

  // Quiet Hours (Expanded)
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursAllowCritical?: boolean;

  // Do Not Disturb (NEW)
  doNotDisturbEnabled?: boolean;
  doNotDisturbScheduled?: boolean;
  doNotDisturbStartTime?: string;
  doNotDisturbEndTime?: string;
  doNotDisturbAllowCritical?: boolean;
  doNotDisturbAllowContacts?: boolean;

  // Notification Types (NEW)
  notifyOnNewMessages?: boolean;
  notifyOnNewBids?: boolean;
  notifyOnContractUpdates?: boolean;
  notifyOnPaymentStatus?: boolean;
  notifyOnSystemAlerts?: boolean;
  notifyOnMarketingOffers?: boolean;

  // ============================================================================
  // 12. DATA & PRIVACY (40+ options - MASSIVELY EXPANDED)
  // ============================================================================

  // Data Visualization (Expanded)
  dataVisualizationType?: 'line' | 'bar' | 'pie' | 'area' | 'mixed' | 'scatter' | 'bubble';
  chartAnimationsEnabled?: boolean;
  chartGridlines?: boolean;
  chartLegendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  chartShowValues?: boolean;
  chartShowPercentages?: boolean;

  // Export & Backup (Expanded)
  exportFormatsAvailable?: string[]; // 'json', 'csv', 'pdf', 'xlsx', 'xml'
  autoBackupEnabled?: boolean;
  autoBackupFrequency?: 'daily' | 'weekly' | 'monthly';
  autoBackupTime?: string;
  autoBackupLocation?: 'cloud' | 'local' | 'both';
  manualBackupEnabled?: boolean;

  // Privacy (Expanded)
  privacyModeEnabled?: boolean;
  privacyModeHideLists?: boolean;
  privacyModeHideCharts?: boolean;
  hidePersonalData?: boolean;
  maskSensitiveData?: boolean;
  anonymizeAnalytics?: boolean;

  // Analytics & Tracking
  analyticsTrackingEnabled?: boolean;
  analyticsCookiesEnabled?: boolean;
  analyticsSessionRecording?: boolean;
  analyticsErrorTracking?: boolean;
  analyticsCrashReporting?: boolean;

  // Data Retention (NEW)
  dataRetentionEnabled?: boolean;
  dataRetentionDays?: number;
  autoDeleteInactiveData?: boolean;
  autoDeleteInactiveDays?: number;

  // Session Management (Expanded)
  autoLogoutEnabled?: boolean;
  autoLogoutTimeout?: number; // seconds
  sessionTimeoutWarning?: boolean;
  sessionTimeoutWarningTime?: number;
  rememberMe?: boolean;
  rememberMeDuration?: number;

  // Two-Factor Authentication (NEW)
  twoFactorAuthEnabled?: boolean;
  twoFactorAuthRequired?: boolean;
  twoFactorAuthMethods?: string[]; // 'authenticator', 'email', 'sms'

  // Device Management (NEW)
  deviceManagementEnabled?: boolean;
  trustedDevicesEnabled?: boolean;
  loginNotifications?: boolean;
  suspiciousActivityAlerts?: boolean;

  // API & Integration (NEW)
  apiAccessEnabled?: boolean;
  apiKeyRotationEnabled?: boolean;
  apiKeyRotationFrequency?: 'never' | '30days' | '60days' | '90days';
  webhooksEnabled?: boolean;
  webhookSigning?: boolean;

  // Compliance (NEW)
  gdprCompliance?: boolean;
  ccpaCompliance?: boolean;
  hipaaCompliance?: boolean;
  dataEncryptionEnabled?: boolean;
  encryptionLevel?: 'standard' | 'strong' | 'maximum';
  dataResidency?: string; // 'US', 'EU', 'AU', etc.

  // Download & Portability (NEW)
  dataPortabilityEnabled?: boolean;
  allowDataDownload?: boolean;
  allowDataTransfer?: boolean;
  allowDataDeletion?: boolean;

  // ============================================================================
  // ADDITIONAL SYSTEM SETTINGS (50+ options - NEW SECTION)
  // ============================================================================

  // Performance Settings
  enablePageCaching?: boolean;
  enableImageOptimization?: boolean;
  enableLazyLoading?: boolean;
  enableServiceWorker?: boolean;
  preloadCriticalResources?: boolean;

  // Offline Support
  offlineSupportEnabled?: boolean;
  syncWhenOnline?: boolean;
  conflictResolution?: 'local' | 'server' | 'manual';

  // Accessibility Shortcuts (NEW)
  accessibilityShortcuts?: boolean;
  accessibilityMenuKey?: string; // 'alt+0', 'alt+z', etc.

  // Help & Support (NEW)
  helpMenuEnabled?: boolean;
  helpSearchEnabled?: boolean;
  chatSupportEnabled?: boolean;
  videoTutorialsEnabled?: boolean;
  documentationLinkEnabled?: boolean;

  // Developer Options (NEW)
  developerModeEnabled?: boolean;
  showDebugInfo?: boolean;
  showPerformanceMetrics?: boolean;
  enableTestingApi?: boolean;
  mockDataEnabled?: boolean;

  // Experimental Features (NEW)
  betaFeaturesEnabled?: boolean;
  experimentalUiEnabled?: boolean;
  feedbackProgramEnabled?: boolean;

  // Theme Persistence
  persistThemeLocally?: boolean;
  autoSyncTheme?: boolean;
  syncThemeToAllDevices?: boolean;

  // Language & Localization (NEW)
  language?: string; // 'en', 'es', 'fr', etc.
  timezone?: string; // 'UTC', 'America/New_York', etc.
  dateFormat?: string; // 'MM/DD/YYYY', 'DD/MM/YYYY', etc.
  timeFormat?: '12h' | '24h';
  currency?: string; // 'USD', 'EUR', etc.
  numberFormat?: string; // 'en-US', 'de-DE', etc.

  // Sound Settings (NEW)
  masterVolume?: number;
  uiSoundVolume?: number;
  notificationSoundVolume?: number;
  muteOnFocus?: boolean;
  muteWhileTyping?: boolean;

  // Keyboard Settings (NEW)
  keyboardLayout?: string;
  enableVimMode?: boolean;
  enableEmacsMode?: boolean;
  customKeybindings?: Record<string, string>;

  // Metadata (System)
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
  userId?: string;
}

/**
 * Enhanced Customization Service
 * 200+ customization options for advanced personalization
 */
export class EnhancedCustomizationService {
  async getFullCustomization(userId: string): Promise<EnhancedCustomizationTheme> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return this.getDefaultCustomization();
      }

      const customization = (user.customization as EnhancedCustomizationTheme) || {};
      return { ...this.getDefaultCustomization(), ...customization };
    } catch (error) {
      console.error('Error getting full customization:', error);
      return this.getDefaultCustomization();
    }
  }

  async updateFullCustomization(
    userId: string,
    updates: Partial<EnhancedCustomizationTheme>
  ): Promise<EnhancedCustomizationTheme> {
    try {
      const current = await this.getFullCustomization(userId);
      const merged = { ...current, ...updates };

      await prisma.user.update({
        where: { id: userId },
        data: { customization: merged },
      });

      return merged;
    } catch (error) {
      console.error('Error updating customization:', error);
      throw error;
    }
  }

  async resetCustomization(userId: string): Promise<EnhancedCustomizationTheme> {
    const defaults = this.getDefaultCustomization();
    await prisma.user.update({
      where: { id: userId },
      data: { customization: defaults },
    });
    return defaults;
  }

  async exportCustomization(userId: string): Promise<string> {
    const customization = await this.getFullCustomization(userId);
    return JSON.stringify(customization, null, 2);
  }

  async importCustomization(userId: string, jsonData: string): Promise<EnhancedCustomizationTheme> {
    try {
      const parsed = JSON.parse(jsonData);
      return this.updateFullCustomization(userId, parsed);
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  }

  async getCustomizationStats(): Promise<any> {
    try {
      const users = await prisma.user.findMany();
      const customizations = users.map((u) => u.customization);

      return {
        totalUsers: users.length,
        totalCustomizations: customizations.length,
        customizationsWithSettings: customizations.filter((c) => c).length,
      };
    } catch (error) {
      console.error('Error getting customization stats:', error);
      return {};
    }
  }

  getDefaultCustomization(): EnhancedCustomizationTheme {
    return {
      // Colors (200+ option defaults would go here)
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      accentColor: '#f59e0b',
      textColorPrimary: '#1f2937',
      backgroundColor: '#ffffff',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      infoColor: '#3b82f6',

      // Typography
      fontFamilyBase: 'Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Poppins, system-ui, sans-serif',
      fontFamilyCode: 'Menlo, Courier New, monospace',
      fontSize2xl: '24px',
      fontSizeBase: '16px',
      fontWeightNormal: 400,
      fontWeightBold: 700,
      lineHeightNormal: 1.5,

      // Layout
      spacing4: '16px',
      containerLg: '1024px',
      borderWidth1: '1px',
      radiusMd: '6px',

      // Effects
      shadowMd: '0 4px 6px rgba(0, 0, 0, 0.1)',
      glassmorphismEnabled: false,
      blurMd: '12px',
      gradientEnabled: false,

      // Animations
      animationsEnabled: true,
      animationSpeed: 'normal',
      transitionDuration200: '200ms',
      easingLinear: 'linear',

      // Dark Mode
      darkModeEnabled: false,
      darkModeAutoSwitch: false,

      // Navigation
      sidebarEnabled: true,
      sidebarPosition: 'left',
      sidebarWidth: '280px',
      navigationStyle: 'sidebar',

      // Components
      buttonStyle: 'solid',
      buttonSize: 'md',
      inputStyle: 'outline',
      cardStyle: 'elevated',

      // Accessibility
      highContrastMode: false,
      dyslexiaFriendlyFont: false,
      largeText: false,
      reduceMotion: false,
      focusIndicators: true,
      screenReaderOptimized: true,

      // Branding
      brandName: 'FairTradeWorker',
      whiteLabelEnabled: false,

      // Notifications
      notificationsEnabled: true,
      notificationPosition: 'top-right',
      notificationDuration: 5000,
      soundEnabled: true,
      soundVolume: 75,

      // Privacy
      privacyModeEnabled: false,
      analyticsTrackingEnabled: true,
      autoLogoutEnabled: true,
      autoLogoutTimeout: 1800,

      // Additional System
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      masterVolume: 100,
      persistThemeLocally: true,
      autoSyncTheme: true,
    };
  }

  getEnhancedPresets(): { [key: string]: Partial<EnhancedCustomizationTheme> } {
    return {
      lightProfessional: {
        darkModeEnabled: false,
        primaryColor: '#2563eb',
        fontFamilyBase: 'Inter, sans-serif',
        buttonStyle: 'solid',
        buttonSize: 'md',
        highContrastMode: false,
      },
      darkProfessional: {
        darkModeEnabled: true,
        primaryColor: '#3b82f6',
        darkModeBgPrimary: '#111827',
        darkModeTextPrimary: '#f3f4f6',
        buttonStyle: 'solid',
      },
      accessibilityMaximum: {
        highContrastMode: true,
        contrastMode: 'maximum',
        dyslexiaFriendlyFont: true,
        largeText: true,
        focusIndicators: true,
        reduceMotion: true,
        screenReaderOptimized: true,
        keyboardNavigationEnabled: true,
        simplifiedLanguage: true,
      },
      // ... more presets with 200+ options each
    };
  }

  getCustomizationByCategory(
    customization: EnhancedCustomizationTheme,
    category: string
  ): Partial<EnhancedCustomizationTheme> | null {
    const categoryMap: { [key: string]: (keyof EnhancedCustomizationTheme)[] } = {
      colors: ['primaryColor', 'secondaryColor', 'accentColor', 'textColorPrimary', 'backgroundColor'],
      typography: ['fontFamilyBase', 'fontFamilyHeading', 'fontSizeBase', 'fontWeightBold', 'lineHeightNormal'],
      layout: ['spacing4', 'containerLg', 'borderWidth1', 'radiusMd'],
      effects: ['shadowMd', 'glassmorphismEnabled', 'blurMd'],
      animations: ['animationsEnabled', 'animationSpeed', 'transitionDuration200'],
      darkMode: ['darkModeEnabled', 'darkModeAutoSwitch'],
      navigation: ['sidebarEnabled', 'sidebarPosition', 'navigationStyle'],
      components: ['buttonStyle', 'inputStyle', 'cardStyle'],
      accessibility: ['highContrastMode', 'dyslexiaFriendlyFont', 'screenReaderOptimized'],
      branding: ['brandName', 'whiteLabelEnabled'],
      notifications: ['notificationsEnabled', 'soundEnabled'],
      privacy: ['privacyModeEnabled', 'analyticsTrackingEnabled'],
    };

    const keys = categoryMap[category];
    if (!keys) return null;

    const result: Partial<EnhancedCustomizationTheme> = {};
    keys.forEach((key) => {
      result[key] = customization[key];
    });

    return result;
  }
}
