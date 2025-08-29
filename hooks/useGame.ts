
import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Mode, PlayerStat, TeamStats } from '../types';

const CURRENT_GAME_KEY = 'current_game';
const HISTORY_KEY = 'games_history';

const defaultPlayers = (count = 12): PlayerStat[] =>
  Array.from({ length: count }).map((_, i) => ({
    number: String(i + 1),
    shots: 0,
    faceoffsWon: 0,
    plusMinus: 0,
  }));

const emptyGame = (): Game => ({
  id: String(Date.now()),
  date: new Date().toISOString(),
  mode: 'team',
  home: { name: 'Home', shots: 0, players: defaultPlayers() },
  away: { name: 'Away', shots: 0, players: defaultPlayers() },
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

  const setMode = (mode: Mode) => setGame((g) => ({ ...g, mode }));

  const setTeamNames = (home: string, away: string) =>
    setGame((g) => ({ ...g, home: { ...g.home, name: home }, away: { ...g.away, name: away } }));

  const applyToTeam = (team: 'home' | 'away', updater: (t: TeamStats) => TeamStats) =>
    setGame((g) => ({ ...g, [team]: updater((g as any)[team]) } as Game));

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

  const incrementPlayerShot = (team: 'home' | 'away', number: string, delta = 1) =>
    updatePlayer(team, number, (p) => ({ ...p, shots: Math.max(0, p.shots + delta) }));

  const incrementPlayerFaceoff = (team: 'home' | 'away', number: string, delta = 1) =>
    updatePlayer(team, number, (p) => ({ ...p, faceoffsWon: Math.max(0, p.faceoffsWon + delta) }));

  const incrementPlayerPlusMinus = (team: 'home' | 'away', number: string, delta: 1 | -1) =>
    updatePlayer(team, number, (p) => ({ ...p, plusMinus: p.plusMinus + delta }));

  const setPlayerNumbers = (team: 'home' | 'away', numbers: string[]) =>
    applyToTeam(team, (t) => {
      const map = new Map(t.players.map((p) => [p.number, p]));
      const newPlayers: PlayerStat[] = numbers.map((n) => {
        const existing = map.get(n.trim());
        return (
          existing || {
            number: n.trim(),
            shots: 0,
            faceoffsWon: 0,
            plusMinus: 0,
          }
        );
      });
      return { ...t, players: newPlayers };
    });

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

  const shotsTarget = 30;
  const teamProgress = useMemo(() => {
    return {
      home: Math.min(1, game.home.shots / shotsTarget),
      away: Math.min(1, game.away.shots / shotsTarget),
      target: shotsTarget,
    };
  }, [game.home.shots, game.away.shots]);

  return {
    game,
    loading,
    setMode,
    setTeamNames,
    incrementTeamShots,
    incrementPlayerShot,
    incrementPlayerFaceoff,
    incrementPlayerPlusMinus,
    setPlayerNumbers,
    resetCurrentGame,
    saveToHistory,
    teamProgress,
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
