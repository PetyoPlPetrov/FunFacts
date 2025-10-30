/**
 * Modern, clean color palette inspired by contemporary design
 * Unique color combinations to avoid any trademark concerns
 */

const tintColorLight = '#F54768'; // Coral rose
const tintColorDark = '#F54768';

export const Colors = {
  light: {
    text: '#1A1A1A', // Deep charcoal
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B6B6B', // Medium gray
    tabIconDefault: '#A8A8A8',
    tabIconSelected: tintColorLight,
    // Modern semantic colors
    border: '#D6D6D6',
    borderLight: '#E8E8E8',
    cardBackground: '#FFFFFF',
    secondaryText: '#6B6B6B',
    success: '#00A86B', // Jade green
    error: '#DC3545', // Crimson red
    warning: '#FFA726',
    // Unique gradients
    gradientPrimary: ['#F54768', '#EC2F5B', '#D91E4F'], // Coral rose gradient
    gradientSecondary: ['#C82350', '#9B1C3F'],
    gradientGreen: ['#00BFA5', '#00A86B'], // Turquoise to jade
    gradientRed: ['#FF6B7A', '#DC3545'], // Soft to deep red
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Dark mode semantic colors
    border: '#424242',
    borderLight: '#383838',
    cardBackground: '#252525',
    secondaryText: '#A8A8A8',
    success: '#00BFA5',
    error: '#FF6B7A',
    warning: '#FFA726',
    // Dark gradients
    gradientPrimary: ['#F54768', '#C82350'],
    gradientSecondary: ['#C82350', '#9B1C3F'],
    gradientGreen: ['#00BFA5', '#00A86B'],
    gradientRed: ['#FF6B7A', '#DC3545'],
  },
};
