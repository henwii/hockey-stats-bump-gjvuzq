
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { commonStyles, colors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { useFonts, Fredoka_400Regular, Fredoka_500Medium, Fredoka_700Bold } from '@expo-google-fonts/fredoka';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({ 
    Fredoka_400Regular, 
    Fredoka_500Medium, 
    Fredoka_700Bold 
  });

  useEffect(() => {
    console.log('RootLayout mounted');
    setupErrorLogging();

    if (Platform.OS === 'web') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setStoredEmulate(stored);
      } catch (e) {
        console.log('localStorage not available:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
    if (fontsLoaded) {
      console.log('Fonts loaded successfully');
    }
  }, [fontsLoaded, fontError]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    } as const;

    const deviceToEmulate = storedEmulate;
    insetsToUse = deviceToEmulate
      ? (simulatedInsets as any)[deviceToEmulate] || actualInsets
      : actualInsets;
  }

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={[commonStyles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 18, color: colors.text }}>Loading...</Text>
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={[
            commonStyles.wrapper,
            {
              paddingTop: insetsToUse.top,
              paddingBottom: insetsToUse.bottom,
              paddingLeft: insetsToUse.left,
              paddingRight: insetsToUse.right,
            },
          ]}
        >
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
            }}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
