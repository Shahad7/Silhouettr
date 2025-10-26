import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttemptCounter, PerformanceMetrics } from './AttemptCounter';

describe('AttemptCounter', () => {
  it('should display attempt count', () => {
    render(<AttemptCounter attempts={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('attempts')).toBeInTheDocument();
  });

  it('should handle zero attempts', () => {
    render(<AttemptCounter attempts={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('attempts')).toBeInTheDocument();
  });

  it('should handle singular attempt', () => {
    render(<AttemptCounter attempts={1} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('attempt')).toBeInTheDocument(); // singular
  });

  it('should apply custom className', () => {
    render(<AttemptCounter attempts={3} className="custom-class" />);
    
    const container = screen.getByText('3').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('should display large numbers correctly', () => {
    render(<AttemptCounter attempts={999} />);
    
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('attempts')).toBeInTheDocument();
  });
});

describe('PerformanceMetrics', () => {
  it('should display performance metrics for completed challenge', () => {
    render(
      <PerformanceMetrics
        attempts={3}
        timeElapsed={125}
        completed={true}
        leaderboardPosition={5}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('attempts')).toBeInTheDocument();
    expect(screen.getByText('2:05')).toBeInTheDocument(); // 125 seconds = 2:05
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('should display metrics for incomplete challenge', () => {
    render(
      <PerformanceMetrics
        attempts={2}
        timeElapsed={45}
        completed={false}
      />
    );
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('attempts')).toBeInTheDocument();
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.queryByText('#')).not.toBeInTheDocument(); // No leaderboard position
  });

  it('should handle zero time elapsed', () => {
    render(
      <PerformanceMetrics
        attempts={1}
        timeElapsed={0}
        completed={true}
      />
    );
    
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should format time correctly for different durations', () => {
    const { rerender } = render(
      <PerformanceMetrics
        attempts={1}
        timeElapsed={5}
        completed={true}
      />
    );
    
    expect(screen.getByText('0:05')).toBeInTheDocument();
    
    rerender(
      <PerformanceMetrics
        attempts={1}
        timeElapsed={65}
        completed={true}
      />
    );
    
    expect(screen.getByText('1:05')).toBeInTheDocument();
    
    rerender(
      <PerformanceMetrics
        attempts={1}
        timeElapsed={3665}
        completed={true}
      />
    );
    
    expect(screen.getByText('61:05')).toBeInTheDocument(); // 1 hour 1 minute 5 seconds
  });

  it('should handle singular vs plural attempts', () => {
    const { rerender } = render(
      <PerformanceMetrics
        attempts={1}
        timeElapsed={30}
        completed={true}
      />
    );
    
    expect(screen.getByText('attempt')).toBeInTheDocument(); // singular
    
    rerender(
      <PerformanceMetrics
        attempts={2}
        timeElapsed={30}
        completed={true}
      />
    );
    
    expect(screen.getByText('attempts')).toBeInTheDocument(); // plural
  });

  it('should apply custom className', () => {
    render(
      <PerformanceMetrics
        attempts={3}
        timeElapsed={60}
        completed={true}
        className="custom-metrics"
      />
    );
    
    const container = screen.getByText('3').closest('div');
    expect(container).toHaveClass('custom-metrics');
  });

  it('should handle missing leaderboard position gracefully', () => {
    render(
      <PerformanceMetrics
        attempts={3}
        timeElapsed={60}
        completed={true}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1:00')).toBeInTheDocument();
    expect(screen.queryByText('#')).not.toBeInTheDocument();
  });

  it('should show leaderboard position when provided', () => {
    render(
      <PerformanceMetrics
        attempts={2}
        timeElapsed={45}
        completed={true}
        leaderboardPosition={1}
      />
    );
    
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should handle large leaderboard positions', () => {
    render(
      <PerformanceMetrics
        attempts={5}
        timeElapsed={180}
        completed={true}
        leaderboardPosition={999}
      />
    );
    
    expect(screen.getByText('#999')).toBeInTheDocument();
  });
});
