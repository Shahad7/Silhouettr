import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    pathname: '/',
  },
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
})) as any;

// Mock getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 400,
  height: 300,
  top: 0,
  left: 0,
  bottom: 300,
  right: 400,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));
