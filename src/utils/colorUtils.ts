/**
 * Color utility functions for contrast and accessibility
 */

/**
 * Calculate luminance of a color (hex or rgb)
 * Returns a value between 0 (black) and 1 (white)
 */
function getLuminance(color: string): number {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]) / 255;
      const g = parseInt(match[2]) / 255;
      const b = parseInt(match[3]) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }
  
  // Handle HSL colors (approximate)
  if (color.startsWith('hsl')) {
    // Default to dark for HSL in this app's context
    return 0.1;
  }
  
  // Default to dark
  return 0.1;
}

/**
 * Get appropriate text color based on background luminance
 * Returns '#111111' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export function getContrastText(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? '#111111' : '#FFFFFF';
}

/**
 * Check if a color is light (luminance > 0.5)
 */
export function isLightColor(color: string): boolean {
  return getLuminance(color) > 0.5;
}

/**
 * Get text shadow for better readability
 */
export function getTextShadow(): string {
  return '0 1px 2px rgba(0,0,0,0.1)';
}
