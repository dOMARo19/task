import React from 'react';
import { Cell } from '../types/game';
import { getCellIcon, getCellColor, formatValue } from '../data/gameData';

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isGameOver: boolean;
}

const GameCell: React.FC<GameCellProps> = ({ cell, onClick, isGameOver }) => {
  const handleClick = () => {
    if (!cell.isRevealed && !isGameOver) {
      onClick();
    }
  };

  return (
    <div
      className={`
        relative w-20 h-20 md:w-24 md:h-24
        rounded-xl shadow-lg cursor-pointer
        transition-all duration-300 ease-in-out
        transform hover:scale-105
        ${cell.isRevealed ? 'rotate-y-180' : ''}
        ${cell.isHighlighted ? 'ring-4 ring-yellow-300 ring-opacity-75' : ''}
        ${!cell.isRevealed ? 'bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700' : ''}
      `}
      onClick={handleClick}
      style={{
        transformStyle: 'preserve-3d',
        transform: cell.isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
    >
      {/* Передня сторона (закрита клітинка) */}
      <div
        className={`
          absolute inset-0 w-full h-full
          flex items-center justify-center
          rounded-xl
          ${!cell.isRevealed ? 'backface-hidden' : 'hidden'}
        `}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="text-3xl md:text-4xl text-white font-bold">
          💰
        </div>
      </div>

      {/* Задня сторона (відкрита клітинка) */}
      <div
        className={`
          absolute inset-0 w-full h-full
          flex flex-col items-center justify-center
          rounded-xl
          ${cell.isRevealed ? 'backface-hidden' : 'hidden'}
          ${getCellColor(cell.type)}
        `}
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <div className="text-2xl md:text-3xl mb-1">
          {getCellIcon(cell.type)}
        </div>
        {cell.type === 'cash' && (
          <div className="text-white font-bold text-sm md:text-base">
            {formatValue(cell.value)}
          </div>
        )}
        {cell.type === 'x2' && (
          <div className="text-white font-bold text-sm md:text-base">
            x{cell.value}
          </div>
        )}
        {cell.type === 'bomb' && (
          <div className="text-white font-bold text-sm md:text-base">
            BOOM!
          </div>
        )}
        {cell.type === 'stop' && (
          <div className="text-white font-bold text-sm md:text-base">
            STOP
          </div>
        )}
        {cell.type === 'zero' && (
          <div className="text-white font-bold text-sm md:text-base">
            0
          </div>
        )}
      </div>

      {/* Ефект підсвічування при наведенні */}
      {!cell.isRevealed && !isGameOver && (
        <div className="absolute inset-0 rounded-xl bg-white opacity-0 hover:opacity-20 transition-opacity duration-200" />
      )}
    </div>
  );
};

export default GameCell;
