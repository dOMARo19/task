export type CellType = 'cash' | 'bomb' | 'x2' | 'zero' | 'stop';

export interface Cell {
  id: number;
  type: CellType;
  value: number;
  isRevealed: boolean;
  isHighlighted: boolean;
}

export interface GameState {
  cells: Cell[];
  totalBalance: number;
  multiplier: number;
  isGameOver: boolean;
  isBombExploded: boolean;
  revealedCells: Cell[];
}

export interface GameStats {
  totalCash: number;
  totalMultipliers: number;
  totalBombs: number;
  totalZeros: number;
  totalStops: number;
}
