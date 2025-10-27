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
    <div className="mb-3 flex-shrink-0">
      <p className="text-sm font-medium text-gray-700 mb-2">Select Shape:</p>
      <div className="flex gap-1 flex-wrap items-center mb-3">
        {SHAPE_PALETTE.map((shape) => (
          <button
            key={shape}
            onClick={() => onShapeSelect(shape)}
            className={`text-2xl p-2 rounded-lg transition ${selectedShape === shape
              ? 'bg-blue-500 ring-2 ring-blue-300'
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
        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition text-sm"
      >
        + Add Shape
      </button>
      <p className="text-xs text-gray-500 mt-1">
        💡 Tap shape, then: Blue (⇕) resize | Green (↻) rotate | Red (✕) delete
      </p>
    </div>
  );
};
