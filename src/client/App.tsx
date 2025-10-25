import React, { useState, useEffect, useRef, JSX } from 'react';

// Utility function to generate unique IDs
const generateId = (): string => '_' + Math.random().toString(36).substr(2, 9);

// Available shapes for the toolbar - using solid black Unicode shapes
const SHAPE_PALETTE: string[] = ['●', '▮', '▲', '★', '♦', '▼', '◆', '⬛', '⬤', '▪'];

// Canvas dimensions for reference
const CANVAS_WIDTH: number = 500;
const CANVAS_HEIGHT: number = 400;

function App() {
  // Main view state: 'menu', 'create', 'play'
  const [view, setView] = useState<View>('menu');

  // Challenge creation state
  const [selectedShape, setSelectedShape] = useState<string>(SHAPE_PALETTE[0]!);
  const [selectedSize, setSelectedSize] = useState<number>(10); // Size percentage
  const [selectedRotation, setSelectedRotation] = useState<number>(0); // Rotation in degrees
  const [shapes, setShapes] = useState<Shape[]>([]); // Array of {id, shape, xPercent, yPercent, sizePercent, rotation}
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [answer, setAnswer] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

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
    e.preventDefault();
    e.stopPropagation();
    const shape = shapes.find((s) => s.id === shapeId);
    if (!shape || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    if (handleType === 'resize') {
      setResizing(shapeId);
      setOffset({
        x: e.clientX,
        y: e.clientY,
        initialSize: shape.sizePercent,
      });
    } else if (handleType === 'rotate') {
      setRotating(shapeId);
      const shapeX = (shape.xPercent / 100) * canvasWidth;
      const shapeY = (shape.yPercent / 100) * canvasHeight;
      const centerX = rect.left + shapeX;
      const centerY = rect.top + shapeY;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      setOffset({
        x: 0,
        y: 0,
        centerX,
        centerY,
        initialRotation: shape.rotation,
        startAngle: angle,
      });
    } else {
      // Calculate pixel position from percentage
      const shapeX = (shape.xPercent / 100) * canvasWidth;
      const shapeY = (shape.yPercent / 100) * canvasHeight;

      setDragging(shapeId);
      setOffset({
        x: e.clientX - rect.left - shapeX,
        y: e.clientY - rect.top - shapeY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (resizing) {
      const deltaY = e.clientY - offset.y; // Positive delta = bigger (pull down)
      const sizeDelta = deltaY * 0.1; // Sensitivity
      const newSize = Math.max(2, Math.min(30, (offset.initialSize || 10) + sizeDelta));

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === resizing ? { ...s, sizePercent: newSize } : s))
      );
    } else if (rotating && offset.centerX !== undefined && offset.centerY !== undefined) {
      const angle =
        Math.atan2(e.clientY - offset.centerY, e.clientX - offset.centerX) * (180 / Math.PI);
      const deltaAngle = angle - (offset.startAngle || 0);
      const newRotation = ((offset.initialRotation || 0) + deltaAngle) % 360;

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === rotating ? { ...s, rotation: newRotation } : s))
      );
    } else if (dragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      // Calculate pixel position
      const newX = e.clientX - rect.left - offset.x;
      const newY = e.clientY - rect.top - offset.y;

      // Convert to percentage
      const newXPercent = Math.max(0, Math.min(100, (newX / canvasWidth) * 100));
      const newYPercent = Math.max(0, Math.min(100, (newY / canvasHeight) * 100));

      setShapes((prevShapes) =>
        prevShapes.map((s) =>
          s.id === dragging ? { ...s, xPercent: newXPercent, yPercent: newYPercent } : s
        )
      );
    }
  };

  const handleMouseUp = (): void => {
    setDragging(null);
    setResizing(null);
    setRotating(null);
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

  // ========== RENDER FUNCTIONS ==========

  const renderCanvas = (
    shapesToRender: Omit<Shape, 'id'>[] | Shape[] = [],
    isPlayMode: boolean = false
  ): JSX.Element => {
    return (
      <div
        ref={!isPlayMode ? canvasRef : null}
        onMouseMove={!isPlayMode ? handleMouseMove : undefined}
        onMouseUp={!isPlayMode ? handleMouseUp : undefined}
        onMouseLeave={!isPlayMode ? handleMouseUp : undefined}
        className="relative bg-white border-4 border-gray-800 rounded-lg overflow-visible w-full max-w-full"
        style={{
          aspectRatio: '5/4', // Maintains 500:400 ratio
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {shapesToRender.map((shape, index) => {
          // Calculate actual size based on canvas width (responsive)
          const fontSize = `${shape.sizePercent}vw`;
          const maxFontSize = `${(shape.sizePercent / 100) * 500}px`; // Cap at design size

          const shapeWithId = shape as Shape;
          const hasId = 'id' in shape;

          return (
            <div
              key={hasId ? shapeWithId.id : index}
              className={`absolute select-none ${!isPlayMode ? 'group' : ''}`}
              style={{
                left: `${shape.xPercent}%`,
                top: `${shape.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex:
                  hasId &&
                  (dragging === shapeWithId.id ||
                    resizing === shapeWithId.id ||
                    rotating === shapeWithId.id)
                    ? 1000
                    : 1,
              }}
            >
              <div
                onMouseDown={
                  !isPlayMode && hasId
                    ? (e) => handleMouseDown(e, shapeWithId.id, 'move')
                    : undefined
                }
                onClick={
                  !isPlayMode &&
                  dragging === null &&
                  resizing === null &&
                  rotating === null &&
                  hasId
                    ? (e) => {
                        if (e.shiftKey) {
                          deleteShape(shapeWithId.id);
                        }
                      }
                    : undefined
                }
                className={`${!isPlayMode ? 'cursor-move hover:opacity-80' : ''}`}
                style={{
                  fontSize: `min(${fontSize}, ${maxFontSize})`,
                  lineHeight: 1,
                  color: '#000000',
                  WebkitTextFillColor: '#000000',
                  textShadow: 'none',
                  filter: 'grayscale(100%) brightness(0%)',
                  fontFamily: 'Arial, sans-serif',
                  transform: `rotate(${shape.rotation || 0}deg)`,
                  transition:
                    hasId &&
                    (dragging === shapeWithId.id ||
                      resizing === shapeWithId.id ||
                      rotating === shapeWithId.id)
                      ? 'none'
                      : 'opacity 0.2s',
                }}
                title={!isPlayMode ? 'Drag to move, Shift+Click to delete' : ''}
              >
                {shape.shape}
              </div>
              {!isPlayMode && hasId && (
                <>
                  <div
                    onMouseDown={(e) => handleMouseDown(e, shapeWithId.id, 'resize')}
                    className="absolute -bottom-3 -right-3 w-7 h-7 bg-blue-500 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{ zIndex: 1001 }}
                    title="Drag down/up to resize"
                  >
                    ⇕
                  </div>
                  <div
                    onMouseDown={(e) => handleMouseDown(e, shapeWithId.id, 'rotate')}
                    className="absolute -top-3 -right-3 w-7 h-7 bg-green-500 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{ zIndex: 1001 }}
                    title="Drag to rotate"
                  >
                    ↻
                  </div>
                </>
              )}
            </div>
          );
        })}
        {shapesToRender.length === 0 && !isPlayMode && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
            Click "Add Shape" to start creating
          </div>
        )}
      </div>
    );
  };

  // ========== VIEW COMPONENTS ==========

  const MenuView = (): JSX.Element => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎯 Shape Guess Challenge
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => setView('create')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
          >
            🎨 Create Challenge
          </button>
          <button
            onClick={() => setView('play')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
          >
            🎮 Play Challenge
          </button>
        </div>
        {challenges && challenges.length > 0 && (
          <p className="text-center mt-6 text-gray-600">
            {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} saved
          </p>
        )}
      </div>
    </div>
  );

  const CreateView = (): JSX.Element => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          ✏️ Create Your Challenge
        </h2>

        {/* Shape Toolbar */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Select Shape:</p>
          <div className="flex gap-2 flex-wrap items-center mb-4">
            {SHAPE_PALETTE.map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`text-3xl sm:text-4xl p-2 sm:p-3 rounded-lg transition ${
                  selectedShape === shape
                    ? 'bg-blue-500 ring-4 ring-blue-300'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                style={{
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {shape}
              </button>
            ))}
          </div>

          {/* Size Slider */}
          <div className="mb-3">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>Shape Size:</span>
              <span className="text-blue-600">{selectedSize}%</span>
            </label>
            <input
              type="range"
              min="2"
              max="30"
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Rotation Slider */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>Rotation:</span>
              <span className="text-green-600">{selectedRotation}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="359"
              value={selectedRotation}
              onChange={(e) => setSelectedRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <button
            onClick={addShape}
            className="w-full bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm sm:text-base"
          >
            + Add Shape
          </button>
          <p className="text-xs text-gray-500 mt-2">
            💡 Hover over shapes: Blue handle (⇕) = resize | Green handle (↻) = rotate | Shift+Click
            = delete
          </p>
        </div>

        {/* Canvas */}
        <div className="mb-4 sm:mb-6">{renderCanvas(shapes)}</div>

        {/* Answer Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer:</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., apple, star, house"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-400 transition text-sm sm:text-base"
          >
            Clear All
          </button>
          <button
            onClick={saveChallenge}
            className="flex-1 bg-green-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-600 transition text-sm sm:text-base"
          >
            💾 Save Challenge
          </button>
        </div>

        <button
          onClick={() => setView('menu')}
          className="w-full mt-4 bg-gray-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-800 transition text-sm sm:text-base"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );

  const PlayView = (): JSX.Element => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 to-pink-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          🎮 Play Challenge
        </h2>

        {/* Challenge Selector */}
        {!selectedChallenge && (
          <>
            {!challenges || challenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">No challenges yet!</p>
                <p className="text-gray-500 mb-6">Create one first to start playing.</p>
                <button
                  onClick={() => setView('create')}
                  className="bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition"
                >
                  🎨 Create Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select a Challenge:</p>
                {challenges &&
                  challenges.map((challenge) => (
                    <button
                      key={challenge.id}
                      onClick={() => selectChallenge(challenge.id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition text-left"
                    >
                      🎯 {challenge.name}{' '}
                      <span className="text-sm opacity-75">
                        ({challenge.shapes?.length || 0} shapes)
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Selected Challenge */}
        {selectedChallenge && !solved && (
          <>
            <div className="mb-4 sm:mb-6">{renderCanvas(selectedChallenge.shapes || [], true)}</div>

            <div className="mb-4 text-center text-gray-600">Attempts: {attempts}</div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Guess:</label>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                placeholder="What shape do you see?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={submitGuess}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition mb-4"
            >
              Submit Guess
            </button>

            <button
              onClick={() => setSelectedChallenge(null)}
              className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              ← Choose Different Challenge
            </button>
          </>
        )}

        {/* Success State */}
        {solved && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">You solved it!</h3>
            <p className="text-xl text-gray-700 mb-6">
              in <strong>{attempts}</strong> attempt{attempts !== 1 ? 's' : ''} and{' '}
              <strong>{solveTime}</strong> second{solveTime !== 1 ? 's' : ''}!
            </p>
            <button
              onClick={() => setSelectedChallenge(null)}
              className="bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-600 transition mb-3"
            >
              Play Another Challenge
            </button>
          </div>
        )}

        <button
          onClick={() => setView('menu')}
          className="w-full mt-4 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );

  // ========== MAIN RENDER ==========

  return (
    <div className="font-sans">
      {view === 'menu' && <MenuView />}
      {view === 'create' && <CreateView />}
      {view === 'play' && <PlayView />}
    </div>
  );
}

export default App;
