
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Mode, PlayerStat, TeamStats, PeriodStats, GoalieStat } from '../types';

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

const defaultGoalies = (count = 2): GoalieStat[] =>
  Array.from({ length: count }).map((_, i) => ({
    name: `Goalie ${i + 1}`,
    shotsAgainst: 0,
  }));

const emptyTeamStats = (name: string): TeamStats => ({
  name,
  shots: 0,
  players: defaultPlayers(),
  goalies: defaultGoalies(),
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
    console.log('useGame hook initialized');
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      console.log('Loading game from storage...');
      const stored = await AsyncStorage.getItem(CURRENT_GAME_KEY);
      if (stored) {
        console.log('Found stored game, parsing...');
        const parsed: Game = JSON.parse(stored);
        
        // Migrate old games to new format
        if (!parsed.period) parsed.period = 1;
        if (!parsed.selectedPlayer) parsed.selectedPlayer = null;
        if (parsed.shiftMode === undefined) parsed.shiftMode = false;
        if (!parsed.periodStats) parsed.periodStats = {};
        
        // Migrate old goalie format to new format
        if (!parsed.home.goalies || typeof parsed.home.goalies[0] === 'string') {
          const oldGoalies = parsed.home.goalies as any[] || ['Goalie 1', 'Goalie 2'];
          parsed.home.goalies = oldGoalies.map((name, index) => ({
            name: typeof name === 'string' ? name : `Goalie ${index + 1}`,
            shotsAgainst: 0,
          }));
          parsed.home.selectedGoalie = parsed.home.selectedGoalie || 0;
        }
        
        if (parsed.away && (!parsed.away.goalies || typeof parsed.away.goalies[0] === 'string')) {
          const oldGoalies = parsed.away.goalies as any[] || ['Goalie 1', 'Goalie 2'];
          parsed.away.goalies = oldGoalies.map((name, index) => ({
            name: typeof name === 'string' ? name : `Goalie ${index + 1}`,
            shotsAgainst: 0,
          }));
          parsed.away.selectedGoalie = parsed.away.selectedGoalie || 0;
        }
        
        // Migrate old player stats to new format
        parsed.home.players = parsed.home.players.map(p => ({
          ...p,
          faceOffWins: (p as any).faceoffsWon || p.faceOffWins || 0,
          faceOffLosses: p.faceOffLosses || 0,
          plus: Math.max(0, (p as any).plusMinus || p.plus || 0),
          minus: Math.max(0, -(p as any).plusMinus || p.minus || 0),
        }));
        
        if (parsed.away) {
          parsed.away.players = parsed.away.players.map(p => ({
            ...p,
            faceOffWins: (p as any).faceoffsWon || p.faceOffWins || 0,
            faceOffLosses: p.faceOffLosses || 0,
            plus: Math.max(0, (p as any).plusMinus || p.plus || 0),
            minus: Math.max(0, -(p as any).plusMinus || p.minus || 0),
          }));
        }
        
        console.log('Game loaded successfully');
        setGame(parsed);
      } else {
        console.log('No stored game found, using empty game');
      }
    } catch (e) {
      console.error('Failed to load game:', e);
      // Reset to empty game on error
      setGame(emptyGame());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      saveGame();
    }
  }, [game, loading]);

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
      console.log('Game saved successfully');
    } catch (e) {
      console.error('Failed to persist game:', e);
    }
  };

  const setMode = (mode: Mode) => {
    console.log('Setting mode to:', mode);
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
    console.log('Starting next period');
    // Save current period stats first
    setGame((g) => {
      const periodStats: PeriodStats = {
        teamStats: {
          home: { ...g.home },
          away: g.away ? { ...g.away } : undefined,
        },
        playerStats: {},
      };

      // Save player stats for current period
      g.home.players.forEach(player => {
        periodStats.playerStats[player.number] = { ...player };
      });

      if (g.away) {
        g.away.players.forEach(player => {
          periodStats.playerStats[`away_${player.number}`] = { ...player };
        });
      }

      // Reset counters for the new period
      const resetPlayerStats = (players: PlayerStat[]): PlayerStat[] =>
        players.map(p => ({
          ...p,
          shots: 0,
          faceOffWins: 0,
          faceOffLosses: 0,
          plus: 0,
          minus: 0,
        }));

      const resetGoalieStats = (goalies: GoalieStat[]): GoalieStat[] =>
        goalies.map(g => ({
          ...g,
          shotsAgainst: 0,
        }));

      return {
        ...g,
        period: g.period + 1,
        periodStats: {
          ...g.periodStats,
          [g.period]: periodStats,
        },
        home: {
          ...g.home,
          shots: 0,
          players: resetPlayerStats(g.home.players),
          goalies: resetGoalieStats(g.home.goalies),
        },
        away: g.away ? {
          ...g.away,
          shots: 0,
          players: resetPlayerStats(g.away.players),
          goalies: resetGoalieStats(g.away.goalies),
        } : undefined,
        selectedPlayer: null,
      };
    });
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
    applyToTeam(team, (t) => {
      const newShots = Math.max(0, t.shots + delta);
      // Also increment shots against for selected goalie
      const updatedGoalies = [...t.goalies];
      if (t.selectedGoalie !== null && updatedGoalies[t.selectedGoalie]) {
        updatedGoalies[t.selectedGoalie] = {
          ...updatedGoalies[t.selectedGoalie],
          shotsAgainst: Math.max(0, updatedGoalies[t.selectedGoalie].shotsAgainst + delta),
        };
      }
      return { ...t, shots: newShots, goalies: updatedGoalies };
    });

  const incrementPlayerStat = (team: 'home' | 'away', number: string, statName: keyof PlayerStat, delta = 1) => {
    const actualDelta = game.shiftMode ? -delta : delta;
    console.log(`Incrementing ${statName} for player ${number} on team ${team} by ${actualDelta}`);
    
    setGame((g) => {
      const teamData = team === 'home' ? g.home : g.away;
      if (!teamData) return g;
      
      const playerIndex = teamData.players.findIndex(p => p.number === number);
      if (playerIndex === -1) return g;
      
      const updatedPlayers = [...teamData.players];
      const currentPlayer = updatedPlayers[playerIndex];
      const newStat = Math.max(0, (currentPlayer[statName] as number) + actualDelta);
      
      updatedPlayers[playerIndex] = {
        ...currentPlayer,
        [statName]: newStat,
      };
      
      // If it's a shot, also increment shots against for selected goalie
      let updatedGoalies = [...teamData.goalies];
      if (statName === 'shots' && actualDelta > 0) {
        console.log(`Shot recorded, updating goalie stats for team ${team}`);
        if (teamData.selectedGoalie !== null && updatedGoalies[teamData.selectedGoalie]) {
          console.log(`Updating shots against for goalie ${teamData.selectedGoalie}: ${updatedGoalies[teamData.selectedGoalie].shotsAgainst} + ${actualDelta}`);
          updatedGoalies[teamData.selectedGoalie] = {
            ...updatedGoalies[teamData.selectedGoalie],
            shotsAgainst: updatedGoalies[teamData.selectedGoalie].shotsAgainst + actualDelta,
          };
        }
      }
      
      return {
        ...g,
        [team]: {
          ...teamData,
          players: updatedPlayers,
          goalies: updatedGoalies,
        }
      };
    });
  };

  // New function to increment stats for multiple players
  const incrementMultiplePlayerStats = (team: 'home' | 'away', playerNumbers: string[], statName: keyof PlayerStat, delta = 1) => {
    const actualDelta = game.shiftMode ? -delta : delta;
    console.log(`Incrementing ${statName} for players ${playerNumbers.join(', ')} on team ${team} by ${actualDelta}`);
    
    setGame((g) => {
      const teamData = team === 'home' ? g.home : g.away;
      if (!teamData) return g;
      
      const updatedPlayers = teamData.players.map(player => {
        if (playerNumbers.includes(player.number)) {
          const newStat = Math.max(0, (player[statName] as number) + actualDelta);
          return {
            ...player,
            [statName]: newStat,
          };
        }
        return player;
      });
      
      return {
        ...g,
        [team]: {
          ...teamData,
          players: updatedPlayers,
        }
      };
    });
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
    console.log('Setting selected player to:', playerNumber);
    setGame((g) => ({ ...g, selectedPlayer: playerNumber ? parseInt(playerNumber) : null }));
  };

  const toggleShiftMode = () => {
    console.log('Toggling shift mode');
    setGame((g) => ({ ...g, shiftMode: !g.shiftMode }));
  };

  const setGoalieCount = (team: 'home' | 'away', count: number) => {
    const clampedCount = Math.max(1, Math.min(5, count)); // Allow 1-5 goalies
    applyToTeam(team, (t) => {
      const currentGoalies = [...t.goalies];
      const newGoalies: GoalieStat[] = [];
      
      for (let i = 0; i < clampedCount; i++) {
        if (currentGoalies[i]) {
          newGoalies.push(currentGoalies[i]);
        } else {
          newGoalies.push({
            name: `Goalie ${i + 1}`,
            shotsAgainst: 0,
          });
        }
      }
      
      // Adjust selected goalie if necessary
      const newSelectedGoalie = t.selectedGoalie !== null && t.selectedGoalie < clampedCount 
        ? t.selectedGoalie 
        : 0;
      
      return { ...t, goalies: newGoalies, selectedGoalie: newSelectedGoalie };
    });
  };

  const updateGoalieName = (team: 'home' | 'away', index: number, name: string) => {
    console.log(`Updating goalie name for team ${team}, index ${index}, name: ${name}`);
    setGame((g) => {
      const teamData = team === 'home' ? g.home : g.away;
      if (!teamData) return g;
      
      const updatedGoalies = [...teamData.goalies];
      if (updatedGoalies[index]) {
        updatedGoalies[index] = { ...updatedGoalies[index], name };
        console.log(`Updated goalie ${index} name to: ${name}`);
      }
      
      return {
        ...g,
        [team]: {
          ...teamData,
          goalies: updatedGoalies,
        }
      };
    });
  };

  const selectGoalie = (team: 'home' | 'away', goalieIndex: number) =>
    applyToTeam(team, (t) => ({ ...t, selectedGoalie: goalieIndex }));

  const getTotalShotsForPeriod = (period: number): number => {
    // If asking for current period, use current stats
    if (period === game.period) {
      return game.home.players.reduce((sum, p) => sum + p.shots, 0);
    }
    
    // Otherwise, get from saved period stats
    const periodData = game.periodStats[period];
    if (!periodData) return 0;
    
    let totalShots = 0;
    for (const playerNumber in periodData.playerStats) {
      if (!playerNumber.startsWith('away_')) { // Only count home team in player mode
        totalShots += periodData.playerStats[playerNumber]?.shots || 0;
      }
    }
    return totalShots;
  };

  const resetCurrentGame = () => {
    console.log('Resetting current game');
    setGame(emptyGame());
  };

  const saveToHistory = async () => {
    try {
      console.log('Saving game to history');
      // Save current period stats before saving to history
      const gameToSave = { ...game };
      
      // Save current period stats
      const periodStats: PeriodStats = {
        teamStats: {
          home: { ...gameToSave.home },
          away: gameToSave.away ? { ...gameToSave.away } : undefined,
        },
        playerStats: {},
      };

      gameToSave.home.players.forEach(player => {
        periodStats.playerStats[player.number] = { ...player };
      });

      if (gameToSave.away) {
        gameToSave.away.players.forEach(player => {
          periodStats.playerStats[`away_${player.number}`] = { ...player };
        });
      }

      gameToSave.periodStats = {
        ...gameToSave.periodStats,
        [gameToSave.period]: periodStats,
      };
      
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history: Game[] = stored ? JSON.parse(stored) : [];
      const newHistory = [gameToSave, ...history].slice(0, 20);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      console.log('Game saved to history successfully');
      return true;
    } catch (e) {
      console.error('Failed to save history:', e);
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
      console.error('Failed to delete from history:', e);
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
    incrementMultiplePlayerStats,
    setPlayerNumbers,
    setSelectedPlayer,
    toggleShiftMode,
    setGoalieCount,
    updateGoalieName,
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
    console.error('Failed to load history:', e);
    return [];
  }
}

export async function deleteGameFromHistory(gameId: string): Promise<boolean> {
  try {
    console.log('Deleting game from history:', gameId);
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Game[] = stored ? JSON.parse(stored) : [];
    const newHistory = history.filter(g => g.id !== gameId);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    console.log('Game deleted from history successfully');
    return true;
  } catch (e) {
    console.error('Failed to delete from history:', e);
    return false;
  }
}
