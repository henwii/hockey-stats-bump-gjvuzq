
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import StatButton from '../components/StatButton';
import DoughnutChart from '../components/DoughnutChart';
import PlayerSelectionModal from '../components/PlayerSelectionModal';
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
    incrementMultiplePlayerStats,
    setSelectedPlayer,
    toggleShiftMode,
    setGoalieCount,
    updateGoalieName,
    selectGoalie,
    getTotalShotsForPeriod,
    resetCurrentGame,
    saveToHistory,
  } = useGame();

  const { width } = useWindowDimensions();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [playerModalVisible, setPlayerModalVisible] = React.useState(false);
  const [modalStatType, setModalStatType] = React.useState<'plus' | 'minus'>('plus');

  React.useEffect(() => {
    console.log('Game loaded', game.id, 'Period:', game.period);
  }, [game.id, game.period]);

  // Set first player as default when in player mode and no player is selected
  React.useEffect(() => {
    if (game.mode === 'players' && game.selectedPlayer === null && game.home.players.length > 0) {
      console.log('Setting default player to first player:', game.home.players[0].number);
      setSelectedPlayer(game.home.players[0].number);
    }
  }, [game.mode, game.selectedPlayer, game.home.players, setSelectedPlayer]);

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

  const handlePlayerStatIncrement = (statName: keyof typeof game.home.players[0]) => {
    if (game.selectedPlayer === null) {
      console.log('No player selected');
      return;
    }
    
    const playerNumber = String(game.selectedPlayer);
    incrementPlayerStat('home', playerNumber, statName as any);
  };

  const handlePlusMinusPress = (statType: 'plus' | 'minus') => {
    setModalStatType(statType);
    setPlayerModalVisible(true);
  };

  const handlePlayerSelectionSubmit = (selectedPlayers: string[]) => {
    console.log(`Applying ${modalStatType} to players:`, selectedPlayers);
    incrementMultiplePlayerStats('home', selectedPlayers, modalStatType);
  };

  const totalShotsCurrentPeriod = game.mode === 'players' ? getTotalShotsForPeriod(game.period) : 0;

  const handleGoalieCountChange = (count: number) => {
    setGoalieCount('home', count);
    if (game.away) {
      setGoalieCount('away', count);
    }
  };

  const getPlayerStats = (playerNumber: string) => {
    const player = game.home.players.find(p => p.number === playerNumber);
    return player || { shots: 0, faceOffWins: 0, faceOffLosses: 0, plus: 0, minus: 0 };
  };

  const getPlayerButtonWidth = () => {
    return '31%'; // 3 buttons per row as requested
  };

  const renderGoalieButtons = (team: 'home' | 'away') => {
    const teamData = team === 'home' ? game.home : game.away;
    if (!teamData) return null;

    return (
      <View style={styles.goalieSection}>
        <Text style={styles.goalieTitle}>Select Goalie:</Text>
        <View style={styles.goalieButtonsRow}>
          {teamData.goalies.map((goalie, index) => (
            <View key={index} style={styles.goalieButtonContainer}>
              <StatButton
                label={goalie.name}
                onPress={() => selectGoalie(team, index)}
                color={teamData.selectedGoalie === index ? colors.green : colors.blue}
                style={styles.goalieButton}
                textStyle={{ fontSize: 12, fontWeight: 'bold' }}
              />
              <Text style={styles.goalieStats}>
                Shots: {goalie.shotsAgainst}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
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
              <TouchableOpacity 
                style={styles.nextPeriodContainer}
                onPress={nextPeriod}
                accessibilityLabel="Next Period"
              >
                <View style={styles.nextPeriodIconBtn}>
                  <Ionicons name="play-forward" size={20} color={colors.white} />
                </View>
              </TouchableOpacity>
              
              {/* Home and Away cards as children */}
              <View style={styles.teamsRow}>
                <View style={[styles.teamCard, { borderColor: colors.blue }]}>
                  <Text style={styles.teamName}>{game.home.name}</Text>
                  
                  <DoughnutChart
                    shots={game.home.shots}
                    label={`${game.home.shots}`}
                    color={colors.blue}
                    size={60}
                  />
                  
                  {/* Goalie Selection for Home Team - Below the counter, in a row */}
                  {renderGoalieButtons('home')}
                  
                  <View style={{ width: '100%' }}>
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
                    size={60}
                  />
                  
                  {/* Goalie Selection for Away Team - Below the counter, in a row */}
                  {renderGoalieButtons('away')}
                  
                  <View style={{ width: '100%' }}>
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
            {/* Total Shots Card with Next Period Button and Goalie Selection */}
            <View style={[commonStyles.card, { alignItems: 'center' }]}>
              <View style={styles.totalShotsHeader}>
                <Text style={styles.sectionTitle}>Total Shots - Period {game.period}</Text>
                <TouchableOpacity 
                  style={styles.nextPeriodContainer}
                  onPress={nextPeriod}
                  accessibilityLabel="Next Period"
                >
                  <View style={styles.nextPeriodIconBtn}>
                    <Ionicons name="play-forward" size={16} color={colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
              <DoughnutChart
                shots={totalShotsCurrentPeriod}
                label={`${totalShotsCurrentPeriod}`}
                color={colors.blue}
                size={60}
              />
              
              {/* Goalie Selection for Player Mode - in a row */}
              {renderGoalieButtons('home')}
            </View>

            {/* Merged Select Player and Count Event Card */}
            <View style={[commonStyles.card]}>
              <View style={styles.mergedCardHeader}>
                <Text style={styles.sectionTitle}>Select Player & Count Event</Text>
                <TouchableOpacity 
                  style={styles.shiftContainer}
                  onPress={toggleShiftMode}
                  accessibilityLabel="Toggle Shift Mode"
                >
                  <View style={[styles.shiftBtn, { backgroundColor: game.shiftMode ? colors.yellow : colors.muted }]}>
                    <Ionicons name="swap-vertical" size={16} color={colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionSubtitle}>
                {game.selectedPlayer ? `Selected: #${game.selectedPlayer}` : 'No player selected'} | 
                {game.shiftMode ? ' SHIFT MODE: Counting DOWN' : ' Normal: Counting UP'}
              </Text>
              
              <View style={styles.mergedCardContent}>
                {/* Player Selection on the Left */}
                <View style={styles.playerSelectionSection}>
                  <Text style={styles.subsectionTitle}>Players</Text>
                  <View style={styles.playerGrid}>
                    {game.home.players.map((p) => {
                      const stats = getPlayerStats(p.number);
                      const isSelected = game.selectedPlayer === parseInt(p.number);
                      return (
                        <View key={p.number} style={[styles.playerContainer, { width: getPlayerButtonWidth() }]}>
                          <StatButton
                            label={`#${p.number}`}
                            onPress={() => setSelectedPlayer(p.number)}
                            color={isSelected ? colors.green : colors.blue}
                            style={styles.playerSelectBtn}
                            textStyle={{ fontSize: 16, fontWeight: 'bold' }}
                          />
                          <View style={styles.playerStatsContainer}>
                            <Text style={styles.playerStatText}>S:{stats.shots}</Text>
                            <Text style={styles.playerStatText}>FO+:{stats.faceOffWins}</Text>
                            <Text style={styles.playerStatText}>FO-:{stats.faceOffLosses}</Text>
                            <Text style={styles.playerStatText}>+:{stats.plus} -:{stats.minus}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Event Counters on the Right */}
                <View style={styles.eventCountersSection}>
                  <Text style={styles.subsectionTitle}>Events</Text>
                  <View style={styles.eventCountersGrid}>
                    <StatButton
                      label="Shot"
                      onPress={() => handlePlayerStatIncrement('shots')}
                      color={colors.blue}
                      style={styles.shotBtn}
                      textStyle={{ fontSize: 16, fontWeight: 'bold' }}
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
                      onPress={() => handlePlusMinusPress('plus')}
                      color={colors.yellow}
                      style={styles.eventBtn}
                      textStyle={{ fontSize: 14 }}
                    />
                    <StatButton
                      label="Minus"
                      onPress={() => handlePlusMinusPress('minus')}
                      color={colors.red}
                      style={styles.eventBtn}
                      textStyle={{ fontSize: 14 }}
                    />
                  </View>
                </View>
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

      <PlayerSelectionModal
        visible={playerModalVisible}
        onClose={() => setPlayerModalVisible(false)}
        players={game.home.players}
        onSubmit={handlePlayerSelectionSubmit}
        title={`Select Players for ${modalStatType === 'plus' ? 'Plus' : 'Minus'}`}
      />

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
        goalieCount={game.home.goalies.length}
        onGoalieCountChange={handleGoalieCountChange}
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
  nextPeriodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPeriodIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 0px ' + colors.outline,
  },
  goalieSection: {
    width: '100%',
    marginVertical: 12,
  },
  goalieTitle: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  goalieButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  goalieButtonContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  goalieButton: {
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  goalieStats: {
    fontFamily: 'Fredoka_400Regular',
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
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
  mergedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shiftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 0px ' + colors.outline,
  },
  mergedCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  playerSelectionSection: {
    flex: 2,
  },
  divider: {
    width: 2,
    backgroundColor: colors.outline,
    marginVertical: 8,
  },
  eventCountersSection: {
    flex: 1,
  },
  subsectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  playerContainer: {
    alignItems: 'center',
  },
  playerSelectBtn: {
    minHeight: 60,
    width: '100%',
  },
  playerStatsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  playerStatText: {
    fontFamily: 'Fredoka_400Regular',
    color: colors.muted,
    fontSize: 9,
    textAlign: 'center',
  },
  eventCountersGrid: {
    gap: 8,
  },
  eventBtn: {
    minHeight: 50,
    width: '100%',
  },
  shotBtn: {
    aspectRatio: 1, // Makes height equal to width
    width: '100%',
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
