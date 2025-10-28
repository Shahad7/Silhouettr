import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Timer } from './Timer';
import { CompactTimer } from './CompactTimer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should display initial time when not running', () => {
    render(<Timer isRunning={false} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should display elapsed time when running', () => {
    const startTime = Date.now() - 65000; // 1 minute 5 seconds ago

    render(<Timer startTime={startTime} isRunning={true} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('should update time every second when running', () => {
    const startTime = Date.now();

    render(<Timer startTime={startTime} isRunning={true} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000); // Advance 3 seconds
    });

    expect(screen.getByText('0:03')).toBeInTheDocument();
  });

  it('should stop updating when isRunning becomes false', () => {
    const startTime = Date.now();

    const { rerender } = render(<Timer startTime={startTime} isRunning={true} />);

    act(() => {
      vi.advanceTimersByTime(5000); // Advance 5 seconds
    });

    expect(screen.getByText('0:05')).toBeInTheDocument();

    // Stop the timer
    rerender(<Timer startTime={startTime} isRunning={false} />);

    act(() => {
      vi.advanceTimersByTime(3000); // Advance 3 more seconds
    });

    // Should still show 0:05, not 0:08
    expect(screen.getByText('0:05')).toBeInTheDocument();
  });

  it('should format minutes and seconds correctly', () => {
    const startTime = Date.now() - 125000; // 2 minutes 5 seconds ago

    render(<Timer startTime={startTime} isRunning={true} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('should handle hours correctly', () => {
    const startTime = Date.now() - 3665000; // 1 hour 1 minute 5 seconds ago

    render(<Timer startTime={startTime} isRunning={true} />);

    expect(screen.getByText('61:05')).toBeInTheDocument(); // Shows as minutes:seconds
  });

  it('should handle zero padding for seconds', () => {
    const startTime = Date.now() - 62000; // 1 minute 2 seconds ago

    render(<Timer startTime={startTime} isRunning={true} />);

    expect(screen.getByText('1:02')).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const startTime = Date.now();

    const { unmount } = render(<Timer startTime={startTime} isRunning={true} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('CompactTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should display compact format', () => {
    const elapsedSeconds = 65; // 1 minute 5 seconds

    render(<CompactTimer elapsedSeconds={elapsedSeconds} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CompactTimer elapsedSeconds={0} className="custom-class" />);

    const timer = screen.getByText('0:00');
    expect(timer).toHaveClass('custom-class');
  });

  it('should handle zero elapsed time', () => {
    render(<CompactTimer elapsedSeconds={0} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should display correct elapsed time', () => {
    render(<CompactTimer elapsedSeconds={10} />);

    expect(screen.getByText('0:10')).toBeInTheDocument();
  });

  it('should display minutes and seconds correctly', () => {
    render(<CompactTimer elapsedSeconds={305} />); // 5 minutes 5 seconds

    expect(screen.getByText('5:05')).toBeInTheDocument();
  });
});
