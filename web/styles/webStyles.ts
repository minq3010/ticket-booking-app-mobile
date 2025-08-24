import { Platform } from 'react-native';

export const webStyles = {
  // Container styles
  container: {
    maxWidth: 1400,
    marginLeft: 'auto' as any,
    marginRight: 'auto' as any,
    width: '100%',
    padding: Platform.OS === 'web' ? 24 : 16,
  },

  // Card styles
  card: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    border: Platform.OS === 'web' ? '1px solid #e4e6ea' : undefined,
    boxShadow: Platform.OS === 'web' ? '0 2px 8px rgba(0,0,0,0.06)' as any : undefined,
  },

  // Grid styles
  grid: {
    display: Platform.OS === 'web' ? 'grid' as any : 'flex',
    gridTemplateColumns: Platform.OS === 'web' ? 'repeat(auto-fit, minmax(250px, 1fr))' as any : undefined,
    gap: 16,
  },

  // Typography
  webFont: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
  },

  // Shadows
  shadow: {
    boxShadow: Platform.OS === 'web' ? '0 2px 8px rgba(0,0,0,0.06)' as any : undefined,
  },

  // Colors
  colors: {
    primary: '#1877f2',
    success: '#42b72a',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#1c1e21',
    muted: '#606770',
    border: '#e4e6ea',
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
};

export const getResponsiveValue = (mobile: any, tablet?: any, desktop?: any) => {
  if (Platform.OS !== 'web') return mobile;
  
  const width = window.innerWidth;
  
  if (width >= webStyles.breakpoints.desktop && desktop !== undefined) {
    return desktop;
  } else if (width >= webStyles.breakpoints.tablet && tablet !== undefined) {
    return tablet;
  }
  
  return mobile;
};

export const isLargeScreen = () => {
  if (Platform.OS !== 'web') return false;
  return window.innerWidth >= webStyles.breakpoints.tablet;
};

export const isMobileWeb = () => {
  if (Platform.OS !== 'web') return false;
  return window.innerWidth < webStyles.breakpoints.mobile;
};
