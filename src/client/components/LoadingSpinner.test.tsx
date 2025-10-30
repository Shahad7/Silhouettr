import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, FullscreenLoader, InlineLoader } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render inline variant by default', () => {
        render(<LoadingSpinner message="Loading..." />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render fullscreen variant', () => {
        render(<LoadingSpinner variant="fullscreen" message="Loading..." />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should render compact variant', () => {
        render(<LoadingSpinner variant="compact" message="Loading..." />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(document.querySelector('.py-4')).toBeInTheDocument();
    });

    it('should render without message', () => {
        render(<LoadingSpinner />);

        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should apply different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        expect(document.querySelector('.h-4')).toBeInTheDocument();

        rerender(<LoadingSpinner size="lg" />);
        expect(document.querySelector('.h-12')).toBeInTheDocument();
    });
});

describe('Convenience Components', () => {
    it('should render FullscreenLoader', () => {
        render(<FullscreenLoader message="Loading app..." />);

        expect(screen.getByText('Loading app...')).toBeInTheDocument();
        expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });



    it('should render InlineLoader', () => {
        render(<InlineLoader message="Loading content..." />);

        expect(screen.getByText('Loading content...')).toBeInTheDocument();
        expect(document.querySelector('.py-8')).toBeInTheDocument();
    });
});
