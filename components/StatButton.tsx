
import { useRef } from 'react';
import { Text, Pressable, Animated, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { colors } from '../styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface StatButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  count?: number;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function StatButton({
  label,
  onPress,
  color = colors.blue,
  count,
  style,
  textStyle,
  accessibilityLabel
}: StatButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      console.log('Haptics error', e);
    }
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.button, { backgroundColor: color }, style]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
      >
        <Text style={[styles.label, textStyle]}>{label}</Text>
        {typeof count === 'number' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 80,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 0px ' + colors.primaryBlue,
    borderWidth: 3,
    borderColor: colors.white,
  },
  label: {
    color: colors.white,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
  },
  badge: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  badgeText: {
    color: colors.text,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
  },
});
