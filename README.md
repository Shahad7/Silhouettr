# 🎯 Silhouettr

An innovative visual puzzle game built on Reddit's Devvit platform where creativity meets challenge. Players become both artists and puzzle solvers, creating intricate visual riddles using Unicode shapes and challenging others to decode their artistic arrangements.

## What is Silhouettr?

Silhouettr is a dual-mode creative puzzle game that transforms simple Unicode symbols into engaging visual brain teasers. Using a palette of 10 carefully selected black geometric shapes (●, ▮, ▲, ★, ♦, ▼, ◆, ⬛, ⬤, ▪), players craft recognizable objects, patterns, scenes, or abstract concepts on a responsive digital canvas.

The game features two complementary gameplay modes:

### 🎨 **Create Mode** - Become the Puzzle Master
Design custom visual challenges using a professional-grade shape manipulation system:
- **Advanced Canvas Editor**: Drag-and-drop positioning with pixel-perfect precision
- **Real-time Shape Controls**: Live resizing (2-30% scale) and 360° rotation with visual feedback
- **Interactive Handles**: Hover-activated resize (⇕) and rotation (↻) controls for fine-tuning
- **Smart Validation**: Prevents saving incomplete challenges and provides helpful guidance
- **Unlimited Creativity**: No restrictions on complexity - create simple icons or elaborate scenes

### 🎮 **Play Mode** - Master the Puzzles  
Solve community-created challenges with comprehensive performance tracking:
- **Visual Analysis**: Study static shape arrangements to identify hidden meanings
- **Smart Timing System**: Automatic timer activation on first guess attempt
- **Attempt Analytics**: Track solving efficiency with detailed attempt counting
- **Instant Feedback**: Real-time validation with encouraging messages for incorrect guesses
- **Achievement Celebration**: Success screens with performance metrics and completion times

Built as a React TypeScript application for Reddit's Devvit platform, the game integrates seamlessly into Reddit posts, making it instantly accessible to millions of users without requiring external downloads or account creation.

## Current Game Features

### 🎨 **Advanced Shape Manipulation System**
- **10 Unique Unicode Shapes**: Carefully selected black geometric symbols (●, ▮, ▲, ★, ♦, ▼, ◆, ⬛, ⬤, ▪) optimized for visual storytelling
- **Real-Time Canvas Editor**: Drag-and-drop positioning with percentage-based coordinates for cross-device consistency
- **Interactive Control Handles**: 
  - Blue resize handles (⇕) for scaling shapes from 2-30% of canvas size
  - Green rotation handles (↻) for 360-degree rotation control
  - Hover-activated controls that appear only when needed
- **Smart Shape Management**: Shift+Click deletion, z-index management during manipulation, and visual feedback systems

### 🎮 **Dual-Mode Gameplay**
- **Create Mode**: Professional-grade visual editor for designing custom challenges
- **Play Mode**: Puzzle-solving interface with performance tracking and analytics
- **Seamless Navigation**: Fluid transitions between modes with state preservation

### 💾 **Intelligent Data Persistence**
- **Local Storage Integration**: Challenges automatically save to browser storage
- **Complex Data Serialization**: Preserves shape positions, sizes, rotations, and metadata
- **Error Recovery**: Graceful handling of corrupted data with fallback systems
- **Session Persistence**: Maintains game state across browser restarts

### 📊 **Performance Analytics**
- **Smart Timer System**: Begins timing only on first guess attempt
- **Attempt Tracking**: Detailed counting of solving efficiency
- **Success Celebrations**: Animated victory screens with personalized metrics
- **Challenge Statistics**: Shape count indicators and difficulty assessment

## What Makes This Game Innovative?

### 🎨 **Community-Driven Content Creation**
Unlike traditional puzzle games with fixed content, Silhouettr creates a self-sustaining ecosystem where every player becomes both creator and solver. This dual-role system generates infinite, unique challenges as the community continuously contributes new visual puzzles, ensuring fresh content and endless replayability.

### 🔧 **Professional-Grade Visual Editor**
The game features a sophisticated shape manipulation system that rivals professional design software:

**Advanced Interaction System:**
- **Precision Positioning**: Percentage-based coordinate system ensures pixel-perfect placement across all screen sizes
- **Multi-Handle Controls**: Hover-activated blue resize handles (⇕) and green rotation handles (↻) provide intuitive editing
- **Real-Time Feedback**: Live size percentages (2-30%) and rotation degrees (0-359°) with smooth visual transitions
- **Smart State Management**: Seamless switching between drag, resize, and rotate modes with visual indicators
- **Responsive Canvas**: Maintains perfect 5:4 aspect ratio while adapting to any screen size

