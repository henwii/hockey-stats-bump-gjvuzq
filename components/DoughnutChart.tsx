
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../styles/commonStyles';

interface DoughnutChartProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  label?: string;
  color?: string;
}

export default function DoughnutChart({
  size = 120,
  strokeWidth = 16,
  progress,
  label = '',
  color = colors.red,
}: DoughnutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStroke = circumference * progress;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.outline}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressStroke}, ${circumference}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerText}>{Math.round(progress * 100)}%</Text>
        {label ? <Text style={styles.centerLabel}>{label}</Text> : null}
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
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: colors.text,
  },
  centerLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
    color: colors.muted,
  },
});
