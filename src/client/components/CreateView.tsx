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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-3 w-full max-w-[360px] shadow-xl mx-auto flex flex-col">
        {/* Shape Toolbar */}
        <ShapeToolbar
          selectedShape={selectedShape}
          onShapeSelect={onShapeSelect}
          onAddShape={onAddShape}
        />

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center mb-3 min-h-0">
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

        {/* Input Section - Ultra Compact */}
        <div className="flex-shrink-0 space-y-2">
          <div>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => onPostTitleChange(e.target.value)}
              placeholder="Title"
              maxLength={100}
              className={`w-full px-2 py-1 rounded border text-sm ${errors?.postTitle
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500'
                }`}
            />
            {errors?.postTitle && (
              <p className="text-red-600 text-xs mt-1">{errors.postTitle}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Answer"
              maxLength={50}
              className={`w-full px-2 py-1 rounded border text-sm ${errors?.answer
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500'
                }`}
            />
            {errors?.answer && (
              <p className="text-red-600 text-xs mt-1">{errors.answer}</p>
            )}
          </div>

          {errors?.shapes && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-red-700 text-xs">{errors.shapes}</p>
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={onClearCanvas}
              className="flex-1 py-1 bg-gray-200 text-gray-800 rounded text-xs border border-gray-300 hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onSaveChallenge}
              className="flex-1 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="w-full py-1 bg-gray-200 text-gray-800 rounded text-xs border border-gray-300 hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};
