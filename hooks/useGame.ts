
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Mode, PlayerStat, TeamStats } from '../types';

const CURRENT_GAME_KEY = 'current_game';
const HISTORY_KEY = 'games_history';

const defaultPlayers = (count = 12): PlayerStat[] =>
  Array.from({ length: count }).map((_, i) => ({
    number: String(i + 1),
    shots: 0,
    faceOffWins: 0,
    faceOffLosses: 0,
    plus: 0,
    minus: 0,
  }));

const emptyTeamStats = (name: string): TeamStats => ({
  name,
  shots: 0,
  players: defaultPlayers(),
  goalies: ['Goalie 1', 'Goalie 2', 'Goalie 3'],
  selectedGoalie: 0,
});

const emptyGame = (): Game => ({
  id: String(Date.now()),
  date: new Date().toISOString(),
  mode: 'team',
  period: 1,
  home: emptyTeamStats('Home'),
  away: emptyTeamStats('Away'),
  selectedPlayer: null,
  shiftMode: false,
  periodStats: {},
});

export function useGame() {
  const [game, setGame] = useState<Game>(emptyGame());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CURRENT_GAME_KEY);
        if (stored) {
          const parsed: Game = JSON.parse(stored);
          // Migrate old games to new format
          if (!parsed.period) parsed.period = 1;
          if (!parsed.selectedPlayer) parsed.selectedPlayer = null;
          if (parsed.shiftMode === undefined) parsed.shiftMode = false;
          if (!parsed.periodStats) parsed.periodStats = {};
          if (!parsed.home.goalies) {
            parsed.home.goalies = ['Goalie 1', 'Goalie 2', 'Goalie 3'];
            parsed.home.selectedGoalie = 0;
          }
          if (parsed.away && !parsed.away.goalies) {
            parsed.away.goalies = ['Goalie 1', 'Goalie 2', 'Goalie 3'];
            parsed.away.selectedGoalie = 0;
          }
          // Migrate old player stats to new format
          parsed.home.players = parsed.home.players.map(p => ({
            ...p,
            faceOffWins: (p as any).faceoffsWon || 0,
            faceOffLosses: 0,
            plus: Math.max(0, (p as any).plusMinus || 0),
            minus: Math.max(0, -(p as any).plusMinus || 0),
          }));
          if (parsed.away) {
            parsed.away.players = parsed.away.players.map(p => ({
              ...p,
              faceOffWins: (p as any).faceoffsWon || 0,
              faceOffLosses: 0,
              plus: Math.max(0, (p as any).plusMinus || 0),
              minus: Math.max(0, -(p as any).plusMinus || 0),
            }));
          }
          setGame(parsed);
        }
      } catch (e) {
        console.log('Failed to load game', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
      } catch (e) {
        console.log('Failed to persist game', e);
      }
    })();
  }, [game]);

  const setMode = (mode: Mode) => {
    setGame((g) => {
      const newGame = { ...g, mode };
      // In player mode, remove away team
      if (mode === 'players') {
        newGame.away = undefined;
      } else if (!newGame.away) {
        // In team mode, ensure away team exists
        newGame.away = emptyTeamStats('Away');
      }
      return newGame;
    });
  };

  const nextPeriod = () => {
    setGame((g) => ({ ...g, period: g.period + 1 }));
  };

  const setTeamNames = (home: string, away?: string) =>
    setGame((g) => ({
      ...g,
      home: { ...g.home, name: home },
      away: g.away && away ? { ...g.away, name: away } : g.away,
    }));

  const applyToTeam = (team: 'home' | 'away', updater: (t: TeamStats) => TeamStats) =>
    setGame((g) => {
      if (team === 'away' && !g.away) return g;
      return { ...g, [team]: updater((g as any)[team]) } as Game;
    });

  const incrementTeamShots = (team: 'home' | 'away', delta = 1) =>
    applyToTeam(team, (t) => ({ ...t, shots: Math.max(0, t.shots + delta) }));

  const findPlayerIndex = (t: TeamStats, number: string) => t.players.findIndex((p) => p.number === number);

  const updatePlayer = (
    team: 'home' | 'away',
    number: string,
    updater: (p: PlayerStat) => PlayerStat
  ) =>
    applyToTeam(team, (t) => {
      const idx = findPlayerIndex(t, number);
      if (idx === -1) return t;
      const updated = [...t.players];
      updated[idx] = updater(updated[idx]);
      return { ...t, players: updated };
    });

  const incrementPlayerStat = (team: 'home' | 'away', number: string, statName: keyof PlayerStat, delta = 1) => {
    const actualDelta = game.shiftMode ? -delta : delta;
    updatePlayer(team, number, (p) => ({
      ...p,
      [statName]: Math.max(0, (p[statName] as number) + actualDelta),
    }));
  };

  const setPlayerNumbers = (team: 'home' | 'away', numbers: string[]) =>
    applyToTeam(team, (t) => {
      const map = new Map(t.players.map((p) => [p.number, p]));
      const newPlayers: PlayerStat[] = numbers.map((n) => {
        const existing = map.get(n.trim());
        return (
          existing || {
            number: n.trim(),
            shots: 0,
            faceOffWins: 0,
            faceOffLosses: 0,
            plus: 0,
            minus: 0,
          }
        );
      });
      return { ...t, players: newPlayers };
    });

  const setSelectedPlayer = (playerNumber: string | null) => {
    setGame((g) => ({ ...g, selectedPlayer: playerNumber ? parseInt(playerNumber) : null }));
  };

  const toggleShiftMode = () => {
    setGame((g) => ({ ...g, shiftMode: !g.shiftMode }));
  };

  const setGoalies = (team: 'home' | 'away', goalies: string[]) =>
    applyToTeam(team, (t) => ({ ...t, goalies: goalies.slice(0, 3) }));

  const selectGoalie = (team: 'home' | 'away', goalieIndex: number) =>
    applyToTeam(team, (t) => ({ ...t, selectedGoalie: goalieIndex }));

  const getTotalShotsForPeriod = (period: number): number => {
    let totalShots = 0;
    for (const playerNumber in game.periodStats[period] || {}) {
      totalShots += game.periodStats[period][playerNumber]?.shots || 0;
    }
    // If no period stats, use current stats for current period
    if (period === game.period) {
      totalShots = game.home.players.reduce((sum, p) => sum + p.shots, 0);
    }
    return totalShots;
  };

  const resetCurrentGame = () => setGame(emptyGame());

  const saveToHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history: Game[] = stored ? JSON.parse(stored) : [];
      const newHistory = [game, ...history].slice(0, 20);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return true;
    } catch (e) {
      console.log('Failed to save history', e);
      return false;
    }
  };

  const deleteFromHistory = async (gameId: string) => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history: Game[] = stored ? JSON.parse(stored) : [];
      const newHistory = history.filter(g => g.id !== gameId);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return true;
    } catch (e) {
      console.log('Failed to delete from history', e);
      return false;
    }
  };

  return {
    game,
    loading,
    setMode,
    nextPeriod,
    setTeamNames,
    incrementTeamShots,
    incrementPlayerStat,
    setPlayerNumbers,
    setSelectedPlayer,
    toggleShiftMode,
    setGoalies,
    selectGoalie,
    getTotalShotsForPeriod,
    resetCurrentGame,
    saveToHistory,
    deleteFromHistory,
  };
}

export async function getHistory(): Promise<Game[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log('Failed to load history', e);
    return [];
  }
}

export async function deleteGameFromHistory(gameId: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Game[] = stored ? JSON.parse(stored) : [];
    const newHistory = history.filter(g => g.id !== gameId);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (e) {
    console.log('Failed to delete from history', e);
    return false;
  }
}
