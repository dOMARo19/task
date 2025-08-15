import { Cell, CellType } from '../types/game';

export const generateGameBoard = (): Cell[] => {
  const cells: Cell[] = [];
  
  // Створюємо 9 клітинок з різними типами (як у Roll Craft)
  const cellTypes: Array<{ type: CellType; value: number; count: number }> = [
    { type: 'cash', value: 100, count: 2 },
    { type: 'cash', value: 1000, count: 1 },
    { type: 'cash', value: 500, count: 1 },
    { type: 'cash', value: 10000, count: 1 },
    { type: 'x2', value: 2, count: 1 },
    { type: 'stop', value: 0, count: 1 },
    { type: 'zero', value: 0, count: 1 },
    { type: 'bomb', value: 0, count: 1 }
  ];
  
  let cellId = 0;
  
  cellTypes.forEach(({ type, value, count }) => {
    for (let i = 0; i < count; i++) {
      cells.push({
        id: cellId++,
        type,
        value,
        isRevealed: false,
        isHighlighted: false
      });
    }
  });
  
  // Перемішуємо клітинки для випадкового розташування
  return cells.sort(() => Math.random() - 0.5);
};

export const getCellIcon = (type: CellType): string => {
  switch (type) {
    case 'cash':
      return '💰';
    case 'bomb':
      return '💣';
    case 'x2':
      return '⚡';
    case 'zero':
      return '0️⃣';
    case 'stop':
      return '🛑';
    default:
      return '❓';
  }
};

export const getCellColor = (type: CellType): string => {
  switch (type) {
    case 'cash':
      return 'bg-green-500 hover:bg-green-600';
    case 'bomb':
      return 'bg-red-500 hover:bg-red-600';
    case 'x2':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'zero':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'stop':
      return 'bg-red-600 hover:bg-red-700';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

export const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};
