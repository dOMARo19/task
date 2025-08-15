import React from 'react';
import { GameState, GameStats } from '../types/game';
import { formatValue } from '../data/gameData';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  gameStats: GameStats;
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, gameState, gameStats }) => {
  if (!isOpen) return null;

  const calculateTotalWinnings = (): number => {
    return gameState.revealedCells.reduce((total, cell) => {
      if (cell.type === 'cash') {
        return total + (cell.value * gameState.multiplier);
      }
      return total;
    }, 0);
  };

  const totalWinnings = calculateTotalWinnings();

  const isBombModal = gameState.isBombExploded;
  const isStopModal = gameState.revealedCells.some(cell => cell.type === 'stop');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-center">
            {isBombModal ? 'Danger ahead!' : isStopModal ? 'Game over!' : '🎉 Результати!'}
          </h2>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          {/* Центральна іконка */}
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isBombModal ? '💣' : isStopModal ? '🛑' : '💰'}
            </div>
            {isBombModal && (
              <div className="text-white text-lg mb-2">
                You're on a Bomb Square! You hit a bomb and lose all rewards from this field.
              </div>
            )}
            {isStopModal && (
              <div className="text-white text-lg mb-2">
                You've reached the end of this run...
              </div>
            )}
          </div>

          {/* Значення */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatValue(totalWinnings)}
            </div>
            <div className="text-gray-400 text-sm">
              {isBombModal ? 'Total lost' : 'Total winnings'}
            </div>
            {gameState.multiplier > 1 && (
              <div className="text-sm text-yellow-400 mt-1">
                Множник: x{gameState.multiplier}
              </div>
            )}
          </div>

          {/* Додаткові повідомлення */}
          {isBombModal && (
            <div className="text-center text-gray-300 text-sm">
              ...or defuse it and save your run!
            </div>
          )}
          {isStopModal && (
            <div className="text-center text-gray-300 text-sm">
              ...claim and return to the main board
            </div>
          )}

          {/* Статистика */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-center text-white">Статистика</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span>Гроші:</span>
                <span className="font-semibold text-white">{gameStats.totalCash}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Множники:</span>
                <span className="font-semibold text-white">{gameStats.totalMultipliers}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💣</span>
                <span>Бомби:</span>
                <span className="font-semibold text-white">{gameStats.totalBombs}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>0️⃣</span>
                <span>Нулі:</span>
                <span className="font-semibold text-white">{gameStats.totalZeros}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🛑</span>
                <span>Стоп:</span>
                <span className="font-semibold text-white">{gameStats.totalStops}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-6 pt-0">
          {isBombModal ? (
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                Take a hit
              </button>
              <button
                onClick={onClose}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>💎</span>
                <span>Defuse for 49</span>
              </button>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                🆕 Нова гра
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
            >
              {isStopModal ? 'Claim' : 'Закрити'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameModal;
