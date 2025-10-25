# Components

This directory contains the refactored React components for the Shape Guess Challenge game.

## Component Structure

### Core Components

- **MenuView** - Main menu screen with navigation buttons
- **CreateView** - Challenge creation interface with shape tools and canvas
- **PlayView** - Challenge playing interface with guess input and results
- **Canvas** - Reusable canvas component for displaying and manipulating shapes
- **ShapeToolbar** - Shape selection and configuration controls

### Hooks

- **useShapeManipulation** - Custom hook managing shape drag, resize, and rotate operations

## Component Hierarchy

```
App
├── MenuView
├── CreateView
│   ├── ShapeToolbar
│   └── Canvas
└── PlayView
    └── Canvas
```

## Benefits of Refactoring

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Canvas component is shared between Create and Play views
3. **Maintainability** - Easier to modify individual components without affecting others
4. **Testability** - Components can be tested in isolation
5. **Code Organization** - Related functionality is grouped together
6. **Props Interface** - Clear contracts between components via TypeScript interfaces

## Usage

All components are exported from the index file for easy importing:

```typescript
import { MenuView, CreateView, PlayView, Canvas, ShapeToolbar } from './components';
```
