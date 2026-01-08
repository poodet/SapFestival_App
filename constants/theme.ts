/**
 * Theme Configuration
 * 
 * Centralized color definitions for the SAP Festival App.
 * Update these values to change the artistic direction/theme for each festival edition.
 */

export const theme = {
  // General app colors
  background: {
    primary: '#f7afce',      // Main app background color (blue)
    secondary: '#F9F2EA',    // Cards and content background (cream/white)
    dark: '#25292e',         // Dark elements
    overlay: 'rgba(0,0,0,0.5)', // Modal overlays
  },

  // Interactive elements (selected icons, clicked buttons, etc.)
  interactive: {
    primary: '#0b8c35',      // Primary action color (green) - selected state
    secondary: '#5a9adb',    // Secondary action color (blue) - default state
    text: '#053688',         // Text for links/buttons (dark blue)
    inactive: '#6d6161',     // Inactive/disabled state (gray)
  },

  // Category colors
  categories: {
    artists: '#5a9adb',      // Pink - for artist events
    activities: '#0da853',   // Orange - for activity events
    meals: '#f9d73e',        // Light pink - for meal/food events
    other: '#0da853',        // Green - for other events
  },

  // Text colors
  text: {
    primary: '#fff',         // White text (on dark backgrounds)
    secondary: '#000',       // Black text (on light backgrounds)
    inactive: '#6d6161',     // Gray text for inactive elements
  },

  // Additional UI colors (used in specific contexts)
  ui: {
    white: '#fff',
    black: '#000',
    border: '#5a9adb',
    shadow: '#000',
  },
} as const;

/**
 * Legacy color mapping for backward compatibility
 * Maps old hardcoded colors to new theme structure
 * @deprecated Use theme object instead
 */
export const legacyColors = {
  '#5a9adb': theme.background.primary,
  '#F9F2EA': theme.background.secondary,
  '#0b8c35': theme.interactive.primary,
  '#053688': theme.interactive.text,
  '#6d6161': theme.interactive.inactive,
  '#f7afce': theme.categories.artists,
  '#f28d11': theme.categories.activities,
  '#fc87bb': theme.categories.meals,
  '#0da853': theme.categories.other,
  '#25292e': theme.background.dark,
} as const;

export default theme;
