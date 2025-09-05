
import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useGame } from '../hooks/useGame';
import { router } from 'expo-router';

export default function PlayerSetupScreen() {
  const { game, setPlayerNumbers } = useGame();
  const [playerNumbers, setLocalPlayerNumbers] = React.useState(game.home.players.map((p) => p.number).join(', '));

  const parseNumbers = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSave = () => {
    console.log('Saving player numbers:', parseNumbers(playerNumbers));
    setPlayerNumbers('home', parseNumbers(playerNumbers));
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Configure Player Numbers" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={commonStyles.card}>
          <Text style={styles.title}>Players</Text>
          <Text style={styles.label}>Comma-separated jersey numbers</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2, 7, 10, 12, 16"
            placeholderTextColor={colors.muted}
            value={playerNumbers}
            onChangeText={setLocalPlayerNumbers}
          />
          <Button
            text="Save Player Numbers"
            onPress={handleSave}
            style={{ backgroundColor: colors.green }}
          />
        </View>

        <Button
          text="Done"
          onPress={() => router.back()}
          style={{ backgroundColor: colors.blue }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 18,
    marginBottom: 6,
  },
  label: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Fredoka_500Medium',
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.outline,
    marginBottom: 10,
  },
});
