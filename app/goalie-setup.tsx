
import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useGame } from '../hooks/useGame';
import { router } from 'expo-router';

export default function GoalieSetupScreen() {
  const { game, updateGoalieName, setGoalieCount } = useGame();
  
  // Initialize state for both teams
  const [homeGoalieNames, setHomeGoalieNames] = React.useState(
    game.home.goalies.map((g) => g.name).join(', ')
  );
  const [awayGoalieNames, setAwayGoalieNames] = React.useState(
    game.away ? game.away.goalies.map((g) => g.name).join(', ') : ''
  );
  const [goalieCount, setLocalGoalieCount] = React.useState(String(game.home.goalies.length));

  const parseNames = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSave = async () => {
    const count = parseInt(goalieCount);
    if (!isNaN(count) && count >= 1 && count <= 5) {
      console.log('Setting goalie count to:', count);
      
      // First set the count for both teams
      setGoalieCount('home', count);
      if (game.away) {
        setGoalieCount('away', count);
      }
      
      // Update home team goalie names
      const homeNames = parseNames(homeGoalieNames);
      console.log('Updating home goalie names:', homeNames);
      
      for (let i = 0; i < count; i++) {
        const name = homeNames[i] || `Goalie ${i + 1}`;
        console.log(`Updating home goalie ${i} to: ${name}`);
        updateGoalieName('home', i, name);
      }
      
      // Update away team goalie names if in team mode
      if (game.away) {
        const awayNames = parseNames(awayGoalieNames);
        console.log('Updating away goalie names:', awayNames);
        
        for (let i = 0; i < count; i++) {
          const name = awayNames[i] || `Goalie ${i + 1}`;
          console.log(`Updating away goalie ${i} to: ${name}`);
          updateGoalieName('away', i, name);
        }
      }
      
      console.log('Goalie configuration saved successfully');
    }
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Configure Goalies" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={commonStyles.card}>
          <Text style={styles.title}>Goalies Configuration</Text>
          
          <Text style={styles.label}>Number of goalies per team (1-5)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor={colors.muted}
            value={goalieCount}
            onChangeText={setLocalGoalieCount}
            keyboardType="numeric"
          />
          
          {/* Home Team Goalies */}
          <Text style={styles.teamTitle}>Home Team Goalies</Text>
          <Text style={styles.label}>Goalie names (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Smith, Johnson, Williams"
            placeholderTextColor={colors.muted}
            value={homeGoalieNames}
            onChangeText={setHomeGoalieNames}
          />
          
          {/* Away Team Goalies - only show in Team Mode */}
          {game.mode === 'team' && game.away && (
            <>
              <Text style={styles.teamTitle}>Away Team Goalies</Text>
              <Text style={styles.label}>Goalie names (comma-separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Brown, Davis, Miller"
                placeholderTextColor={colors.muted}
                value={awayGoalieNames}
                onChangeText={setAwayGoalieNames}
              />
            </>
          )}
          
          <Button
            text="Save Goalie Configuration"
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
  teamTitle: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
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
