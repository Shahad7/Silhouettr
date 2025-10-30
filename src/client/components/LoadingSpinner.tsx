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
    <div className={`animate-spin rounded-full border-2 border-gray-400 border-t-blue-600 ${sizeClasses[size]}`} />
  );

  // Fullscreen loading (for main views)
  if (variant === 'fullscreen') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-8 w-full max-w-[360px] shadow-xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
          </div>
          {message && (
            <p className={`text-gray-700 font-medium ${textSizes[size]}`}>{message}</p>
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
          <span className={`ml-3 text-gray-600 ${textSizes[size]}`}>{message}</span>
        )}
      </div>
    );
  }

  // Inline loading (default)
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      {spinner}
      {message && (
        <span className={`ml-3 text-gray-600 font-medium ${textSizes[size]}`}>{message}</span>
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
