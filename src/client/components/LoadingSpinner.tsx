import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'compact';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  variant = 'inline',
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-600 border-t-white ${sizeClasses[size]}`} />
  );

  // Fullscreen loading (for main views)
  if (variant === 'fullscreen') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 w-full max-w-[360px] shadow-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className={`animate-spin rounded-full border-4 border-gray-600 border-t-white ${sizeClasses[size]}`} />
          </div>
          {message && (
            <p className={`text-gray-300 font-medium ${textSizes[size]}`}>{message}</p>
          )}
          <div className="mt-4 text-xs text-gray-500">
            Silhouettr
          </div>
        </div>
      </div>
    );
  }

  // Compact loading (for small components)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        {spinner}
        {message && (
          <span className={`ml-3 text-gray-400 ${textSizes[size]}`}>{message}</span>
        )}
      </div>
    );
  }

  // Inline loading (default)
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      {spinner}
      {message && (
        <span className={`ml-3 text-gray-400 font-medium ${textSizes[size]}`}>{message}</span>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const FullscreenLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner
    variant="fullscreen"
    size="lg"
    {...(message && { message })}
  />
);

export const CompactLoader: React.FC<{ message?: string; className?: string }> = ({
  message,
  className
}) => (
  <LoadingSpinner
    variant="compact"
    size="sm"
    {...(message && { message })}
    {...(className && { className })}
  />
);

export const InlineLoader: React.FC<{ message?: string; className?: string }> = ({
  message,
  className
}) => (
  <LoadingSpinner
    variant="inline"
    size="md"
    {...(message && { message })}
    {...(className && { className })}
  />
);
