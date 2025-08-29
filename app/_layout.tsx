
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { commonStyles, colors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { useFonts, Fredoka_400Regular, Fredoka_500Medium, Fredoka_700Bold } from '@expo-google-fonts/fredoka';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({ Fredoka_400Regular, Fredoka_500Medium, Fredoka_700Bold });

  useEffect(() => {
    setupErrorLogging();

    if (Platform.OS === 'web') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setStoredEmulate(stored);
      } catch (e) {
        console.log('localStorage not available');
      }
    }
  }, []);

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
          {fontsLoaded ? (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
              }}
            />
          ) : null}
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
