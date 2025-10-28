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
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`} />
  );

  // Fullscreen loading (for main views)
  if (variant === 'fullscreen') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${className}`}>
        {spinner}
        {message && (
          <p className={`text-gray-600 mt-3 ${textSizes[size]}`}>{message}</p>
        )}
      </div>
    );
  }

  // Compact loading (for small components)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        {spinner}
        {message && (
          <span className={`ml-2 text-gray-600 ${textSizes[size]}`}>{message}</span>
        )}
      </div>
    );
  }

  // Inline loading (default)
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      {spinner}
      {message && (
        <span className={`ml-2 text-gray-600 ${textSizes[size]}`}>{message}</span>
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
