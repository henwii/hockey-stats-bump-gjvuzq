
export type Mode = 'team' | 'players';

export interface PlayerStat {
  number: string; // jersey number as string to allow alphanumerics
  shots: number;
  faceOffWins: number;
  faceOffLosses: number;
  plus: number;
  minus: number;
}

export interface TeamStats {
  name: string;
  shots: number;
  players: PlayerStat[];
  goalies: string[]; // up to 3 goalies
  selectedGoalie: number | null; // index of selected goalie
}

export interface PeriodStats {
  teamStats: {
    home: TeamStats;
    away?: TeamStats;
  };
  playerStats: { [playerNumber: string]: PlayerStat };
}

export interface Game {
  id: string;
  date: string;
  mode: Mode;
  period: number;
  home: TeamStats;
  away?: TeamStats; // Optional for single team in player mode
  selectedPlayer: number | null; // For player mode two-press system
  shiftMode: boolean; // For decrementing in player mode
  periodStats: { [period: number]: PeriodStats }; // Stats per period
}
