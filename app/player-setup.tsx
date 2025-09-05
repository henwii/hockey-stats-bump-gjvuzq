
import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useGame } from '../hooks/useGame';
import { router } from 'expo-router';

export default function PlayerSetupScreen() {
  const { game, setPlayerNumbers } = useGame();
  const [homeNumbers, setHomeNumbers] = React.useState(game.home.players.map((p) => p.number).join(', '));
  const [awayNumbers, setAwayNumbers] = React.useState(
    game.away ? game.away.players.map((p) => p.number).join(', ') : ''
  );

  const parseNumbers = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Player Setup" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={commonStyles.card}>
          <Text style={styles.title}>{game.home.name} Players</Text>
          <Text style={styles.label}>Comma-separated jersey numbers</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2, 7, 10, 12, 16"
            placeholderTextColor={colors.muted}
            value={homeNumbers}
            onChangeText={setHomeNumbers}
          />
          <Button
            text="Save Home Numbers"
            onPress={() => {
              setPlayerNumbers('home', parseNumbers(homeNumbers));
            }}
          />
        </View>

        {game.mode === 'team' && game.away && (
          <View style={commonStyles.card}>
            <Text style={styles.title}>{game.away.name} Players</Text>
            <Text style={styles.label}>Comma-separated jersey numbers</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4, 8, 11, 15, 19"
              placeholderTextColor={colors.muted}
              value={awayNumbers}
              onChangeText={setAwayNumbers}
            />
            <Button
              text="Save Away Numbers"
              onPress={() => {
                setPlayerNumbers('away', parseNumbers(awayNumbers));
              }}
            />
          </View>
        )}

        <Button
          text="Done"
          onPress={() => router.back()}
          style={{ backgroundColor: colors.green }}
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
