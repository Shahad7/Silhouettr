import React from 'react';

interface AttemptCounterProps {
  attempts: number;
  maxAttempts?: number;
  showAnimation?: boolean;
  className?: string;
}

export const AttemptCounter: React.FC<AttemptCounterProps> = ({
  attempts,
  maxAttempts,
  showAnimation = true,
  className = ''
}) => {
  const getColorClass = () => {
    if (!maxAttempts) return 'text-blue-600';

    const ratio = attempts / maxAttempts;
    if (ratio >= 0.8) return 'text-red-600';
    if (ratio >= 0.6) return 'text-orange-600';
    if (ratio >= 0.4) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getBgColorClass = () => {
    if (!maxAttempts) return 'bg-blue-50';

    const ratio = attempts / maxAttempts;
    if (ratio >= 0.8) return 'bg-red-50';
    if (ratio >= 0.6) return 'bg-orange-50';
    if (ratio >= 0.4) return 'bg-yellow-50';
    return 'bg-blue-50';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-300">🎯</span>
      <span className="text-xs font-bold text-white">
        {attempts}
      </span>
    </div>
  );
};


