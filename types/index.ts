
export type Mode = 'team' | 'players';

export interface PlayerStat {
  number: string; // jersey number as string to allow alphanumerics
  shots: number;
  faceoffsWon: number;
  plusMinus: number;
}

export interface TeamStats {
  name: string;
  shots: number;
  players: PlayerStat[];
}

export interface Game {
  id: string;
  date: string;
  mode: Mode;
  home: TeamStats;
  away: TeamStats;
}
