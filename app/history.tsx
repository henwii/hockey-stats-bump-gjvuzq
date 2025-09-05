
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { Game } from '../types';
import { getHistory, deleteGameFromHistory } from '../hooks/useGame';

export default function HistoryScreen() {
  const [history, setHistory] = React.useState<Game[]>([]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (gameId: string) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteGameFromHistory(gameId);
            if (success) {
              await loadHistory(); // Reload the list
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (gameId: string) => {
    return (
      <View style={styles.deleteAction}>
        <Button
          text="Delete"
          onPress={() => handleDelete(gameId)}
          style={styles.deleteButton}
          textStyle={{ color: colors.white }}
        />
      </View>
    );
  };

  const formatGameStats = (game: Game) => {
    if (game.mode === 'team' && game.away) {
      return `Shots: ${game.home.name} ${game.home.shots} - ${game.away.shots} ${game.away.name}`;
    } else {
      // Player mode - show total shots
      const totalShots = game.home.players.reduce((sum, p) => sum + p.shots, 0);
      return `Total Shots: ${totalShots} (${game.home.name})`;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="History" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {history.length === 0 ? (
          <Text style={commonStyles.text}>No games saved yet.</Text>
        ) : (
          history.map((g) => (
            <Swipeable
              key={g.id}
              renderRightActions={() => renderRightActions(g.id)}
              rightThreshold={40}
            >
              <View style={styles.card}>
                <Text style={styles.title}>{new Date(g.date).toLocaleString()}</Text>
                <Text style={styles.line}>
                  {g.mode === 'team' && g.away 
                    ? `${g.home.name} vs ${g.away.name}` 
                    : `${g.home.name} (Player Mode)`
                  }
                </Text>
                <Text style={styles.line}>{formatGameStats(g)}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.mode}>Mode: {g.mode === 'team' ? 'Team' : 'Players'}</Text>
                  <Text style={styles.mode}>Periods: {g.period}</Text>
                </View>
                <Text style={styles.swipeHint}>← Swipe left to delete</Text>
              </View>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: colors.outline,
    boxShadow: '0px 6px 0px ' + colors.outline,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  line: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  mode: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
  },
  swipeHint: {
    fontFamily: 'Fredoka_400Regular',
    color: colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteAction: {
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
});
