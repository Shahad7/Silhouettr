# 🎯 Shape Guess Challenge

An innovative visual puzzle game built on Reddit's Devvit platform where creativity meets challenge. Players become both artists and puzzle solvers, creating intricate visual riddles using Unicode shapes and challenging others to decode their artistic arrangements through Reddit's integrated gaming experience.

## What is Shape Guess Challenge?

Shape Guess Challenge is a comprehensive puzzle game that transforms simple Unicode symbols into engaging visual brain teasers. Using a palette of 10 carefully selected black geometric shapes (●, ▮, ▲, ★, ♦, ▼, ◆, ⬛, ⬤, ▪), players craft recognizable objects, patterns, scenes, or abstract concepts on a responsive digital canvas.

The game features three integrated gameplay modes that create a complete creative and competitive ecosystem:

### 🎨 **Create Mode** - Become the Puzzle Master
Design custom visual challenges using a professional-grade shape manipulation system:
- **Advanced Canvas Editor**: Drag-and-drop positioning with pixel-perfect precision using percentage-based coordinates
- **Real-time Shape Controls**: Live resizing (2-30% scale) and 360° rotation with visual feedback
- **Interactive Handles**: Hover-activated blue resize handles (⇕) and green rotation handles (↻) for fine-tuning
- **Smart Validation**: Prevents saving incomplete challenges and provides helpful guidance
- **Local Storage**: Challenges automatically save to browser storage for instant access
- **Unlimited Creativity**: No restrictions on complexity - create simple icons or elaborate scenes

### 🎮 **Play Mode** - Master Local Puzzles  
Solve locally-created challenges with comprehensive performance tracking:
- **Visual Analysis**: Study static shape arrangements to identify hidden meanings
- **Smart Timing System**: Automatic timer activation on first guess attempt (allows unlimited study time)
- **Attempt Analytics**: Track solving efficiency with detailed attempt counting
- **Instant Feedback**: Real-time validation with encouraging messages for incorrect guesses
- **Achievement Celebration**: Success screens with performance metrics and completion times
- **Challenge Library**: Browse and select from all your saved challenges with difficulty indicators

### 🏆 **Challenge Mode** - Reddit-Integrated Competition
Experience server-backed challenges with leaderboards and social features:
- **Default Challenges**: Pre-built challenges available immediately upon app installation
- **Real-time Performance Tracking**: Server-side session management with precise timing and attempt counting
- **Global Leaderboards**: Compete with other Reddit users on completion time and attempts
- **Persistent Progress**: Your performance is saved and ranked across the Reddit community
- **Social Integration**: Challenges tied to specific Reddit posts for community engagement
- **Live Competition**: Real-time leaderboard updates showing your position among all players

Built as a React TypeScript application for Reddit's Devvit platform, the game integrates seamlessly into Reddit posts, making it instantly accessible to millions of users without requiring external downloads or account creation.

## What Makes This Game Unique?

### 🎨 **Interactive Shape Creation System**
Unlike static puzzle games, Shape Guess Challenge features a sophisticated drag-and-drop editor where players can:
- **Position shapes with pixel precision** using percentage-based coordinates that work across all devices
- **Resize shapes dynamically** from 2% to 30% of canvas size with real-time visual feedback
- **Rotate shapes 360 degrees** with intuitive circular drag controls for perfect orientation
- **Layer and overlap shapes** to create complex visual narratives and depth

### 🏆 **Dual-Layer Gaming Experience**
The game uniquely combines local creativity with global competition:
- **Local Creative Mode**: Build and solve personal challenges with instant feedback and local storage
- **Reddit-Integrated Challenges**: Server-backed challenges with real-time leaderboards and community competition
- **Seamless Mode Switching**: Players can create locally and compete globally within the same interface
- **Progressive Difficulty**: Start with default challenges, then explore community-created content

### 🧩 **Community-Driven Puzzle Ecosystem**
Every player is both creator and solver, generating an endless stream of unique challenges:
- **Personal Challenge Libraries**: Each player builds their own collection of visual puzzles
- **Reddit Post Integration**: Challenges are embedded directly in Reddit posts for maximum accessibility
- **Global Leaderboards**: Compete with the entire Reddit community on solving speed and efficiency
- **Social Sharing**: Challenges can be shared and solved within Reddit communities with persistent rankings