**Intuitive Editing Features:**
- **Quick Actions**: Shift+Click deletion for rapid iteration
- **Visual Hierarchy**: Z-index management keeps active shapes on top during manipulation
- **Undo-Friendly**: Clear canvas option for complete resets without losing progress
- **Error Prevention**: Smart validation prevents saving incomplete or invalid challenges

### 📱 **Mobile-First Reddit Integration**
Specifically engineered for Reddit's predominantly mobile user base:
- **Touch-Optimized Controls**: All manipulation handles sized and positioned for finger interaction
- **Responsive Design**: 
  - Gradient backgrounds and adaptive layouts that scale beautifully from phones to desktops
  - Canvas maintains perfect 5:4 aspect ratio (500:400px design) across all screen sizes
  - Text and button sizes adapt with `sm:` breakpoints for optimal mobile/desktop experience
- **Native Reddit Experience**: Runs directly within Reddit posts without external redirects or app downloads
- **Viewport Optimization**: 
  - `user-scalable=no` prevents unwanted zooming while maintaining precise touch control
  - Responsive font sizing using `vw` units with maximum caps for consistent appearance

### 💾 **Intelligent Local Persistence**
Implements a robust client-side storage system that eliminates server dependencies:
- **Complex Data Serialization**: Automatically saves shape arrangements with position, size, rotation, and metadata
- **Error Recovery**: Graceful handling of corrupted data with fallback to empty state
- **Session Persistence**: Challenges survive browser restarts and maintain state across sessions
- **Unlimited Storage**: Only limited by browser storage capacity, supporting hundreds of challenges
- **Instant Loading**: No network delays - challenges load immediately from local storage

### ⚡ **Advanced Performance Analytics**
Comprehensive tracking system that gamifies the solving experience:
- **Smart Timer Logic**: Begins timing only on first guess attempt, allowing unlimited study time
- **Precision Metrics**: Millisecond-accurate timing converted to user-friendly second displays
- **Attempt Efficiency**: Detailed tracking of guess patterns and solving strategies
- **Celebration System**: Animated success screens with personalized performance breakdowns
- **Difficulty Assessment**: Shape count indicators help players choose appropriate challenge levels
- **Progress Visualization**: Clear display of total challenges created and completion statistics

## Complete Step-by-Step Gameplay Guide

### 🎨 **Creating Your First Visual Challenge**

#### **Getting Started**
1. **Launch Create Mode**
   - From the main menu's vibrant interface, click the gradient "🎨 Create Challenge" button
   - Enter the green-to-blue gradient creative environment with the header "✏️ Create Your Challenge"

2. **Understanding the Shape Palette**
   - **Available Arsenal**: 10 carefully curated Unicode symbols optimized for visual storytelling:
     - **●** (Circle) - Perfect for eyes, wheels, dots, planets
     - **▮** (Rectangle) - Ideal for buildings, screens, books, doors  
     - **▲** (Triangle) - Great for arrows, mountains, roofs, trees
     - **★** (Star) - Perfect for decorations, ratings, celestial objects
     - **♦** (Diamond) - Excellent for gems, playing cards, decorative elements
     - **▼** (Down Triangle) - Useful for arrows, icicles, dropdown indicators
     - **◆** (Filled Diamond) - Solid version for emphasis and contrast
     - **⬛** (Large Square) - Bold blocks for structures and emphasis
     - **⬤** (Large Circle) - Bigger circles for major elements
     - **▪** (Small Square) - Tiny details and fine elements

   - **Selection Interface**: Click any shape button to select it - active shapes display with blue background and ring highlight
   - **Visual Consistency**: All shapes render as solid black for maximum contrast and universal readability

#### **Pre-Placement Configuration**
3. **Master the Control Panel**
   - **Size Slider**: Drag to set shape scale (2-30% of canvas width)
     - Live percentage display shows exact current value
     - Smaller percentages for detail work, larger for main elements
   - **Rotation Dial**: Drag to set initial angle (0-359 degrees)
     - Live degree display shows precise rotation value
     - Perfect for creating tilted elements or dynamic compositions
   - **Add to Canvas**: Click "Add Shape" to place your configured shape at a randomized starting position

