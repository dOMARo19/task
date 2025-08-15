import React, { useEffect, useState } from 'react';
import { formatValue } from '../data/gameData';

interface ResourceCollectorProps {
  isCollecting: boolean;
  onComplete: () => void;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  resourceType: string;
  value: number;
}

const ResourceCollector: React.FC<ResourceCollectorProps> = ({
  isCollecting,
  onComplete,
  fromPosition,
  toPosition,
  resourceType,
  value
}) => {
  const [position, setPosition] = useState(fromPosition);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    if (isCollecting) {
      // Анімація переміщення ресурсу
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функція для плавного руху
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newX = fromPosition.x + (toPosition.x - fromPosition.x) * easeOut;
        const newY = fromPosition.y + (toPosition.y - fromPosition.y) * easeOut;
        
        setPosition({ x: newX, y: newY });
        
        // Додаємо слід
        setTrail(prev => {
          const newTrail = [...prev, { x: newX, y: newY, opacity: 1 - progress }];
          return newTrail.slice(-5); // Зберігаємо тільки останні 5 позицій
        });
        
        // Зменшуємо розмір та прозорість під час руху
        setScale(1 - progress * 0.2);
        setOpacity(1 - progress * 0.3);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Анімація завершена
          setTimeout(() => {
            onComplete();
          }, 100);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isCollecting, fromPosition, toPosition, onComplete]);

  if (!isCollecting) return null;

  return (
    <div className="fixed pointer-events-none z-50">
      {/* Слід ресурсу */}
      {trail.map((pos, index) => (
        <div
          key={index}
          className="absolute w-6 h-6 flex items-center justify-center"
          style={{
            left: pos.x - 12,
            top: pos.y - 12,
            opacity: pos.opacity * 0.6,
            transform: `scale(${0.5 + pos.opacity * 0.5})`,
            transition: 'all 0.1s ease-out'
          }}
        >
          <div className="text-lg opacity-70">{resourceType}</div>
        </div>
      ))}

      {/* Основний ресурс */}
      <div
        className="absolute w-8 h-8 flex items-center justify-center"
        style={{
          left: position.x - 16,
          top: position.y - 16,
          transform: `scale(${scale})`,
          opacity,
          transition: 'all 0.1s ease-out'
        }}
      >
        <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-lg border-2 border-green-300">
          <span className="text-xl">{resourceType}</span>
          {value > 0 && (
            <span className="font-bold text-green-600 text-sm">
              +{formatValue(value)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCollector;