### 📱 **Mobile-First Reddit Integration**
Specifically designed for Reddit's mobile-heavy user base:
- **Touch-optimized controls** with hover states that work on both desktop and mobile
- **Responsive canvas** that maintains perfect proportions across all screen sizes
- **Native Reddit experience** - no external apps or downloads required
- **Instant accessibility** - playable directly within Reddit posts with automatic user authentication

## Current Game Features

### 🎨 **Advanced Shape Manipulation System**
- **10 Unique Unicode Shapes**: Carefully selected black geometric symbols (●, ▮, ▲, ★, ♦, ▼, ◆, ⬛, ⬤, ▪) optimized for visual storytelling
- **Real-Time Canvas Editor**: Drag-and-drop positioning with percentage-based coordinates for cross-device consistency
- **Interactive Control Handles**: 
  - Blue resize handles (⇕) for scaling shapes from 2-30% of canvas size
  - Green rotation handles (↻) for 360-degree rotation control
  - Hover-activated controls that appear only when needed
- **Smart Shape Management**: Shift+Click deletion, z-index management during manipulation, and visual feedback systems

### 🎮 **Multi-Mode Gameplay Architecture**
- **Create Mode**: Professional-grade visual editor for designing custom challenges with local storage
- **Play Mode**: Local puzzle-solving interface with performance tracking and analytics
- **Challenge Mode**: Server-integrated Reddit challenges with real-time competition features
- **Seamless Navigation**: Fluid transitions between all modes with state preservation

### 🏆 **Server-Side Challenge System**
- **Default Challenge Creation**: Automatic challenge generation when the app is installed on a subreddit
- **Real-Time Session Management**: Server-tracked user sessions with precise timing and attempt counting
- **Global Leaderboards**: Redis-backed ranking system comparing players across the entire Reddit community
- **Performance Metrics**: Comprehensive tracking of completion times, attempts, and leaderboard positions
- **Persistent User Progress**: Challenge completion data saved server-side and tied to Reddit user accounts

### 💾 **Dual-Layer Data Persistence**
- **Local Storage Integration**: Personal challenges automatically save to browser storage for offline access
- **Server-Side Storage**: Reddit-integrated challenges stored in Redis with cross-device synchronization
- **Complex Data Serialization**: Preserves shape positions, sizes, rotations, and metadata in both systems
- **Error Recovery**: Graceful handling of corrupted data with fallback systems for both local and server storage
- **Session Persistence**: Maintains game state across browser restarts and device switches

### 📊 **Advanced Performance Analytics**
- **Smart Timer System**: Begins timing only on first guess attempt with millisecond precision
- **Attempt Tracking**: Detailed counting of solving efficiency with server-side validation
- **Success Celebrations**: Animated victory screens with personalized metrics and leaderboard positions
- **Challenge Statistics**: Shape count indicators, difficulty assessment, and community performance comparisons
- **Real-Time Leaderboards**: Live ranking updates showing your position among all Reddit players

## How to Play Shape Guess Challenge

### 🎯 **Game Overview**
Shape Guess Challenge is a creative puzzle game where players use Unicode shapes to create visual riddles. The game features three distinct modes: **Create** (design personal challenges), **Play** (solve local challenges), and **Challenge** (compete in Reddit-integrated challenges with leaderboards).

### 🎨 **Creating Personal Challenges (Create Mode)**

1. **Start Creating**
   - Click "🎨 Create Challenge" from the main menu's vibrant interface
   - Enter the green-to-blue gradient creative environment
   - You'll see a shape toolbar at the top and a responsive canvas below

2. **Choose Your Shapes**
   - Select from 10 different Unicode shapes: ●, ▮, ▲, ★, ♦, ▼, ◆, ⬛, ⬤, ▪
   - Active shapes display with blue background highlighting
   - Adjust the size (2-30% of canvas) using the responsive size slider
   - Set rotation (0-359°) using the precision rotation control
   - Click "Add Shape" to place it on the canvas at a randomized starting position

3. **Advanced Shape Manipulation**
   - **Move**: Click and drag any shape to reposition it with pixel-perfect precision
   - **Resize**: Hover over a shape to reveal the blue handle (⇕), then drag up/down to change size
   - **Rotate**: Hover over a shape to reveal the green handle (↻), then drag in circular motions for 360° rotation
   - **Delete**: Hold Shift and click any shape to instantly remove it
   - **Visual Feedback**: Handles appear only on hover, active shapes elevate with z-index management

