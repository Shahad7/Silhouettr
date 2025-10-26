import React, { useState, useEffect } from 'react';
import { MenuView, CreateView, ChallengeView, Leaderboard } from './components';
import { useShapeManipulation } from './hooks/useShapeManipulation';
import { Shape, View, HandleType } from './types';
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
  // Session state is managed within ChallengeView component

  // Challenge creation state
  const [selectedShape, setSelectedShape] = useState<string>(SHAPE_PALETTE[0]!);
  const [selectedSize, setSelectedSize] = useState<number>(10); // Size percentage
  const [selectedRotation, setSelectedRotation] = useState<number>(0); // Rotation in degrees
  const [shapes, setShapes] = useState<Shape[]>([]); // Array of {id, shape, xPercent, yPercent, sizePercent, rotation}
  const [answer, setAnswer] = useState<string>('');
  const [postTitle, setPostTitle] = useState<string>('');

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

  // Detect challenge mode from URL parameters or global context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId') || window.location.pathname.split('/').pop();
    
    if (postId && postId !== 'index.html') {
      setCurrentPostId(postId);
      setView('challenge');
    }
  }, []);

  // ========== CREATE CHALLENGE FUNCTIONS ==========

  const addShape = (): void => {
    const newShape: Shape = {
      id: generateId(),
      shape: selectedShape,
      xPercent: 40 + Math.random() * 20, // 40-60% of width
      yPercent: 37.5 + Math.random() * 25, // 37.5-62.5% of height
      sizePercent: selectedSize, // Use selected size
      rotation: selectedRotation, // Use selected rotation
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
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
    if (!postTitle.trim()) {
      alert('Please enter a title for your post!');
      return;
    }

    if (!answer.trim()) {
      alert('Please enter an answer for the challenge!');
      return;
    }

    if (shapes.length === 0) {
      alert('Please add some shapes to the canvas first!');
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
      setSelectedRotation(0);
      
      alert(`Challenge created! 🎉\nPost URL: ${data.postUrl}`);
      setView('menu');
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
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
    }
  };



  // ========== MAIN RENDER ==========

  return (
    <div className="font-sans">
      {view === 'menu' && (
        <MenuView
          onCreateClick={() => setView('create')}
          onPlayClick={handlePlayChallenge}
          {...(currentPostId && { onLeaderboardClick: handleViewLeaderboard })}
        />
      )}
      {view === 'create' && (
        <CreateView
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedRotation={selectedRotation}
          shapes={shapes}
          answer={answer}
          postTitle={postTitle}
          dragging={dragging}
          resizing={resizing}
          rotating={rotating}
          onShapeSelect={setSelectedShape}
          onSizeChange={setSelectedSize}
          onRotationChange={setSelectedRotation}
          onAddShape={addShape}
          onMouseMove={onMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          canvasRef={canvasRef}
          onShapeDelete={deleteShape}
          onAnswerChange={setAnswer}
          onPostTitleChange={setPostTitle}
          onClearCanvas={clearCanvas}
          onSaveChallenge={saveChallenge}
          onBackToMenu={() => setView('menu')}
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
