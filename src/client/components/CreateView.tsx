import React from 'react';
import { Shape, HandleType } from '../types';
import { Canvas } from './Canvas';
import { ShapeToolbar } from './ShapeToolbar';

interface CreateViewProps {
  selectedShape: string;
  shapes: Shape[];
  answer: string;
  postTitle: string;
  dragging: string | null;
  resizing: string | null;
  rotating: string | null;
  onShapeSelect: (shape: string) => void;
  onAddShape: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseDown: (e: React.MouseEvent, shapeId: string, handleType?: HandleType) => void;
  onShapeDelete: (shapeId: string) => void;
  onAnswerChange: (answer: string) => void;
  onPostTitleChange: (postTitle: string) => void;
  onClearCanvas: () => void;
  onSaveChallenge: () => void | Promise<void>;
  onBackToMenu: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  errors?: {
    postTitle?: string;
    answer?: string;
    shapes?: string;
  };
}

export const CreateView: React.FC<CreateViewProps> = ({
  selectedShape,
  shapes,
  answer,
  postTitle,
  dragging,
  resizing,
  rotating,
  onShapeSelect,
  onAddShape,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onShapeDelete,
  onAnswerChange,
  onPostTitleChange,
  onClearCanvas,
  onSaveChallenge,
  onBackToMenu,
  canvasRef,
  errors,
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
          onShapeSelect={onShapeSelect}
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

        {/* Post Title Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title:</label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => onPostTitleChange(e.target.value)}
            placeholder="e.g., My First Shape Challenge, Guess This Pattern"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${errors?.postTitle
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
              }`}
          />
          {errors?.postTitle && (
            <p className="text-red-600 text-sm mt-1">{errors.postTitle}</p>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer:</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="e.g., apple, star, house"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${errors?.answer
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
              }`}
          />
          {errors?.answer && (
            <p className="text-red-600 text-sm mt-1">{errors.answer}</p>
          )}
        </div>

        {/* Shapes Error */}
        {errors?.shapes && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.shapes}</p>
          </div>
        )}

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
