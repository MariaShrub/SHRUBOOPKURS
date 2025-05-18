import {MatchResult} from "./components/MatchResultInput.js";

export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  isEmpty?: boolean;
};

export type Match = {
  id: string;
  round: number;
  bracket: 'upper' | 'lower' | 'final';
  player1: string;
  player2: string;
  result: {
    player1: number;
    player2: number;
    winner: 'player1' | 'player2';
    details: MatchResult[];
  } | null;
};

export type Standing = {
  participantId: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  rating: number;
  position: number;
  buchholz?: number;
  berger?: number;
};

export type TiebreakerType = 'rating' | 'buchholz' | 'berger';
export type BracketType = 'rigid' | 'random' | 'reroll';

export type TournamentConfig = {
  participantsCount: number;
  bracketType: BracketType;
  tiebreakerType: TiebreakerType;
};
