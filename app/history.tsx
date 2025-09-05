
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import { Swipeable } from 'react-native-gesture-handler';
import { Game, PlayerStat } from '../types';
import { getHistory, deleteGameFromHistory } from '../hooks/useGame';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [history, setHistory] = React.useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const { width } = useWindowDimensions();

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
      // Calculate total shots across all periods for team mode
      let homeTotalShots = 0;
      let awayTotalShots = 0;
      
      // Add shots from all periods
      Object.values(game.periodStats || {}).forEach(periodData => {
        homeTotalShots += periodData.teamStats.home.shots || 0;
        if (periodData.teamStats.away) {
          awayTotalShots += periodData.teamStats.away.shots || 0;
        }
      });
      
      // Add current period shots if not saved yet
      homeTotalShots += game.home.shots;
      if (game.away) {
        awayTotalShots += game.away.shots;
      }
      
      return `${game.home.name}: ${homeTotalShots} shots${game.away ? ` | ${game.away.name}: ${awayTotalShots} shots` : ''}`;
    } else {
      // Calculate total shots across all periods for player mode
      let totalShots = 0;
      
      // Add shots from all periods
      Object.values(game.periodStats || {}).forEach(periodData => {
        Object.values(periodData.playerStats).forEach(player => {
          if (!player.number?.startsWith('away_')) {
            totalShots += player.shots || 0;
          }
        });
      });
      
      // Add current period shots if not saved yet
      totalShots += game.home.players.reduce((sum, p) => sum + p.shots, 0);
      
      // Remove "Home:" prefix for Player Mode as requested
      return `${totalShots} total shots | ${game.home.players.length} players`;
    }
  };

  const formatPeriodStats = (game: Game) => {
    const periods = Object.keys(game.periodStats || {}).map(Number).sort((a, b) => a - b);
    if (periods.length === 0) return 'No period data available';

    return periods.map(period => {
      const periodData = game.periodStats[period];
      if (!periodData) return `Period ${period}: No data`;

      if (game.mode === 'team') {
        const homeShots = periodData.teamStats.home.shots || 0;
        const awayShots = periodData.teamStats.away?.shots || 0;
        return `P${period}: ${homeShots}${game.away ? ` - ${awayShots}` : ''} shots`;
      } else {
        const totalShots = Object.values(periodData.playerStats)
          .filter(player => !player.number?.startsWith('away_'))
          .reduce((sum, player) => sum + (player.shots || 0), 0);
        return `P${period}: ${totalShots} shots`;
      }
    }).join(' | ');
  };

  const handleGamePress = (game: Game) => {
    if (game.mode === 'players') {
      setSelectedGame(game);
      setModalVisible(true);
    }
  };

  const renderPlayerStatsModal = () => {
    if (!selectedGame) return null;

    const periods = Object.keys(selectedGame.periodStats || {}).map(Number).sort((a, b) => a - b);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: width * 0.95, maxWidth: 600 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Player Statistics</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {selectedGame.home.name} - {new Date(selectedGame.date).toLocaleDateString()}
            </Text>

            <ScrollView style={styles.modalScrollView}>
              {periods.map(period => {
                const periodData = selectedGame.periodStats[period];
                if (!periodData) return null;

                const players = Object.values(periodData.playerStats)
                  .filter(player => !player.number?.startsWith('away_'))
                  .sort((a, b) => parseInt(a.number) - parseInt(b.number));

                return (
                  <View key={period} style={styles.periodSection}>
                    <Text style={styles.periodTitle}>Period {period}</Text>
                    <View style={styles.statsTable}>
                      <View style={styles.statsHeaderRow}>
                        <Text style={styles.statsHeaderCell}>#</Text>
                        <Text style={styles.statsHeaderCell}>Shots</Text>
                        <Text style={styles.statsHeaderCell}>FO+</Text>
                        <Text style={styles.statsHeaderCell}>FO-</Text>
                        <Text style={styles.statsHeaderCell}>+</Text>
                        <Text style={styles.statsHeaderCell}>-</Text>
                      </View>
                      {players.map(player => (
                        <View key={player.number} style={styles.statsDataRow}>
                          <Text style={styles.statsDataCell}>{player.number}</Text>
                          <Text style={styles.statsDataCell}>{player.shots}</Text>
                          <Text style={styles.statsDataCell}>{player.faceOffWins}</Text>
                          <Text style={styles.statsDataCell}>{player.faceOffLosses}</Text>
                          <Text style={styles.statsDataCell}>{player.plus}</Text>
                          <Text style={styles.statsDataCell}>{player.minus}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <Button
              text="Close"
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    );
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
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress(game)}
                activeOpacity={game.mode === 'players' ? 0.7 : 1}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameDate}>
                    {new Date(game.date).toLocaleDateString()}
                  </Text>
                  <View style={styles.gameModeContainer}>
                    <Text style={styles.gameMode}>
                      {game.mode === 'team' ? 'Team Mode' : 'Player Mode'}
                    </Text>
                    {game.mode === 'players' && (
                      <Ionicons name="chevron-forward" size={16} color={colors.white} />
                    )}
                  </View>
                </View>
                <Text style={styles.gameStats}>
                  {formatGameStats(game)}
                </Text>
                <Text style={styles.gamePeriods}>
                  Periods played: {game.period}
                </Text>
                <Text style={styles.periodStats}>
                  {formatPeriodStats(game)}
                </Text>
              </TouchableOpacity>
            </Swipeable>
          ))
        )}
        {renderPlayerStatsModal()}
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
    width: '100%', // Full width as requested
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
  gameModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  gameMode: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: colors.white,
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
    marginBottom: 4,
  },
  periodStats: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    color: colors.blue,
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 3,
    borderColor: colors.outline,
    boxShadow: '0px 8px 0px ' + colors.outline,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  modalSubtitle: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
    color: colors.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  periodSection: {
    marginBottom: 20,
  },
  periodTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsTable: {
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryBlue,
    paddingVertical: 8,
  },
  statsHeaderCell: {
    flex: 1,
    color: colors.white,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  statsDataRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    backgroundColor: colors.card,
  },
  statsDataCell: {
    flex: 1,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.red,
    marginTop: 16,
  },
});