#### **Advanced Canvas Manipulation**
4. **Professional Editing Tools**
   - **Basic Positioning**: Click and drag any shape to move it anywhere within canvas boundaries
     - Smooth dragging with real-time position updates using percentage-based coordinates
     - Boundary constraints prevent shapes from moving outside canvas area
     - Visual cursor changes to `cursor-move` during hover for clear interaction feedback
   
   - **Precision Resizing System**:
     - Hover over any shape to reveal the blue resize handle (⇕) in the bottom-right corner
     - Drag handle downward to enlarge (up to 30% maximum)
     - Drag handle upward to shrink (down to 2% minimum)
     - 0.1 sensitivity scaling for precise size control
     - Live size feedback with smooth transitions
   
   - **360° Rotation Control**:
     - Hover over any shape to reveal the green rotation handle (↻) in the top-right corner
     - Drag handle in circular motions around the shape's center point
     - Mathematical angle calculation using `atan2` for precise rotation
     - Smooth rotation animation with degree-accurate positioning
     - Perfect for creating dynamic, tilted, or oriented elements
   
   - **Smart Interaction System**:
     - **Group Hover Effects**: Handles appear only when hovering over shape groups
     - **Z-Index Management**: Active shapes automatically elevate to z-index 1000 during manipulation
     - **State Transitions**: Smooth opacity transitions (0.2s) for professional feel
     - **Instant Deletion**: Hold Shift key and click any shape for immediate removal
     - **Tooltip Guidance**: Helpful tooltips explain interaction methods

#### **Challenge Definition**
5. **Crafting the Perfect Answer**
   - **Answer Input Field**: Enter what your visual arrangement represents
   - **Examples of Great Answers**: 
     - Simple objects: "cat", "house", "car", "tree"
     - Complex scenes: "sunset over mountains", "robot dancing"
     - Abstract concepts: "happiness", "growth", "balance"
   - **Smart Processing**: Answers automatically convert to lowercase and trim whitespace
   - **Creative Freedom**: No length restrictions - from single words to descriptive phrases

#### **Saving and Management**
6. **Finalizing Your Creation**
   - **Save Challenge**: Click "💾 Save Challenge" to permanently add to your collection
   - **Smart Validation**: System prevents saving with helpful alerts if:
     - Canvas is empty: "Please add some shapes to the canvas first!"
     - Answer field is blank: "Please enter an answer for the challenge!"
   - **Clear Canvas**: Use "Clear All" button to remove all shapes and start fresh
   - **Navigation**: "← Back to Menu" button available at any time
   - **Success Confirmation**: Alert popup "Challenge saved! 🎉" confirms successful save

---

### 🎮 **Playing and Solving Visual Puzzles**

#### **Entering Play Mode**
1. **Launch Play Experience**
   - Click "🎮 Play Challenge" from the main menu
   - Enter the orange-to-pink gradient environment optimized for focused problem-solving

#### **Challenge Selection**
2. **Browse Your Puzzle Library**
   - **Organized Display**: All saved challenges appear in an elegant list format
   - **Difficulty Indicators**: Each challenge shows shape count (e.g., "🎯 House (5 shapes)")
   - **Smart Sorting**: Challenges display with names and complexity hints
   - **Empty State Handling**: If no challenges exist, helpful prompt guides you to create your first puzzle
   - **One-Click Selection**: Click any challenge button to immediately begin solving

#### **Active Problem-Solving**
3. **The Solving Experience**
   - **Visual Analysis Phase**: Study the static arrangement of black shapes on the white canvas
   - **Unlimited Study Time**: No pressure - examine the puzzle as long as needed before guessing
   - **Input Interface**: Clean text field for entering your interpretation
   - **Dual Submission Methods**: 
     - Press Enter key for quick submission
     - Click "Submit Guess" button for deliberate submission
   - **Immediate Feedback**: Incorrect guesses display ❌ with encouraging "Not quite! Try again." message

#### **Performance Tracking**
4. **Smart Analytics System**
   - **Attempt Counter**: Visible attempt number increments with each guess
   - **Intelligent Timer**: 
     - Starts automatically on your first guess attempt
     - Allows unlimited study time before first guess
     - Tracks solving efficiency with second-precision accuracy
   - **No Pressure Environment**: Focus on solving rather than speed