4. **Set Your Answer**
   - Enter what your shape arrangement represents in the answer field
   - Examples: "house", "cat", "sunset", "robot dancing", "happiness"
   - Answers automatically convert to lowercase and trim whitespace

5. **Save Your Challenge**
   - Click "💾 Save Challenge" to add it to your local collection with automatic browser storage
   - Smart validation prevents saving with helpful alerts for missing shapes or answers
   - Use "Clear All" to remove all shapes and start fresh
   - Success confirmation: "Challenge saved! 🎉"

### 🎮 **Playing Local Challenges (Play Mode)**

1. **Select a Challenge**
   - Click "🎮 Play Challenge" from the main menu
   - Browse your elegant challenge library with difficulty indicators
   - Each challenge shows name and shape count (e.g., "🎯 House (5 shapes)")
   - Empty state guides you to create your first puzzle if none exist

2. **Study the Puzzle**
   - Examine the static arrangement of black shapes on the white canvas
   - Take unlimited time to analyze - no pressure before your first guess
   - Canvas maintains perfect 5:4 aspect ratio across all devices

3. **Make Your Guess**
   - Type what you think the shapes represent in the clean input field
   - Press Enter or click "Submit Guess" for dual submission methods
   - Get instant feedback: ❌ "Not quite! Try again." for incorrect guesses
   - Input field clears automatically after incorrect attempts

4. **Track Your Performance**
   - Visible attempt counter increments with each guess
   - Smart timer starts only on your first guess attempt
   - See detailed performance metrics upon successful completion
   - Animated celebration screen with 🎯 emoji for correct answers

5. **Continue Playing**
   - "Play Another Challenge" button for immediate next puzzle
   - "← Choose Different Challenge" to browse other puzzles mid-game
   - Seamless navigation maintains your progress and preferences

### 🏆 **Competing in Reddit Challenges (Challenge Mode)**

1. **Access Reddit Challenges**
   - When the app is installed on a subreddit, a default challenge is automatically created
   - Click the "🎯 Play Challenge" button from the Reddit post to enter Challenge Mode
   - Automatic detection switches to challenge mode with server integration

2. **Server-Tracked Gameplay**
   - Your session is automatically created and tracked server-side with Redis storage
   - Real-time timer displays in the header with precise elapsed time tracking
   - All attempts are recorded and validated by the server with immediate feedback
   - Offline detection prevents submissions when internet connection is lost

3. **Professional Challenge Interface**
   - Clean header shows challenge name, timer, and attempt counter
   - Responsive canvas renders server-provided shapes with HTML5 Canvas API
   - Real-time performance metrics update as you play
   - Loading states and error handling for network issues

4. **Study and Solve**
   - Examine the challenge shapes rendered with precise positioning and rotation
   - The interface shows your current attempt count and elapsed time in real-time
   - Enter your guess in the bottom input field with placeholder guidance
   - Submit button provides clear feedback ("Submitting...", "Offline", etc.)

5. **Real-Time Competition**
   - Correct answers immediately update the global leaderboard stored in Redis
   - See your ranking among all Reddit players who completed the challenge
   - Performance metrics include attempts, completion time, and leaderboard position
   - Instant leaderboard position notification upon successful completion

6. **Celebration and Continuation**
   - Animated success screens show detailed performance metrics and community ranking
   - Performance breakdown includes attempts, time elapsed, and leaderboard position
   - Options to "Play Again" or return to menu with state preservation
   - Your completion data is permanently saved to your Reddit profile

7. **View Global Leaderboards**
   - Click "🏆 View Leaderboard" from the main menu in challenge mode
   - See top performers with usernames, attempts, completion times, and ranks
   - Your position is highlighted if you've completed the challenge
   - Real-time updates show the latest completions and rankings

### 💡 **Pro Tips**
- **For Creators**: Start simple with 2-3 shapes, use rotation creatively, think about both literal objects and abstract concepts
- **For Local Solvers**: Look for familiar patterns, consider multiple perspectives, don't limit yourself to obvious interpretations  
- **For Reddit Competitors**: Study the challenge thoroughly before your first guess - the timer starts immediately and affects your leaderboard position
- **Mobile Optimization**: All controls are touch-optimized with responsive design that works perfectly on smartphones and tablets
- **Performance Strategy**: Take time to analyze before guessing - unlimited study time doesn't count against your completion time

