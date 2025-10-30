import React from 'react';

const SHAPE_PALETTE: string[] = ['●', '▮', '★', '♦', '▼', '◆', '▪'];



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
                className={`text-lg p-1 transition rounded border-2 ${selectedShape === shapeId
                  ? 'border-blue-500 bg-blue-50' // Selected: blue border with light blue bg
                  : 'border-gray-300 bg-gray-100 hover:bg-gray-200' // Not selected: gray border
                  }`}
                style={{
                  color: '#ffffff', // WHITE symbols
                  WebkitTextFillColor: '#ffffff',
                  textShadow: '0 0 2px rgba(0,0,0,0.8)', // Black shadow for contrast on light bg
                  backgroundColor: selectedShape === shapeId ? '#dbeafe' : '#f3f4f6' // Ensure bg colors work
                }}
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
                className={`text-lg p-1 transition rounded border-2 ${selectedShape === shapeId
                  ? 'border-blue-500 bg-blue-50' // Selected: blue border with light blue bg
                  : 'border-gray-300 bg-gray-100 hover:bg-gray-200' // Not selected: gray border
                  }`}
                style={{
                  color: '#000000', // Black symbols
                  WebkitTextFillColor: '#000000'
                }}
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
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
      >
        <span className="text-xs">+</span>
        Add Symbol
      </button>
    </div>
  );
};
