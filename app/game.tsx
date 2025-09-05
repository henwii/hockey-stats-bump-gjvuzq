
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
    
    // Auto-deselect player after stat increment
    setSelectedPlayer(null);
  };

  const totalShotsCurrentPeriod = game.mode === 'players' ? getTotalShotsForPeriod(game.period) : 0;

  const handleGoalieChange = (goalies: string[], selected: number) => {
    setGoalies('home', goalies);
    selectGoalie('home', selected);
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
        {/* Period Controls */}
        <View style={[commonStyles.card, { alignItems: 'center' }]}>
          <Text style={styles.periodTitle}>Period {game.period}</Text>
          <Button
            text="Next Period"
            onPress={nextPeriod}
            style={{ backgroundColor: colors.green, width: 200 }}
          />
        </View>

        {/* Team Mode */}
        {game.mode === 'team' && game.away && (
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
                  count={game.home.shots}
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
                  count={game.away.shots}
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
        )}

        {/* Player Mode */}
        {game.mode === 'players' && (
          <>
            {/* Overview Counter */}
            <View style={[commonStyles.card, { alignItems: 'center' }]}>
              <Text style={styles.sectionTitle}>Total Shots - Period {game.period}</Text>
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
                {game.home.players.map((p) => (
                  <StatButton
                    key={p.number}
                    label={`#${p.number}`}
                    onPress={() => setSelectedPlayer(p.number)}
                    color={game.selectedPlayer === parseInt(p.number) ? colors.green : colors.blue}
                    style={[styles.playerSelectBtn, { width: getTileWidth(game.home.players.length) }]}
                    textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                  />
                ))}
              </View>
            </View>

            {/* Event Counters */}
            <View style={[commonStyles.card]}>
              <Text style={styles.sectionTitle}>2. Count Event</Text>
              <View style={styles.shiftRow}>
                <Text style={styles.sectionSubtitle}>
                  {game.shiftMode ? 'SHIFT MODE: Counting DOWN' : 'Normal: Counting UP'}
                </Text>
                <StatButton
                  label={game.shiftMode ? 'SHIFT ON' : 'SHIFT OFF'}
                  onPress={toggleShiftMode}
                  color={game.shiftMode ? colors.yellow : colors.muted}
                  style={{ width: 120, height: 40 }}
                  textStyle={{ fontSize: 14 }}
                />
              </View>
              
              <View style={styles.eventGrid}>
                <StatButton
                  label="Shot"
                  onPress={() => handlePlayerStatIncrement('shots')}
                  color={colors.blue}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 16 }}
                />
                <StatButton
                  label="FO Win"
                  onPress={() => handlePlayerStatIncrement('faceOffWins')}
                  color={colors.green}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 16 }}
                />
                <StatButton
                  label="FO Loss"
                  onPress={() => handlePlayerStatIncrement('faceOffLosses')}
                  color={colors.softRed}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 16 }}
                />
                <StatButton
                  label="Plus"
                  onPress={() => handlePlayerStatIncrement('plus')}
                  color={colors.yellow}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 16 }}
                />
                <StatButton
                  label="Minus"
                  onPress={() => handlePlayerStatIncrement('minus')}
                  color={colors.red}
                  style={styles.eventBtn}
                  textStyle={{ fontSize: 16 }}
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
  teamsRow: {
    flexDirection: 'row',
    gap: 12,
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
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerSelectBtn: {
    minHeight: 60,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventBtn: {
    width: '30%',
    minHeight: 60,
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
