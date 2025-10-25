import React, { useState, useEffect } from 'react';
import { MenuView, CreateView, PlayView } from './components';
import { useShapeManipulation } from './hooks/useShapeManipulation';
import { Shape, Challenge, View, HandleType } from './types';

// Utility function to generate unique IDs
const generateId = (): string => '_' + Math.random().toString(36).substr(2, 9);

// Available shapes for the toolbar - using solid black Unicode shapes
const SHAPE_PALETTE: string[] = ['●', '▮', '▲', '★', '♦', '▼', '◆', '⬛', '⬤', '▪'];

function App() {
  // Main view state: 'menu', 'create', 'play'
  const [view, setView] = useState<View>('menu');

  // Challenge creation state
  const [selectedShape, setSelectedShape] = useState<string>(SHAPE_PALETTE[0]!);
  const [selectedSize, setSelectedSize] = useState<number>(10); // Size percentage
  const [selectedRotation, setSelectedRotation] = useState<number>(0); // Rotation in degrees
  const [shapes, setShapes] = useState<Shape[]>([]); // Array of {id, shape, xPercent, yPercent, sizePercent, rotation}
  const [answer, setAnswer] = useState<string>('');

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

  // Saved challenges (loaded from localStorage)
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Play state
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [solved, setSolved] = useState<boolean>(false);
  const [solveTime, setSolveTime] = useState<number>(0);

  // Load challenges from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('shapeGuessChallenges');
    if (saved) {
      try {
        setChallenges(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading challenges:', e);
        setChallenges([]);
      }
    }
  }, []);

  // Save challenges to localStorage whenever they change
  useEffect(() => {
    if (challenges && challenges.length > 0) {
      localStorage.setItem('shapeGuessChallenges', JSON.stringify(challenges));
    }
  }, [challenges]);

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
    handleMouseMove(e, shapes, setShapes);
  };

  const deleteShape = (shapeId: string): void => {
    setShapes((prevShapes) => prevShapes.filter((s) => s.id !== shapeId));
  };

  const clearCanvas = (): void => {
    setShapes([]);
  };

  const saveChallenge = (): void => {
    if (!answer.trim()) {
      alert('Please enter an answer for the challenge!');
      return;
    }

    if (shapes.length === 0) {
      alert('Please add some shapes to the canvas first!');
      return;
    }

    const newChallenge: Challenge = {
      id: generateId(),
      shapes: shapes.map(({ id, ...rest }) => rest), // Remove internal IDs, keep percentages and rotation
      answer: answer.toLowerCase().trim(),
      name: answer.trim(),
    };

    setChallenges((prevChallenges) => [...prevChallenges, newChallenge]);

    // Reset creator
    setShapes([]);
    setAnswer('');
    setSelectedRotation(0);
    alert('Challenge saved! 🎉');
  };

  // ========== PLAY CHALLENGE FUNCTIONS ==========

  const selectChallenge = (challengeId: string): void => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    setSelectedChallenge(challenge);
    setGuess('');
    setAttempts(0);
    setStartTime(null);
    setSolved(false);
    setSolveTime(0);
  };

  const submitGuess = (): void => {
    if (!selectedChallenge) return;

    // Start timer on first attempt
    if (attempts === 0) {
      setStartTime(Date.now());
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Check if guess is correct
    if (guess.toLowerCase().trim() === selectedChallenge.answer) {
      const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
      setSolveTime(timeTaken);
      setSolved(true);
    } else {
      alert('❌ Not quite! Try again.');
      setGuess('');
    }
  };



  // ========== MAIN RENDER ==========

  return (
    <div className="font-sans">
      {view === 'menu' && (
        <MenuView
          challenges={challenges}
          onCreateClick={() => setView('create')}
          onPlayClick={() => setView('play')}
        />
      )}
      {view === 'create' && (
        <CreateView
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedRotation={selectedRotation}
          shapes={shapes}
          answer={answer}
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
          onClearCanvas={clearCanvas}
          onSaveChallenge={saveChallenge}
          onBackToMenu={() => setView('menu')}
        />
      )}
      {view === 'play' && (
        <PlayView
          challenges={challenges}
          selectedChallenge={selectedChallenge}
          guess={guess}
          attempts={attempts}
          solved={solved}
          solveTime={solveTime}
          onChallengeSelect={selectChallenge}
          onGuessChange={setGuess}
          onSubmitGuess={submitGuess}
          onBackToMenu={() => setView('menu')}
          onCreateChallenge={() => setView('create')}
          onDeselectChallenge={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
}

export default App;
