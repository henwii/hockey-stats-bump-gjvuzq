
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, commonStyles } from '../styles/commonStyles';
import { Game } from '../types';
import { getHistory } from '../hooks/useGame';

export default function HistoryScreen() {
  const [history, setHistory] = React.useState<Game[]>([]);

  React.useEffect(() => {
    (async () => {
      const data = await getHistory();
      setHistory(data);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header title="History" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {history.length === 0 ? (
          <Text style={commonStyles.text}>No games saved yet.</Text>
        ) : (
          history.map((g) => (
            <View key={g.id} style={styles.card}>
              <Text style={styles.title}>{new Date(g.date).toLocaleString()}</Text>
              <Text style={styles.line}>
                {g.home.name} vs {g.away.name}
              </Text>
              <Text style={styles.line}>
                Shots: {g.home.name} {g.home.shots} - {g.away.shots} {g.away.name}
              </Text>
              <Text style={styles.mode}>Mode: {g.mode === 'team' ? 'Team' : 'Players'}</Text>
            </View>
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
  },
  mode: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
    marginTop: 4,
  },
});