#### **Victory and Celebration**
5. **Success Experience**
   - **Animated Celebration**: Correct answers trigger large 🎯 emoji with celebration screen
   - **Detailed Performance Metrics**:
     - **Attempt Efficiency**: "You solved it in **X** attempts!"
     - **Time Performance**: "Completed in **X** seconds!"
     - **Encouraging Messaging**: Personalized success congratulations
   - **Continue Playing Options**:
     - "Play Another Challenge" button for immediate next puzzle
     - Return to challenge selection for browsing

#### **Navigation and Flow**
6. **Seamless User Experience**
   - **Flexible Navigation**: 
     - "← Choose Different Challenge" to browse other puzzles mid-game
     - "← Back to Menu" available from every screen
   - **Progress Awareness**: Main menu displays total saved challenges count
   - **State Persistence**: Game remembers your progress and preferences across sessions

---

### 💡 **Pro Strategies for Mastery**

#### **Creation Excellence**
- **Start Simple**: Begin with 2-3 shapes to master the tools, then build complexity
- **Think Visually**: Consider how shapes can represent both literal objects and abstract concepts
- **Use Rotation Creatively**: Tilted shapes can suggest movement, direction, or dynamic energy
- **Layer Thoughtfully**: Overlap shapes to create depth and more complex visual narratives

#### **Solving Success**
- **Pattern Recognition**: Look for familiar shapes, objects, or scenes in the arrangements
- **Consider Context**: Think about what the creator might have intended - both obvious and creative interpretations
- **Multiple Perspectives**: Sometimes rotating your mental view of the puzzle reveals the answer
- **Abstract Thinking**: Don't limit yourself to literal objects - consider emotions, concepts, or actions

#### **Technical Optimization**
- **Mobile Excellence**: All controls are touch-optimized for seamless smartphone and tablet gameplay
- **Cross-Platform**: Identical experience across desktop and mobile devices
- **Automatic Persistence**: Your challenges automatically save and survive browser restarts
- **Performance**: Smooth animations and responsive controls for professional-grade user experience

## Recent Updates & Current Status

### ✨ **Latest Improvements**
- **Enhanced Canvas Integration**: Added `canvasRef` prop to Canvas component for improved shape manipulation
- **Refined Component Architecture**: Completed modular refactoring with clean separation of concerns
- **Advanced Hook System**: Implemented `useShapeManipulation` hook for centralized interaction logic
- **Improved Type Safety**: Comprehensive TypeScript interfaces across all components
- **Mobile Optimization**: Enhanced responsive design with touch-optimized controls

### 🔧 **Current Implementation**
- **Fully Functional Create Mode**: Complete shape editor with all manipulation tools
- **Interactive Play Mode**: Challenge solving with performance tracking
- **Local Storage Persistence**: Reliable challenge saving and loading
- **Cross-Device Compatibility**: Consistent experience across mobile and desktop
- **Professional UI/UX**: Polished interface with smooth animations and transitions

## Technical Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Frontend UI framework with TypeScript
- **[Vite](https://vite.dev/)**: Fast build tool and development server
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript development

## Architecture

The game is built with a modular React component architecture featuring clean separation of concerns:

### Core Components
- **`App.tsx`**: Main application component managing global state, view routing, and challenge lifecycle
- **`MenuView.tsx`**: Main menu interface with navigation and challenge statistics
- **`CreateView.tsx`**: Challenge creation interface integrating shape tools and canvas
- **`PlayView.tsx`**: Challenge solving interface with guess input and performance tracking
- **`Canvas.tsx`**: Reusable canvas component handling shape rendering and manipulation interactions
- **`ShapeToolbar.tsx`**: Shape selection, sizing, and rotation controls

### Custom Hooks
- **`useShapeManipulation.ts`**: Advanced hook managing drag, resize, and rotate operations with mouse/touch events

### Type System
- **`types.ts`**: Comprehensive TypeScript interfaces ensuring type safety across all components
- **Shape Interface**: Defines shape properties (position, size, rotation, type)
- **Challenge Interface**: Structures puzzle data with metadata
- **Interaction Types**: Handles different manipulation modes (move, resize, rotate)

### Component Hierarchy
```
App (State Management & Routing)
├── MenuView (Navigation & Statistics)
├── CreateView (Challenge Creation)
│   ├── ShapeToolbar (Shape Controls)
│   └── Canvas (Interactive Editor)
└── PlayView (Challenge Solving)
    └── Canvas (Static Display)
```

The architecture emphasizes reusability, maintainability, and type safety with shared components and centralized state management.

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
