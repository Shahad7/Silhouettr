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
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-400 to-blue-500 p-3 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl p-4 flex-1 flex flex-col w-full max-w-2xl mx-auto min-h-0">
        <h2 className="text-lg font-bold text-center mb-3 text-gray-800 flex-shrink-0">
          ✏️ Create Challenge
        </h2>

        {/* Shape Toolbar */}
        <ShapeToolbar
          selectedShape={selectedShape}
          onShapeSelect={onShapeSelect}
          onAddShape={onAddShape}
        />

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center mb-3 min-h-0">
          <div className="w-full max-w-md">
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
        </div>

        {/* Input Section */}
        <div className="flex-shrink-0 space-y-2">
          {/* Post Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Title:</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => onPostTitleChange(e.target.value)}
              placeholder="My Shape Challenge"
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm ${errors?.postTitle
                ? 'border-red-500 focus:border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500'
                }`}
            />
            {errors?.postTitle && (
              <p className="text-red-600 text-xs mt-1">{errors.postTitle}</p>
            )}
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer:</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="house, star, etc."
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm ${errors?.answer
                ? 'border-red-500 focus:border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500'
                }`}
            />
            {errors?.answer && (
              <p className="text-red-600 text-xs mt-1">{errors.answer}</p>
            )}
          </div>

          {/* Shapes Error */}
          {errors?.shapes && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{errors.shapes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClearCanvas}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-400 transition text-sm"
            >
              Clear
            </button>
            <button
              onClick={onSaveChallenge}
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-600 transition text-sm"
            >
              💾 Save
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="w-full mt-2 bg-gray-700 text-white py-2 px-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};
