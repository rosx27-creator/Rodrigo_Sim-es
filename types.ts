
export enum Position {
  GOLEIRO = 'Goleiro',
  ZAGUEIRO = 'Zagueiro',
  MEIO = 'Meio',
  ATACANTE = 'Atacante'
}

export enum PlayerType {
  EFETIVO = 'Efetivo',
  CONVIDADO = 'Convidado'
}

export enum PlanTier {
  PELADA = 'Pelada',
  AMADOR = 'Amador',
  PROFISSIONAL = 'Profissional'
}

export const PLAN_LIMITS: Record<PlanTier, number> = {
  [PlanTier.PELADA]: 20,
  [PlanTier.AMADOR]: 30,
  [PlanTier.PROFISSIONAL]: 50
};

export type UserRole = 'admin' | 'user';

export interface UserAccount {
  id: string;
  email: string;
  password: string; // In a real app, never store raw passwords
  plan: PlanTier;
  role: UserRole;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  position: Position;
  level: number; // 1 to 5
  type: PlayerType;
  confirmed: boolean;
}

export interface MatchDetails {
  date: string;
  time: string;
  location: string;
  teamsCount: number; // How many teams to split into
  organizerPhone: string;
}

export interface Team {
  name: string;
  players: Player[];
  stats: {
    avgLevel: number;
    totalPlayers: number;
  }
}

export interface SortResult {
  teams: Team[];
  analysis: string; // AI analysis of the balance
}