## What Makes This Game Innovative?

### 🎨 **Dual-Layer Gaming Ecosystem**
Shape Guess Challenge uniquely combines local creativity with global competition in a seamless experience:
- **Local Creative Sandbox**: Build unlimited personal challenges with instant browser storage and offline access
- **Reddit-Integrated Competition**: Server-backed challenges with real-time leaderboards and community rankings
- **Seamless Mode Switching**: Players can create locally and compete globally within the same polished interface
- **Progressive Engagement**: Start with personal challenges, then compete in Reddit's social gaming environment

### 🔧 **Professional-Grade Visual Editor**
The game features a sophisticated shape manipulation system that rivals professional design software:

**Advanced Interaction System:**
- **Precision Positioning**: Percentage-based coordinate system ensures pixel-perfect placement across all screen sizes
- **Multi-Handle Controls**: Hover-activated blue resize handles (⇕) and green rotation handles (↻) provide intuitive editing
- **Real-Time Feedback**: Live size percentages (2-30%) and rotation degrees (0-359°) with smooth visual transitions
- **Smart State Management**: Seamless switching between drag, resize, and rotate modes with visual indicators
- **Responsive Canvas**: Maintains perfect 5:4 aspect ratio while adapting to any screen size from mobile to desktop

**Intuitive Editing Features:**
- **Quick Actions**: Shift+Click deletion for rapid iteration and experimentation
- **Visual Hierarchy**: Z-index management keeps active shapes on top during manipulation
- **Professional Controls**: Hover-activated handles that appear only when needed for clean interface
- **Error Prevention**: Smart validation prevents saving incomplete or invalid challenges with helpful guidance

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

### 💾 **Intelligent Dual-Storage System**
Implements both local and server-side storage for optimal user experience:
- **Local Browser Storage**: Personal challenges automatically save with complex data serialization
- **Server-Side Persistence**: Reddit challenges stored in Redis with cross-device synchronization
- **Error Recovery**: Graceful handling of corrupted data with fallback systems for both storage types
- **Session Persistence**: Challenges and progress survive browser restarts and device switches
- **Unlimited Local Storage**: Only limited by browser capacity, supporting hundreds of personal challenges
- **Instant Loading**: Local challenges load immediately, server challenges cache for optimal performance

### ⚡ **Advanced Performance Analytics**
Comprehensive tracking system that gamifies the solving experience:
- **Smart Timer Logic**: Begins timing only on first guess attempt, allowing unlimited study time
- **Precision Metrics**: Millisecond-accurate timing converted to user-friendly second displays
- **Dual-Mode Tracking**: Local performance for personal challenges, server tracking for Reddit competition
- **Celebration System**: Animated success screens with personalized performance breakdowns
- **Difficulty Assessment**: Shape count indicators help players choose appropriate challenge levels
- **Progress Visualization**: Clear display of total challenges created and completion statistics

### 🏆 **Revolutionary Server-Side Reddit Integration**
Transforms the game into a social competitive experience:
- **Automatic Challenge Deployment**: Default challenges created instantly when app is installed on any subreddit
- **Real-Time Session Management**: Server tracks user sessions with millisecond precision using Redis storage
- **Global Leaderboard System**: 
  - Redis sorted sets maintain rankings across all Reddit users
  - Scoring algorithm combines completion time and attempt count for fair competition
  - Live leaderboard updates show your position immediately after completion
- **Cross-Device Synchronization**: Your progress and rankings persist across all devices through Reddit authentication
- **Community Competition**: Compete with thousands of Reddit users in real-time challenges
- **Performance Persistence**: All completion data permanently stored and tied to your Reddit account

### 🎯 **Community-Driven Content Creation**
Unlike traditional puzzle games with fixed content, Shape Guess Challenge creates a self-sustaining ecosystem:
- **Every Player is a Creator**: Dual-role system where players both create and solve challenges
- **Infinite Content Generation**: Community continuously contributes new visual puzzles
- **Local and Global Sharing**: Personal challenges for practice, Reddit challenges for competition
- **Creative Freedom**: No restrictions on complexity - from simple icons to elaborate artistic scenes
- **Social Validation**: Reddit integration provides community feedback and recognition for creative challenges

