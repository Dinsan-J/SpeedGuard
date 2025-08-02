import { useEffect, useState } from 'react';

interface StatsCounterProps {
  end: number;
  label: string;
  icon: React.ReactNode;
  duration?: number;
  suffix?: string;
}

export const StatsCounter = ({ end, label, icon, duration = 2000, suffix = '' }: StatsCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <div className="bg-gradient-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
          {icon}
        </div>
        <div className="text-2xl font-bold text-primary">
          {count.toLocaleString()}{suffix}
        </div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
};