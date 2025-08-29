
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  canGoBack?: boolean;
}

export default function Header({ title, right, canGoBack = true }: HeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={{ minWidth: 48 }}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={{ minWidth: 48, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryBlue,
    borderBottomWidth: 3,
    borderBottomColor: colors.white,
    boxShadow: '0px 6px 0px ' + colors.outline,
  },
  title: {
    color: colors.white,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
  },
  back: {
    backgroundColor: colors.red,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    boxShadow: '0px 4px 0px ' + colors.softRed,
  },
});
