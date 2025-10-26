import React from 'react';
import { Shape, HandleType } from '../types';
import { Canvas } from './Canvas';
import { ShapeToolbar } from './ShapeToolbar';

interface CreateViewProps {
  selectedShape: string;
  selectedSize: number;
  selectedRotation: number;
  shapes: Shape[];
  answer: string;
  dragging: string | null;
  resizing: string | null;
  rotating: string | null;
  onShapeSelect: (shape: string) => void;
  onSizeChange: (size: number) => void;
  onRotationChange: (rotation: number) => void;
  onAddShape: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseDown: (e: React.MouseEvent, shapeId: string, handleType?: HandleType) => void;
  onShapeDelete: (shapeId: string) => void;
  onAnswerChange: (answer: string) => void;
  onClearCanvas: () => void;
  onSaveChallenge: () => void | Promise<void>;
  onBackToMenu: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const CreateView: React.FC<CreateViewProps> = ({
  selectedShape,
  selectedSize,
  selectedRotation,
  shapes,
  answer,
  dragging,
  resizing,
  rotating,
  onShapeSelect,
  onSizeChange,
  onRotationChange,
  onAddShape,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onShapeDelete,
  onAnswerChange,
  onClearCanvas,
  onSaveChallenge,
  onBackToMenu,
  canvasRef,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          ✏️ Create Your Challenge
        </h2>

        {/* Shape Toolbar */}
        <ShapeToolbar
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedRotation={selectedRotation}
          onShapeSelect={onShapeSelect}
          onSizeChange={onSizeChange}
          onRotationChange={onRotationChange}
          onAddShape={onAddShape}
        />

        {/* Canvas */}
        <div className="mb-4 sm:mb-6">
          <Canvas
            shapes={shapes}
            isPlayMode={false}
            dragging={dragging}
            resizing={resizing}
            rotating={rotating}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onShapeDelete={onShapeDelete}
            canvasRef={canvasRef}
          />
        </div>

        {/* Answer Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer:</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="e.g., apple, star, house"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={onClearCanvas}
            className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-400 transition text-sm sm:text-base"
          >
            Clear All
          </button>
          <button
            onClick={onSaveChallenge}
            className="flex-1 bg-green-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-600 transition text-sm sm:text-base"
          >
            💾 Save Challenge
          </button>
        </div>

        <button
          onClick={onBackToMenu}
          className="w-full mt-4 bg-gray-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-800 transition text-sm sm:text-base"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};
