
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

interface DoughnutChartProps {
  size?: number;
  strokeWidth?: number;
  shots?: number;
  progress?: number;
  label?: string;
  color?: string;
}

export default function DoughnutChart({
  size = 60, // Reduced default size to half
  strokeWidth = 8, // Reduced stroke width proportionally
  shots = 0,
  progress = 0,
  label,
  color = colors.blue,
}: DoughnutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  
  // Use progress if provided, otherwise calculate from shots (max 100)
  const actualProgress = progress || Math.min(shots / 100, 1);
  const strokeDashoffset = circumference - actualProgress * circumference;

  // Adjust font size based on chart size
  const fontSize = Math.max(12, size * 0.2);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.outline}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color, fontSize }]}>
          {label || shots.toString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center',
  },
});
