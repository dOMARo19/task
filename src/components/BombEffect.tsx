import React, { useEffect, useState } from 'react';

interface BombEffectProps {
  isActive: boolean;
  onComplete: () => void;
}

const BombEffect: React.FC<BombEffectProps> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
    scale: number;
    color: string;
  }>>([]);

  const [explosionScale, setExplosionScale] = useState(0);
  const [screenShake, setScreenShake] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Створюємо частинки для ефекту вибуху
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        opacity: 1,
        scale: Math.random() * 0.8 + 0.4,
        color: ['#ff4444', '#ff8844', '#ffaa44', '#ffcc44'][Math.floor(Math.random() * 4)]
      }));
      
      setParticles(newParticles);
      setExplosionScale(0);

      // Анімація центрального вибуху
      const explosionDuration = 500;
      const explosionStartTime = Date.now();

      const animateExplosion = () => {
        const elapsed = Date.now() - explosionStartTime;
        const progress = elapsed / explosionDuration;

        if (progress < 1) {
          setExplosionScale(progress * 2);
          setScreenShake(progress * 10);
          requestAnimationFrame(animateExplosion);
        }
      };

      // Анімація частинок
      const duration = 2500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          setParticles(prev => 
            prev.map(particle => ({
              ...particle,
              x: particle.x + particle.vx * 0.5,
              y: particle.y + particle.vy * 0.5,
              opacity: 1 - progress,
              scale: particle.scale * (1 + progress * 0.5),
              vx: particle.vx * 0.98, // Затухання
              vy: particle.vy * 0.98
            }))
          );
          requestAnimationFrame(animate);
        } else {
          setParticles([]);
          setExplosionScale(0);
          setScreenShake(0);
          onComplete();
        }
      };

      requestAnimationFrame(animateExplosion);
      requestAnimationFrame(animate);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Ефект тряски екрану */}
      <div 
        className="absolute inset-0 bg-red-500 opacity-10"
        style={{
          transform: `translate(${Math.sin(Date.now() * 0.01) * screenShake}px, ${Math.cos(Date.now() * 0.01) * screenShake}px)`,
          transition: 'transform 0.05s ease-out'
        }}
      />

      {/* Центральний вибух */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="text-8xl animate-pulse"
          style={{
            transform: `scale(${explosionScale})`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          💥
        </div>
      </div>

      {/* Частинки */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.scale * 8,
            height: particle.scale * 8,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `scale(${particle.scale})`,
            transition: 'all 0.1s linear',
            boxShadow: `0 0 ${particle.scale * 4}px ${particle.color}`
          }}
        />
      ))}

      {/* Додаткові ефекти */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-red-600 opacity-20"
          style={{
            animation: 'pulse 0.2s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  );
};

export default BombEffect;
