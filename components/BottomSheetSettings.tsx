
import React, { useCallback, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { colors } from '../styles/commonStyles';
import Button from './Button';

interface BottomSheetSettingsProps {
  open: boolean;
  onClose: () => void;
  teamNames: { home: string; away: string };
  onChangeNames: (names: { home: string; away: string }) => void;
  mode: 'team' | 'players';
  onToggleMode: (mode: 'team' | 'players') => void;
  onOpenPlayerSetup: () => void;
}

export default function BottomSheetSettings({
  open,
  onClose,
  teamNames,
  onChangeNames,
  mode,
  onToggleMode,
  onOpenPlayerSetup
}: BottomSheetSettingsProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '55%'], []);

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const renderContent = useCallback(() => {
    return (
      <BottomSheetView style={styles.content}>
        <Text style={styles.sheetTitle}>Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Mode</Text>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, mode === 'team' ? styles.on : undefined]}>Team</Text>
            <Switch
              value={mode === 'players'}
              onValueChange={(v) => onToggleMode(v ? 'players' : 'team')}
              thumbColor={colors.white}
              trackColor={{ false: colors.blue, true: colors.red }}
            />
            <Text style={[styles.switchLabel, mode === 'players' ? styles.on : undefined]}>Players</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Home</Text>
          <TextInput
            placeholder="Home name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={teamNames.home}
            onChangeText={(t) => onChangeNames({ ...teamNames, home: t })}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Away</Text>
          <TextInput
            placeholder="Away name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={teamNames.away}
            onChangeText={(t) => onChangeNames({ ...teamNames, away: t })}
          />
        </View>

        <Button text="Configure Player Numbers" onPress={onOpenPlayerSetup} />
        <Button text="Close" onPress={onClose} style={{ backgroundColor: colors.red }} />
      </BottomSheetView>
    );
  }, [teamNames, onChangeNames, onClose, mode, onToggleMode, onOpenPlayerSetup]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bg}
      handleIndicatorStyle={{ backgroundColor: colors.white }}
    >
      {renderContent()}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.primaryBlue,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sheetTitle: {
    color: colors.white,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 60,
    color: colors.white,
    fontFamily: 'Fredoka_500Medium',
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Fredoka_500Medium',
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  switchLabel: {
    color: colors.white,
    fontFamily: 'Fredoka_500Medium',
  },
  on: {
    textDecorationLine: 'underline',
  },
});
