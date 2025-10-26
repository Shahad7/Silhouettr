# Components

This directory contains the refactored React components for the Shape Guess Challenge game.

## Component Structure

### Core Components

- **MenuView** - Main menu screen with navigation buttons
- **CreateView** - Challenge creation interface with shape tools and canvas
- **ChallengeView** - Reddit-integrated challenge interface with server communication
- **Canvas** - Reusable canvas component for displaying and manipulating shapes
- **ShapeToolbar** - Shape selection and configuration controls
- **Timer** - Real-time timer component for challenge tracking
- **AttemptCounter** - Attempt tracking with performance metrics
- **Leaderboard** - Global ranking display with user positions

### Hooks

- **useShapeManipulation** - Custom hook managing shape drag, resize, and rotate operations

## Component Hierarchy

```
App
├── MenuView
├── CreateView
│   ├── ShapeToolbar
│   └── Canvas
└── ChallengeView
    ├── Timer
    ├── AttemptCounter
    └── Canvas
```

## Benefits of Refactoring

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Canvas component is shared between Create and Challenge views
3. **Maintainability** - Easier to modify individual components without affecting others
4. **Testability** - Components can be tested in isolation
5. **Code Organization** - Related functionality is grouped together
6. **Props Interface** - Clear contracts between components via TypeScript interfaces
7. **Server Integration** - ChallengeView handles Reddit API communication seamlessly

## Usage

All components are exported from the index file for easy importing:

```typescript
import { MenuView, CreateView, ChallengeView, Canvas, ShapeToolbar, Timer, AttemptCounter, Leaderboard } from './components';
```
