import React from 'react';

const SHAPE_PALETTE: string[] = ['●', '▲', '★', '♦', '▼', '◆', '▪'];



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
      {/* Shape Grid - Two Rows: White and Black */}
      <div className="space-y-1 mb-2">
        {/* First Row - White Symbols */}
        <div className="grid grid-cols-7 gap-1">
          {SHAPE_PALETTE.map((shape) => {
            const shapeId = `${shape}-white`;
            return (
              <button
                key={shapeId}
                onClick={() => onShapeSelect(shapeId)}
                className={`text-lg p-1 transition ${selectedShape === shapeId
                  ? 'bg-white text-black rounded'
                  : 'text-white hover:bg-gray-700 rounded'
                  }`}
                title={`${shape} (White)`}
              >
                {shape}
              </button>
            );
          })}
        </div>

        {/* Second Row - Black Symbols */}
        <div className="grid grid-cols-7 gap-1">
          {SHAPE_PALETTE.map((shape) => {
            const shapeId = `${shape}-black`;
            return (
              <button
                key={shapeId}
                onClick={() => onShapeSelect(shapeId)}
                className={`text-lg p-1 transition border-2 ${selectedShape === shapeId
                  ? 'text-black rounded border-white bg-gray-700'
                  : 'text-black hover:bg-gray-700 hover:text-white rounded border-gray-400'
                  }`}
                title={`${shape} (Black)`}
              >
                {shape}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Button - Super Compact */}
      <button
        onClick={onAddShape}
        disabled={!selectedShape}
        className={`w-full py-1 rounded text-sm font-medium transition flex items-center justify-center gap-1 ${!selectedShape
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-white text-black hover:bg-gray-100 active:scale-95'
          }`}
      >
        <span className="text-xs">+</span>
        Add Symbol
      </button>
    </div>
  );
};
