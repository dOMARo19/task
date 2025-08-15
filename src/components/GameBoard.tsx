import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Cell, GameStats } from '../types/game';
import { generateGameBoard, getCellIcon, formatValue } from '../data/gameData';
import GameCell from './GameCell';
import GameModal from './GameModal';
import ResourceCollector from './ResourceCollector';
import BombEffect from './BombEffect';

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    cells: generateGameBoard(),
    totalBalance: 0,
    multiplier: 1,
    isGameOver: false,
    isBombExploded: false,
    revealedCells: []
  }));

  const [gameStats, setGameStats] = useState<GameStats>({
    totalCash: 0,
    totalMultipliers: 0,
    totalBombs: 0,
    totalZeros: 0,
    totalStops: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showBombEffect, setShowBombEffect] = useState(false);
  const [collectingResource, setCollectingResource] = useState<{
    type: string;
    value: number;
    fromPos: { x: number; y: number };
    toPos: { x: number; y: number };
  } | null>(null);
  
  const balanceRef = useRef<HTMLDivElement>(null);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Оновлення статистики
  const updateGameStats = useCallback((cells: Cell[]) => {
    const stats = cells.reduce((acc, cell) => {
      if (cell.isRevealed) {
        switch (cell.type) {
          case 'cash':
            acc.totalCash++;
            break;
          case 'x2':
            acc.totalMultipliers++;
            break;
          case 'bomb':
            acc.totalBombs++;
            break;
          case 'zero':
            acc.totalZeros++;
            break;
          case 'stop':
            acc.totalStops++;
            break;
        }
      }
      return acc;
    }, { totalCash: 0, totalMultipliers: 0, totalBombs: 0, totalZeros: 0, totalStops: 0 });

    setGameStats(stats);
  }, []);

  // Обробка кліку по клітинці
  const handleCellClick = useCallback((cellId: number) => {
    if (isAnimating || gameState.isGameOver) return;

    setIsAnimating(true);
    
    setGameState(prev => {
      const updatedCells = prev.cells.map(cell => 
        cell.id === cellId ? { ...cell, isRevealed: true } : cell
      );

      const clickedCell = updatedCells.find(cell => cell.id === cellId)!;
      const newRevealedCells = [...prev.revealedCells, clickedCell];

      let newMultiplier = prev.multiplier;
      let newIsGameOver = prev.isGameOver;
      let newIsBombExploded = prev.isBombExploded;

      // Обробка різних типів клітинок
      if (clickedCell.type === 'bomb') {
        newIsGameOver = true;
        newIsBombExploded = true;
        setShowBombEffect(true);
        
        // Відкриваємо всі клітинки при бомбі
        const allRevealedCells = updatedCells.map(cell => ({ ...cell, isRevealed: true }));
        setTimeout(() => {
          setShowModal(true);
        }, 2000);
      } else if (clickedCell.type === 'x2') {
        newMultiplier *= clickedCell.value;
      } else if (clickedCell.type === 'cash') {
        // Анімація збірки ресурсу
        animateResourceCollection(clickedCell);
      } else if (clickedCell.type === 'stop') {
        newIsGameOver = true;
        // Відкриваємо всі клітинки при стопі
        const allRevealedCells = updatedCells.map(cell => ({ ...cell, isRevealed: true }));
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }

      // Перевіряємо чи всі клітинки відкриті
      const allRevealed = updatedCells.every(cell => cell.isRevealed);
      if (allRevealed && !newIsBombExploded) {
        newIsGameOver = true;
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }

      return {
        ...prev,
        cells: updatedCells,
        revealedCells: newRevealedCells,
        multiplier: newMultiplier,
        isGameOver: newIsGameOver,
        isBombExploded: newIsBombExploded
      };
    });

    // Затримка для анімації
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, gameState.isGameOver]);

  // Обробка кнопки Claim
  const handleClaim = useCallback(() => {
    if (gameState.revealedCells.length > 0) {
      setShowModal(true);
    }
  }, [gameState.revealedCells.length]);

  // Нова гра
  const handleNewGame = useCallback(() => {
    const newCells = generateGameBoard();
    setGameState({
      cells: newCells,
      totalBalance: 0,
      multiplier: 1,
      isGameOver: false,
      isBombExploded: false,
      revealedCells: []
    });
    setGameStats({
      totalCash: 0,
      totalMultipliers: 0,
      totalBombs: 0,
      totalZeros: 0,
      totalStops: 0
    });
    setShowModal(false);
  }, []);

  // Анімація збірки ресурсу
  const animateResourceCollection = useCallback((cell: Cell) => {
    if (!gameBoardRef.current || !balanceRef.current) return;
    
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const balanceRect = balanceRef.current.getBoundingClientRect();
    
    // Розраховуємо позиції для анімації
    const fromPos = {
      x: boardRect.left + boardRect.width / 2,
      y: boardRect.top + boardRect.height / 2
    };
    
    const toPos = {
      x: balanceRect.left + balanceRect.width / 2,
      y: balanceRect.top + balanceRect.height / 2
    };
    
    setCollectingResource({
      type: getCellIcon(cell.type),
      value: cell.value,
      fromPos,
      toPos
    });
    
    setIsCollecting(true);
  }, []);

  // Завершення анімації збірки
  const handleCollectionComplete = useCallback(() => {
    setIsCollecting(false);
    setCollectingResource(null);
  }, []);

  // Завершення ефекту бомби
  const handleBombEffectComplete = useCallback(() => {
    setShowBombEffect(false);
  }, []);

  // Закриття модального вікна
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    if (gameState.isBombExploded) {
      handleNewGame();
    }
  }, [gameState.isBombExploded, handleNewGame]);

  // Оновлення статистики при зміні стану гри
  useEffect(() => {
    updateGameStats(gameState.cells);
  }, [gameState.cells, updateGameStats]);

  // Розрахунок загального балансу
  const totalBalance = gameState.revealedCells.reduce((total, cell) => {
    if (cell.type === 'cash') {
      return total + (cell.value * gameState.multiplier);
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Фон з зірками */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
        <div className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-80 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-96 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 text-white">
          <div className="text-sm">9:41</div>
          <div className="text-lg font-bold">STAR INDUSTRY</div>
          <div className="flex space-x-1">
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-4 h-2 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Roll Craft
          </h1>
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Поточний баланс */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2">
            {gameState.multiplier > 1 && (
              <span className="text-yellow-400 font-bold text-lg">
                x{gameState.multiplier}
              </span>
            )}
            <span className="text-2xl font-bold text-green-400">
              {formatValue(totalBalance)}
            </span>
            <span className="text-2xl">💰</span>
          </div>
        </div>

        {/* Ігрове поле */}
        <div ref={gameBoardRef} className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {gameState.cells.map((cell) => (
              <GameCell
                key={cell.id}
                cell={cell}
                onClick={() => handleCellClick(cell.id)}
                isGameOver={gameState.isGameOver}
              />
            ))}
          </div>
        </div>

        {/* Resource Bar */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center space-x-1">
              <span>💰</span>
              <span>{gameStats.totalCash}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>{gameStats.totalMultipliers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>0️⃣</span>
              <span>{gameStats.totalZeros}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🛑</span>
              <span>{gameStats.totalStops}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💣</span>
              <span>{gameStats.totalBombs}</span>
            </div>
          </div>
        </div>

        {/* Кнопка Claim */}
        <div className="text-center">
          <button
            onClick={handleClaim}
            disabled={gameState.revealedCells.length === 0 || isAnimating}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            🎯 Claim
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-700">
          <div className="flex justify-around py-3 max-w-md mx-auto">
            <div className="text-center text-white text-xs">
              <div className="text-lg mb-1">🏢</div>
              <div>Office</div>
            </div>
            <div className="text-center text-white text-xs">
              <div className="text-lg mb-1">📦</div>
              <div>Resources</div>
            </div>
            <div className="text-center text-white text-xs">
              <div className="text-lg mb-1">🔧</div>
              <div>Materials</div>
            </div>
            <div className="text-center text-white text-xs">
              <div className="text-lg mb-1">📋</div>
              <div>Goods</div>
            </div>
            <div className="text-center text-white text-xs">
              <div className="text-lg mb-1">📊</div>
              <div>Stock</div>
            </div>
          </div>
        </div>

        {/* Модальне вікно */}
        <GameModal
          isOpen={showModal}
          onClose={handleCloseModal}
          gameState={gameState}
          gameStats={gameStats}
        />

        {/* Анімація збірки ресурсів */}
        {collectingResource && (
          <ResourceCollector
            isCollecting={isCollecting}
            onComplete={handleCollectionComplete}
            fromPosition={collectingResource.fromPos}
            toPosition={collectingResource.toPos}
            resourceType={collectingResource.type}
            value={collectingResource.value}
          />
        )}

        {/* Ефект бомби */}
        <BombEffect
          isActive={showBombEffect}
          onComplete={handleBombEffectComplete}
        />
      </div>
    </div>
  );
};

export default GameBoard;
