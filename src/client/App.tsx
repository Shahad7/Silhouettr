import React, { useState, useEffect } from 'react';
import { MenuView, CreateView, ChallengeView, Leaderboard } from './components';
import { useShapeManipulation } from './hooks/useShapeManipulation';
import { Shape, View, HandleType } from './types';
import { navigateTo } from '@devvit/web/client';
// UserSession is managed within ChallengeView component

// Utility function to generate unique IDs
const generateId = (): string => '_' + Math.random().toString(36).slice(2, 11);

// Available shapes for the toolbar - using solid black Unicode shapes
const SHAPE_PALETTE: string[] = ['●', '▮', '▲', '★', '♦', '▼', '◆', '⬛', '⬤', '▪'];

function App() {
  // Main view state: 'menu', 'create', 'challenge', 'leaderboard'
  const [view, setView] = useState<View>('menu');

  // Challenge mode state - always true now since we only support Reddit challenges
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [appInitialized, setAppInitialized] = useState<boolean>(false);
  // Session state is managed within ChallengeView component

  // Challenge creation state
  const [selectedShape, setSelectedShape] = useState<string>(SHAPE_PALETTE[0]!);
  const [shapes, setShapes] = useState<Shape[]>([]); // Array of {id, shape, xPercent, yPercent, sizePercent, rotation}
  const [answer, setAnswer] = useState<string>('');
  const [postTitle, setPostTitle] = useState<string>('');
  const [errors, setErrors] = useState<{
    postTitle?: string;
    answer?: string;
    shapes?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Shape manipulation hook
  const {
    dragging,
    resizing,
    rotating,
    canvasRef,
    handleMouseDown: handleShapeMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useShapeManipulation();

  // Initialize app and get postId from server context
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/init');
        if (response.ok) {
          const data = await response.json();
          if (data.type === 'init' && data.postId) {
            setCurrentPostId(data.postId);
            // Don't automatically switch to challenge view - let user choose
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // App can still work without postId for creating challenges
      } finally {
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // ========== CREATE CHALLENGE FUNCTIONS ==========

  const addShape = (): void => {
    const newShape: Shape = {
      id: generateId(),
      shape: selectedShape,
      xPercent: 40 + Math.random() * 20, // 40-60% of width
      yPercent: 37.5 + Math.random() * 25, // 37.5-62.5% of height
      sizePercent: 10, // Default size
      rotation: 0, // Default rotation
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
    // Clear any shapes error when adding a shape
    if (errors.shapes) {
      const { shapes, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    shapeId: string,
    handleType: HandleType = 'move'
  ): void => {
    handleShapeMouseDown(e, shapeId, shapes, handleType);
  };

  const onMouseMove = (e: React.MouseEvent): void => {
    handleMouseMove(e, setShapes);
  };

  const deleteShape = (shapeId: string): void => {
    setShapes((prevShapes) => prevShapes.filter((s) => s.id !== shapeId));
  };

  const clearCanvas = (): void => {
    setShapes([]);
  };

  const saveChallenge = async (): Promise<void> => {
    // Clear previous errors
    setErrors({});

    // Validate inputs
    const newErrors: typeof errors = {};

    if (!postTitle.trim()) {
      newErrors.postTitle = 'Please enter a title for your post!';
    }

    if (!answer.trim()) {
      newErrors.answer = 'Please enter an answer for the challenge!';
    }

    if (shapes.length === 0) {
      newErrors.shapes = 'Please add some shapes to the canvas first!';
    }

    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Create challenge via server API
      const response = await fetch('/api/create-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shapes: shapes.map(({ id, ...rest }) => rest), // Remove internal IDs
          answer: answer.toLowerCase().trim(),
          postTitle: postTitle.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      const data = await response.json();

      // Reset creator
      setShapes([]);
      setAnswer('');
      setPostTitle('');
      setErrors({});

      // Navigate to the newly created post using Devvit's navigation
      if (data.postUrl) {
        navigateTo(data.postUrl);
      } else {
        setSuccessMessage('Challenge created! 🎉');
        setView('menu');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      setErrors({ shapes: 'Failed to create challenge. Please try again.' });
    }
  };

  // ========== CHALLENGE MODE FUNCTIONS ==========

  const handleChallengeBack = (): void => {
    setView('menu');
  };

  const handleViewLeaderboard = (): void => {
    if (currentPostId) {
      setView('leaderboard');
    }
  };

  const handlePlayChallenge = (): void => {
    if (currentPostId) {
      setView('challenge');
    } else if (!appInitialized) {
      // Still initializing
      return;
    } else {
      // This shouldn't happen in a proper Devvit context
      console.warn('No challenge found - app may not be running in proper Reddit post context');
    }
  };



  // ========== MAIN RENDER ==========

  return (
    <div className="font-sans">
      {view === 'menu' && (
        <MenuView
          onCreateClick={() => setView('create')}
          {...(currentPostId && { onPlayClick: handlePlayChallenge })}
          {...(currentPostId && { onLeaderboardClick: handleViewLeaderboard })}
          isInitializing={!appInitialized}
          successMessage={successMessage}
          onClearSuccess={() => setSuccessMessage('')}
        />
      )}
      {view === 'create' && (
        <CreateView
          selectedShape={selectedShape}
          shapes={shapes}
          answer={answer}
          postTitle={postTitle}
          dragging={dragging}
          resizing={resizing}
          rotating={rotating}
          onShapeSelect={setSelectedShape}
          onAddShape={addShape}
          onMouseMove={onMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          canvasRef={canvasRef}
          onShapeDelete={deleteShape}
          onAnswerChange={(value) => {
            setAnswer(value);
            if (errors.answer) {
              const { answer, ...rest } = errors;
              setErrors(rest);
            }
          }}
          onPostTitleChange={(value) => {
            setPostTitle(value);
            if (errors.postTitle) {
              const { postTitle, ...rest } = errors;
              setErrors(rest);
            }
          }}
          onClearCanvas={clearCanvas}
          onSaveChallenge={saveChallenge}
          onBackToMenu={() => setView('menu')}
          errors={errors}
        />
      )}
      {view === 'challenge' && currentPostId && (
        <ChallengeView
          postId={currentPostId}
          onBack={handleChallengeBack}
        />
      )}
      {view === 'leaderboard' && currentPostId && (
        <Leaderboard
          postId={currentPostId}
          onBack={handleChallengeBack}
          onPlayChallenge={() => setView('challenge')}
        />
      )}
    </div>
  );
}

export default App;
