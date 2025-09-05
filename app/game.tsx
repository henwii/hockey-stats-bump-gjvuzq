
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import StatButton from '../components/StatButton';
import DoughnutChart from '../components/DoughnutChart';
import { useGame } from '../hooks/useGame';
import Button from '../components/Button';
import BottomSheetSettings from '../components/BottomSheetSettings';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function GameScreen() {
  const {
    game,
    loading,
    setMode,
    nextPeriod,
    setTeamNames,
    incrementTeamShots,
    incrementPlayerStat,
    setSelectedPlayer,
    toggleShiftMode,
    setGoalies,
    selectGoalie,
    getTotalShotsForPeriod,
    resetCurrentGame,
    saveToHistory,
  } = useGame();

  const { width } = useWindowDimensions();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    console.log('Game loaded', game.id, 'Period:', game.period);
  }, [game.id, game.period]);

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const onEndGame = async () => {
    const ok = await saveToHistory();
    if (ok) {
      resetCurrentGame();
      router.push('/history');
    }
  };

  const getTileWidth = (playersCount: number) => {
    let columns = 2;
    if (playersCount >= 20) columns = 4;
    else if (playersCount >= 12) columns = 3;
    if (width < 360) columns = Math.max(2, columns - 1);
    if (columns === 4) return '23%';
    if (columns === 3) return '31%';
    return '48%';
  };

  const handlePlayerStatIncrement = (statName: keyof typeof game.home.players[0]) => {
    if (game.selectedPlayer === null) {
      console.log('No player selected');
      return;
    }
    
    const playerNumber = String(game.selectedPlayer);
    incrementPlayerStat('home', playerNumber, statName as any);
  };

  const totalShotsCurrentPeriod = game.mode === 'players' ? getTotalShotsForPeriod(game.period) : 0;

  const handleGoalieChange = (goalies: string[], selected: number) => {
    setGoalies('home', goalies);
    selectGoalie('home', selected);
  };

  const getPlayerStats = (playerNumber: string) => {
    const player = game.home.players.find(p => p.number === playerNumber);
    return player || { shots: 0, faceOffWins: 0, faceOffLosses: 0, plus: 0, minus: 0 };
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={`Game - Period ${game.period}`}
        right={
          <Button
            text="Settings"
            onPress={() => setSheetOpen(true)}
            style={{ width: undefined, paddingHorizontal: 14, paddingVertical: 8 }}
          />
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Team Mode */}
        {game.mode === 'team' && game.away && (
          <>
            {/* Period Card as Parent */}
            <View style={[commonStyles.card, { alignItems: 'center' }]}>
              <Text style={styles.periodTitle}>Period {game.period}</Text>
              <Button
                text="Next Period"
                onPress={nextPeriod}
                style={{ backgroundColor: colors.green, width: 200 }}
              />
              
              {/* Home and Away cards as children */}
              <View style={styles.teamsRow}>
                <View style={[styles.teamCard, { borderColor: colors.blue }]}>
                  <Text style={styles.teamName}>{game.home.name}</Text>
                  <DoughnutChart
                    shots={game.home.shots}
                    label={`${game.home.shots}`}
                    color={colors.blue}
                  />
                  <View style={{ width: '100%' }}>
                    <Text style={styles.goalieLabel}>
                      Goalie: {game.home.goalies[game.home.selectedGoalie || 0]}
                    </Text>
                    <StatButton
                      label="+1 Shot"
                      onPress={() => incrementTeamShots('home', 1)}
                      color={colors.blue}
                      style={{ marginTop: 10 }}
                    />
                    <StatButton
                      label="-1 Shot"
                      onPress={() => incrementTeamShots('home', -1)}
                      color={colors.softRed}
                      style={{ marginTop: 10 }}
                    />
                  </View>
                </View>

                <View style={[styles.teamCard, { borderColor: colors.red }]}>
                  <Text style={styles.teamName}>{game.away.name}</Text>
                  <DoughnutChart
                    shots={game.away.shots}
                    label={`${game.away.shots}`}
                    color={colors.red}
                  />
                  <View style={{ width: '100%' }}>
                    <Text style={styles.goalieLabel}>
                      Goalie: {game.away.goalies[game.away.selectedGoalie || 0]}
                    </Text>
                    <StatButton
                      label="+1 Shot"
                      onPress={() => incrementTeamShots('away', 1)}
                      color={colors.red}
                      style={{ marginTop: 10 }}
                    />
                    <StatButton
                      label="-1 Shot"
                      onPress={() => incrementTeamShots('away', -1)}
                      color={colors.softRed}
                      style={{ marginTop: 10 }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Player Mode */}
        {game.mode === 'players' && (
          <>
            {/* Total Shots Card with Next Period Button */}
            <View style={[commonStyles.card, { alignItems: 'center' }]}>
              <View style={styles.totalShotsHeader}>
                <Text style={styles.sectionTitle}>Total Shots - Period {game.period}</Text>
                <Button
                  text="Next Period"
                  onPress={nextPeriod}
                  style={styles.nextPeriodBtn}
                  textStyle={{ fontSize: 12 }}
                />
              </View>
              <DoughnutChart
                shots={totalShotsCurrentPeriod}
                label={`${totalShotsCurrentPeriod}`}
                color={colors.blue}
                size={120}
              />
              <Text style={styles.goalieLabel}>
                Shots on: {game.home.goalies[game.home.selectedGoalie || 0]}
              </Text>
            </View>

            {/* Player Selection */}
            <View style={[commonStyles.card]}>
              <Text style={styles.sectionTitle}>1. Select Player</Text>
              <Text style={styles.sectionSubtitle}>
                {game.selectedPlayer ? `Selected: #${game.selectedPlayer}` : 'No player selected'}
              </Text>
              <View style={styles.grid}>
                {game.home.players.map((p) => {
                  const stats = getPlayerStats(p.number);
                  const isSelected = game.selectedPlayer === parseInt(p.number);
                  return (
                    <View key={p.number} style={[styles.playerContainer, { width: getTileWidth(game.home.players.length) }]}>
                      <StatButton
                        label={`#${p.number}`}
                        onPress={() => setSelectedPlayer(p.number)}
                        color={isSelected ? colors.green : colors.blue}
                        style={styles.playerSelectBtn}
                        textStyle={{ fontSize: 20, fontWeight: 'bold' }}
                      />
                      <View style={styles.playerStatsContainer}>
                        <Text style={styles.playerStatText}>S:{stats.shots} FO+:{stats.faceOffWins}</Text>
                        <Text style={styles.playerStatText}>FO-:{stats.faceOffLosses} +:{stats.plus} -:{stats.minus}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Event Counters */}
            <View style={[commonStyles.card]}>
              <View style={styles.eventCardHeader}>
                <Text style={styles.sectionTitle}>2. Count Event</Text>
                <StatButton
                  label={<Ionicons name="swap-vertical" size={16} color={colors.white} />}
                  onPress={toggleShiftMode}
                  color={game.shiftMode ? colors.yellow : colors.muted}
                  style={styles.shiftBtn}
                />
              </View>
              <Text style={styles.sectionSubtitle}>
                {game.shiftMode ? 'SHIFT MODE: Counting DOWN' : 'Normal: Counting UP'}
              </Text>
              
              <View style={styles.eventGrid}>
                <StatButton
                  label="Shot"
                  onPress={() => handlePlayerStatIncrement('shots')}
                  color={colors.blue}
                  style={styles.shotBtn}
                  textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                />
                <StatButton
                  label="FO Win"
                  onPress={() => handlePlayerStatIncrement('faceOffWins')}
                  color={colors.green}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 14 }}
                />
                <StatButton
                  label="FO Loss"
                  onPress={() => handlePlayerStatIncrement('faceOffLosses')}
                  color={colors.softRed}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 14 }}
                />
                <StatButton
                  label="Plus"
                  onPress={() => handlePlayerStatIncrement('plus')}
                  color={colors.yellow}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 14 }}
                />
                <StatButton
                  label="Minus"
                  onPress={() => handlePlayerStatIncrement('minus')}
                  color={colors.red}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 14 }}
                />
              </View>
            </View>

            {/* Player Stats Summary */}
            <View style={[commonStyles.card]}>
              <Text style={styles.sectionTitle}>Player Stats - Period {game.period}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.statsTable}>
                  <View style={styles.statsHeader}>
                    <Text style={styles.statsHeaderText}>#</Text>
                    <Text style={styles.statsHeaderText}>Shots</Text>
                    <Text style={styles.statsHeaderText}>FO+</Text>
                    <Text style={styles.statsHeaderText}>FO-</Text>
                    <Text style={styles.statsHeaderText}>+</Text>
                    <Text style={styles.statsHeaderText}>-</Text>
                  </View>
                  {game.home.players.map((p) => (
                    <View key={p.number} style={styles.statsRow}>
                      <Text style={styles.statsCell}>{p.number}</Text>
                      <Text style={styles.statsCell}>{p.shots}</Text>
                      <Text style={styles.statsCell}>{p.faceOffWins}</Text>
                      <Text style={styles.statsCell}>{p.faceOffLosses}</Text>
                      <Text style={styles.statsCell}>{p.plus}</Text>
                      <Text style={styles.statsCell}>{p.minus}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <Button text="End Game & Save" onPress={onEndGame} style={{ backgroundColor: colors.green }} />
          <Button text="Reset Current Game" onPress={resetCurrentGame} style={{ backgroundColor: colors.softRed }} />
        </View>
      </ScrollView>

      <BottomSheetSettings
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        teamNames={{ home: game.home.name, away: game.away?.name || 'Away' }}
        onChangeNames={({ home, away }) => setTeamNames(home, away)}
        mode={game.mode}
        onToggleMode={(m) => setMode(m)}
        onOpenPlayerSetup={() => {
          setSheetOpen(false);
          router.push('/player-setup');
        }}
        goalies={game.home.goalies}
        selectedGoalie={game.home.selectedGoalie || 0}
        onGoalieChange={handleGoalieChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  periodTitle: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 24,
    marginBottom: 12,
  },
  totalShotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  nextPeriodBtn: {
    backgroundColor: colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  teamsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  teamCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
    borderWidth: 3,
    boxShadow: '0px 6px 0px ' + colors.outline,
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 18,
  },
  goalieLabel: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
    fontSize: 14,
    marginBottom: 12,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shiftBtn: {
    width: 40,
    height: 40,
    minHeight: 40,
    borderRadius: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerContainer: {
    alignItems: 'center',
  },
  playerSelectBtn: {
    minHeight: 80,
    width: '100%',
  },
  playerStatsContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  playerStatText: {
    fontFamily: 'Fredoka_400Regular',
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  shotBtn: {
    width: '100%',
    minHeight: 80,
    marginBottom: 12,
  },
  eventBtn: {
    width: '45%',
    minHeight: 70,
  },
  statsTable: {
    minWidth: 300,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statsHeaderText: {
    color: colors.white,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  statsCell: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.text,
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
});
