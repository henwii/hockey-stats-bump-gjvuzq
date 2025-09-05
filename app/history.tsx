
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import { Swipeable } from 'react-native-gesture-handler';
import { Game } from '../types';
import { getHistory, deleteGameFromHistory } from '../hooks/useGame';
import Button from '../components/Button';

export default function HistoryScreen() {
  const [history, setHistory] = React.useState<Game[]>([]);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const games = await getHistory();
    setHistory(games);
  };

  const handleDelete = async (gameId: string) => {
    const success = await deleteGameFromHistory(gameId);
    if (success) {
      loadHistory(); // Reload the history
    }
  };

  const renderRightActions = (gameId: string) => (
    <View style={styles.deleteAction}>
      <Button
        text="Delete"
        onPress={() => handleDelete(gameId)}
        style={styles.deleteButton}
        textStyle={{ color: colors.white }}
      />
    </View>
  );

  const formatGameStats = (game: Game) => {
    if (game.mode === 'team') {
      return `${game.home.name}: ${game.home.shots} shots${game.away ? ` | ${game.away.name}: ${game.away.shots} shots` : ''}`;
    } else {
      const totalShots = game.home.players.reduce((sum, p) => sum + p.shots, 0);
      return `${game.home.name}: ${totalShots} total shots | ${game.home.players.length} players`;
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header title="Game History" canGoBack />
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No games saved yet</Text>
            <Text style={styles.emptySubtext}>Complete a game to see it here</Text>
          </View>
        ) : (
          history.map((game) => (
            <Swipeable
              key={game.id}
              renderRightActions={() => renderRightActions(game.id)}
            >
              <View style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameDate}>
                    {new Date(game.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.gameMode}>
                    {game.mode === 'team' ? 'Team Mode' : 'Player Mode'}
                  </Text>
                </View>
                <Text style={styles.gameStats}>
                  {formatGameStats(game)}
                </Text>
                <Text style={styles.gamePeriods}>
                  Periods played: {game.period}
                </Text>
              </View>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.outline,
    boxShadow: '0px 6px 0px ' + colors.outline,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDate: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  gameMode: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: colors.muted,
    backgroundColor: colors.primaryBlue,
    color: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameStats: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  gamePeriods: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  deleteAction: {
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
});
