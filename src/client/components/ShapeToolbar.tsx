import React from 'react';

const SHAPE_PALETTE: string[] = ['●', '▮', '▲', '★', '♦', '▼', '◆', '⬛', '⬤', '▪'];

interface ShapeToolbarProps {
  selectedShape: string;
  selectedSize: number;
  selectedRotation: number;
  onShapeSelect: (shape: string) => void;
  onSizeChange: (size: number) => void;
  onRotationChange: (rotation: number) => void;
  onAddShape: () => void;
}

export const ShapeToolbar: React.FC<ShapeToolbarProps> = ({
  selectedShape,
  selectedSize,
  selectedRotation,
  onShapeSelect,
  onSizeChange,
  onRotationChange,
  onAddShape,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-2">Select Shape:</p>
      <div className="flex gap-2 flex-wrap items-center mb-4">
        {SHAPE_PALETTE.map((shape) => (
          <button
            key={shape}
            onClick={() => onShapeSelect(shape)}
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
          onChange={(e) => onSizeChange(Number(e.target.value))}
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
          onChange={(e) => onRotationChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      <button
        onClick={onAddShape}
        className="w-full bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm sm:text-base"
      >
        + Add Shape
      </button>
      <p className="text-xs text-gray-500 mt-2">
        💡 Hover over shapes: Blue handle (⇕) = resize | Green handle (↻) = rotate | Shift+Click
        = delete
      </p>
    </div>
  );
};
