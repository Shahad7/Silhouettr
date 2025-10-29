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
      {/* Shape Grid - Ultra Compact */}
      <div className="grid grid-cols-6 gap-1 mb-2">
        {SHAPE_PALETTE.map((shape) => (
          <button
            key={shape}
            onClick={() => onShapeSelect(shape)}
            className={`text-lg p-1 transition ${selectedShape === shape
              ? 'bg-white text-black rounded'
              : 'text-white hover:bg-gray-700 rounded'
              }`}
            title={shape}
          >
            {shape}
          </button>
        ))}
      </div>

      {/* Add Button - Super Compact */}
      <button
        onClick={onAddShape}
        disabled={!selectedShape}
        className={`w-full py-1 rounded text-sm font-medium transition ${!selectedShape
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-white text-black hover:bg-gray-100 active:scale-95'
          }`}
      >
        Add Symbol
      </button>
    </div>
  );
};