## Advanced Gameplay Guide

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

### ✨ **Latest Major Features**
- **Complete Reddit Challenge Integration**: Full server-side challenge system with Redis storage and real-time leaderboards
- **ChallengeView Component**: Dedicated interface for Reddit-integrated challenges with live timer and attempt tracking
- **Server-Side Session Management**: Automatic user session creation and tracking with performance analytics
- **Global Leaderboard System**: Redis-backed ranking system comparing players across the entire Reddit community
- **Default Challenge Creation**: Automatic challenge generation when the app is installed on any subreddit
- **Offline Detection**: Smart offline/online detection with graceful degradation and automatic retry

### 🔧 **Current Implementation Status**
- **✅ Fully Functional Create Mode**: Complete shape editor with all manipulation tools and local browser storage
- **✅ Interactive Local Play Mode**: Challenge solving with performance tracking for personal challenges
- **✅ Reddit Challenge Mode**: Server-integrated challenges with real-time competition and leaderboards
- **✅ Cross-Device Compatibility**: Consistent experience across mobile and desktop with responsive design
- **✅ Professional UI/UX**: Polished interface with smooth animations, loading states, and comprehensive error handling
- **✅ Complete Server Infrastructure**: Express.js backend with Redis integration and Reddit API connectivity
- **✅ Real-Time Performance Tracking**: Precise timing, attempt counting, and leaderboard position updates

### 🚧 **Integration Status**
- **✅ Server Endpoints**: All API endpoints implemented and functional (`/api/challenge/:postId`, `/api/submit-guess`, `/api/leaderboard/:postId`)
- **✅ Client Components**: ChallengeView, Timer, AttemptCounter, and Leaderboard components fully implemented and integrated
- **✅ Data Flow**: Complete client-server communication with proper error handling, loading states, and retry logic
- **✅ Performance Tracking**: Real-time session management with precise timing and attempt counting
- **✅ Reddit Integration**: Seamless authentication and post-based challenge system with automatic mode detection
- **✅ Offline Support**: Network status detection with graceful degradation and user feedback

## Technical Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Frontend UI framework with TypeScript
- **[Vite](https://vite.dev/)**: Fast build tool and development server
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript development

## Architecture

The game is built with a modular React component architecture featuring clean separation of concerns:

### Core Components
- **`App.tsx`**: Main application component managing global state, view routing, and Reddit challenge lifecycle
- **`MenuView.tsx`**: Main menu interface with navigation
- **`CreateView.tsx`**: Challenge creation interface integrating shape tools and canvas
- **`ChallengeView.tsx`**: Reddit-integrated challenge interface with server communication and leaderboards
- **`Canvas.tsx`**: Reusable canvas component handling shape rendering and manipulation interactions
- **`ShapeToolbar.tsx`**: Shape selection, sizing, and rotation controls
- **`Timer.tsx`**: Real-time timer component with precise elapsed time tracking
- **`AttemptCounter.tsx`**: Attempt tracking with performance metrics and visual feedback
- **`Leaderboard.tsx`**: Global ranking display with user position highlighting

### Custom Hooks
- **`useShapeManipulation.ts`**: Advanced hook managing drag, resize, and rotate operations with mouse/touch events

### Type System
- **`types.ts`**: Local component TypeScript interfaces for client-side functionality
- **`shared/types/api.ts`**: Comprehensive API interfaces shared between client and server
- **Shape Interface**: Defines shape properties (position, size, rotation, type)
- **Challenge Interface**: Structures puzzle data with metadata for both local and server challenges
- **Session Interface**: Manages user session data with timing and attempt tracking
- **API Response Types**: Structured responses for all server endpoints with error handling

### Component Hierarchy
```
App (Local State Management & Routing)
├── MenuView (Navigation & Statistics)
├── CreateView (Challenge Creation)
│   ├── ShapeToolbar (Shape Controls)
│   └── Canvas (Interactive Editor)
└── ChallengeView (Reddit-Integrated Challenges)
    ├── Timer (Real-time Tracking)
    ├── AttemptCounter (Performance Metrics)
    ├── Canvas (Server Challenge Display)
    └── Leaderboard (Global Rankings)
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
