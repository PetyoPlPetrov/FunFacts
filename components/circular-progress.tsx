import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8
}: CircularProgressProps) {
  // Calculate color based on percentage (green = good, red = bad)
  const getColor = (percent: number) => {
    if (percent >= 80) return '#00A86B'; // Jade green
    if (percent >= 60) return '#4CAF50'; // Light green
    if (percent >= 40) return '#FFA726'; // Orange
    if (percent >= 20) return '#FF7043'; // Light red
    return '#DC3545'; // Crimson red
  };

  const progressColor = getColor(percentage);

  // Create segments for the circular progress
  const segments = 60; // Number of segments in the circle
  const filledSegments = Math.round((percentage / 100) * segments);

  // Get the error color (red for remaining percentage)
  const errorColor = '#DC3545'; // Crimson red

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle - filled with red (error/remaining) */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: errorColor,
          },
        ]}
      />

      {/* Progress overlay - green portion */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: progressColor,
            borderRightColor: percentage > 25 ? progressColor : 'transparent',
            borderBottomColor: percentage > 50 ? progressColor : 'transparent',
            borderLeftColor: percentage > 75 ? progressColor : 'transparent',
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />

      {/* Percentage text in center */}
      <View style={styles.textContainer}>
        <Text style={[styles.percentageText, { color: progressColor }]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
  },
});
