/**
 * Accessibility color utilities for ensuring WCAG AA compliance
 * Provides functions to calculate contrast ratios and ensure readable text colors
 */

// Convert hex color to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance of a color
function getLuminance(r: number, g: number, b: number): number {
  const getRgbValue = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * getRgbValue(r) + 0.7152 * getRgbValue(g) + 0.0722 * getRgbValue(b);
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if color combination meets WCAG AA standards
export function meetsWCAGAA(textColor: string, backgroundColor: string, isLargeText: boolean = false): boolean {
  const contrastRatio = getContrastRatio(textColor, backgroundColor);
  return isLargeText ? contrastRatio >= 3.0 : contrastRatio >= 4.5;
}

// Get accessible text color for a given background
export function getAccessibleTextColor(backgroundColor: string, preferredColor?: string): string {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);

  // If a preferred color is provided and it's accessible, use it
  if (preferredColor && getContrastRatio(preferredColor, backgroundColor) >= 4.5) {
    return preferredColor;
  }

  // Use white or black depending on which provides better contrast
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

// Enhanced category colors with accessibility considerations
export const accessibleCategoryColors = {
  Animals: {
    primary: '#FF6B6B',
    darkText: '#CC0000',    // Darker red for text on light backgrounds
    lightText: '#FFFFFF',   // White text for dark/colored backgrounds
  },
  Food: {
    primary: '#4ECDC4',
    darkText: '#2D8B85',    // Darker teal for text
    lightText: '#FFFFFF',
  },
  Space: {
    primary: '#45B7D1',
    darkText: '#1976D2',    // Darker blue for text
    lightText: '#FFFFFF',
  },
  Science: {
    primary: '#16A085',     // Teal green
    darkText: '#138D75',    // Darker teal for text
    lightText: '#FFFFFF',
  },
  History: {
    primary: '#FFEAA7',
    darkText: '#FF8F00',    // Orange for text (yellow is too light)
    lightText: '#2E2E2E',   // Dark text for light yellow background
  },
  Geography: {
    primary: '#2ECC71',     // Emerald green
    darkText: '#27AE60',    // Darker green for text
    lightText: '#FFFFFF',
  },
  Inventions: {
    primary: '#FFB347',
    darkText: '#E65100',    // Darker orange for text
    lightText: '#FFFFFF',
  },
  Language: {
    primary: '#B19CD9',
    darkText: '#673AB7',    // Darker lavender/purple for text
    lightText: '#FFFFFF',
  },
  General: {
    primary: '#27AE60',     // Beautiful green
    darkText: '#1B5E20',    // Dark green for text
    lightText: '#FFFFFF',
  },
};

// Get accessible text color for a category
export function getAccessibleCategoryTextColor(
  category: string,
  isDarkMode: boolean = false,
  backgroundColor: string = '#FFFFFF'
): string {
  const categoryColors = accessibleCategoryColors[category as keyof typeof accessibleCategoryColors] ||
                        accessibleCategoryColors.General;

  // For colored buttons/backgrounds, use white text
  if (backgroundColor === categoryColors.primary) {
    return categoryColors.lightText;
  }

  // For light backgrounds, use dark text
  if (!isDarkMode && (backgroundColor === '#FFFFFF' || backgroundColor.includes('rgba(0, 0, 0'))) {
    return categoryColors.darkText;
  }

  // For dark backgrounds, use light text
  if (isDarkMode || backgroundColor.includes('rgba(255, 255, 255')) {
    return categoryColors.lightText;
  }

  // Fallback to automatic detection
  return getAccessibleTextColor(backgroundColor, categoryColors.darkText);
}

// Get category color (primary color for backgrounds)
export function getCategoryColor(category?: string): string {
  const categoryColors = accessibleCategoryColors[category as keyof typeof accessibleCategoryColors] ||
                        accessibleCategoryColors.General;
  return categoryColors.primary;
}