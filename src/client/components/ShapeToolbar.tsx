import React from 'react';

const SHAPE_PALETTE: string[] = ['●', '▮', '▲', '★', '♦', '▼', '◆', '⬛', '⬤', '▪'];

interface ShapeToolbarProps {
  selectedShape: string;
  onShapeSelect: (shape: string) => void;
  onAddShape: () => void;
}

export const ShapeToolbar: React.FC<ShapeToolbarProps> = ({
  selectedShape,
  onShapeSelect,
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
            className={`text-3xl sm:text-4xl p-2 sm:p-3 rounded-lg transition ${selectedShape === shape
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

      <button
        onClick={onAddShape}
        className="w-full bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm sm:text-base"
      >
        + Add Shape
      </button>
      <p className="text-xs text-gray-500 mt-2">
        💡 After adding: Blue handle (⇕) = resize | Green handle (↻) = rotate | Red button (✕) = delete
      </p>
    </div>
  );
};
