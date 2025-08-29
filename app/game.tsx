
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
    setTeamNames,
    incrementTeamShots,
    incrementPlayerShot,
    incrementPlayerFaceoff,
    incrementPlayerPlusMinus,
    resetCurrentGame,
    saveToHistory,
  } = useGame();

  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    console.log('Game loaded', game.id);
  }, [game.id]);

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

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Game"
        right={
          <Button
            text="Settings"
            onPress={() => setSheetOpen(true)}
            style={{ width: undefined, paddingHorizontal: 14, paddingVertical: 8 }}
          />
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Team section with shots and doughnuts */}
        <View style={styles.teamsRow}>
          <View style={[styles.teamCard, { borderColor: colors.blue }]}>
            <Text style={styles.teamName}>{game.home.name}</Text>
            <DoughnutChart
              shots={game.home.shots}
              label={`${game.home.shots}/100`}
              color={colors.blue}
            />
            {game.mode === 'team' ? (
              <View style={{ width: '100%' }}>
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
            ) : null}
          </View>

          <View style={[styles.teamCard, { borderColor: colors.red }]}>
            <Text style={styles.teamName}>{game.away.name}</Text>
            <DoughnutChart
              shots={game.away.shots}
              label={`${game.away.shots}/100`}
              color={colors.red}
            />
            {game.mode === 'team' ? (
              <View style={{ width: '100%' }}>
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
            ) : null}
          </View>
        </View>

        {/* Player mode controls */}
        {game.mode === 'players' ? (
          <View style={[commonStyles.card]}>
            <Text style={styles.sectionTitle}>Player Counters</Text>
            <Text style={styles.sectionSubtitle}>Tap jersey numbers to add stats</Text>
            <View style={styles.playersGrid}>
              {/* Home players */}
              <Text style={styles.groupTitle}>{game.home.name}</Text>
              <View style={styles.grid}>
                {game.home.players.map((p) => (
                  <View key={`home-${p.number}`} style={styles.playerTile}>
                    <StatButton
                      label={`#${p.number} Shots`}
                      onPress={() => incrementPlayerShot('home', p.number, 1)}
                      color={colors.blue}
                      count={p.shots}
                      style={{ minWidth: 140 }}
                    />
                    <View style={styles.inlineRow}>
                      <StatButton
                        label="FO+"
                        onPress={() => incrementPlayerFaceoff('home', p.number, 1)}
                        color={colors.yellow}
                        style={styles.smallBtn}
                      />
                      <StatButton
                        label="+1"
                        onPress={() => incrementPlayerPlusMinus('home', p.number, 1)}
                        color={colors.green}
                        style={styles.smallBtn}
                      />
                      <StatButton
                        label="-1"
                        onPress={() => incrementPlayerPlusMinus('home', p.number, -1)}
                        color={colors.softRed}
                        style={styles.smallBtn}
                      />
                    </View>
                    <Text style={styles.tileStats}>
                      S:{p.shots} | FO:{p.faceoffsWon} | +/-:{p.plusMinus}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Away players */}
              <Text style={styles.groupTitle}>{game.away.name}</Text>
              <View style={styles.grid}>
                {game.away.players.map((p) => (
                  <View key={`away-${p.number}`} style={styles.playerTile}>
                    <StatButton
                      label={`#${p.number} Shots`}
                      onPress={() => incrementPlayerShot('away', p.number, 1)}
                      color={colors.red}
                      count={p.shots}
                      style={{ minWidth: 140 }}
                    />
                    <View style={styles.inlineRow}>
                      <StatButton
                        label="FO+"
                        onPress={() => incrementPlayerFaceoff('away', p.number, 1)}
                        color={colors.yellow}
                        style={styles.smallBtn}
                      />
                      <StatButton
                        label="+1"
                        onPress={() => incrementPlayerPlusMinus('away', p.number, 1)}
                        color={colors.green}
                        style={styles.smallBtn}
                      />
                      <StatButton
                        label="-1"
                        onPress={() => incrementPlayerPlusMinus('away', p.number, -1)}
                        color={colors.softRed}
                        style={styles.smallBtn}
                      />
                    </View>
                    <Text style={styles.tileStats}>
                      S:{p.shots} | FO:{p.faceoffsWon} | +/-:{p.plusMinus}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          <Button text="End Game & Save" onPress={onEndGame} style={{ backgroundColor: colors.green }} />
          <Button text="Reset Current Game" onPress={resetCurrentGame} style={{ backgroundColor: colors.softRed }} />
        </View>
      </ScrollView>

      <BottomSheetSettings
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        teamNames={{ home: game.home.name, away: game.away.name }}
        onChangeNames={({ home, away }) => setTeamNames(home, away)}
        mode={game.mode}
        onToggleMode={(m) => setMode(m)}
        onOpenPlayerSetup={() => {
          setSheetOpen(false);
          router.push('/player-setup');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  playersGrid: {
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playerTile: {
    width: '48%',
    backgroundColor: colors.offWhite,
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: 16,
    padding: 10,
    boxShadow: '0px 6px 0px ' + colors.outline,
  },
  inlineRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  smallBtn: {
    minHeight: 60,
    flex: 1,
  },
  tileStats: {
    marginTop: 8,
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
  },
});
