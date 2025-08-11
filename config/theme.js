import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Theme configuration for the WooCommerce Shopping App
// This file can be customized per client without affecting app logic

export const theme = {
  // Screen dimensions
  screenWidth,
  screenHeight,

  // Primary brand colors
  primary: '#008585',
  primaryDark: '#004343',
  primaryLight: '#4FB3B3',

  // Secondary accent colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFD180',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9E9E9E',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',

  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Borders
  border: '#E0E0E0',
  borderLight: '#F5F5F5',

  // Shadows (web + iOS)
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Elevation (Android)
  elevation: {
    low: 2,
    medium: 4,
    high: 8,
  },

  // Opacity levels
  opacity: {
    disabled: 0.5,
    pressed: 0.75,
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },

  // Typography system
  typography: {
    fontFamily: 'System',
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
};

export default theme;
