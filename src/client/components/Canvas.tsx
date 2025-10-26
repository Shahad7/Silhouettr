import React, { useRef } from 'react';
import { Shape, HandleType } from '../types';

interface CanvasProps {
  shapes: Omit<Shape, 'id'>[] | Shape[];
  isPlayMode?: boolean;
  dragging?: string | null;
  resizing?: string | null;
  rotating?: string | null;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseDown?: (e: React.MouseEvent, shapeId: string, handleType?: HandleType) => void;
  onShapeDelete?: (shapeId: string) => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export const Canvas: React.FC<CanvasProps> = ({
  shapes = [],
  isPlayMode = false,
  dragging,
  resizing,
  rotating,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onShapeDelete,
  canvasRef,
}) => {
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const activeCanvasRef = canvasRef || localCanvasRef;

  const handleShapeClick = (e: React.MouseEvent, shapeId: string) => {
    if (
      !isPlayMode &&
      dragging === null &&
      resizing === null &&
      rotating === null &&
      onShapeDelete
    ) {
      if (e.shiftKey) {
        onShapeDelete(shapeId);
      }
    }
  };

  return (
    <div
      ref={!isPlayMode ? activeCanvasRef : null}
      onMouseMove={!isPlayMode ? onMouseMove : undefined}
      onMouseUp={!isPlayMode ? onMouseUp : undefined}
      onMouseLeave={!isPlayMode ? onMouseUp : undefined}
      className="relative bg-white border-4 border-gray-800 rounded-lg overflow-visible w-full max-w-full"
      style={{
        aspectRatio: '5/4', // Maintains 500:400 ratio
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      {shapes.map((shape, index) => {
        // Calculate actual size based on canvas width (responsive)
        const fontSize = `${shape.sizePercent}vw`;
        const maxFontSize = `${(shape.sizePercent / 100) * 500}px`; // Cap at design size

        const shapeWithId = shape as Shape;
        const hasId = 'id' in shape;

        return (
          <div
            key={hasId ? shapeWithId.id : index}
            className={`absolute select-none ${!isPlayMode ? 'group' : ''}`}
            style={{
              left: `${shape.xPercent}%`,
              top: `${shape.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              zIndex:
                hasId &&
                (dragging === shapeWithId.id ||
                  resizing === shapeWithId.id ||
                  rotating === shapeWithId.id)
                  ? 1000
                  : 1,
            }}
          >
            <div
              onMouseDown={
                !isPlayMode && hasId && onMouseDown
                  ? (e) => onMouseDown(e, shapeWithId.id, 'move')
                  : undefined
              }
              onClick={
                !isPlayMode && hasId ? (e) => handleShapeClick(e, shapeWithId.id) : undefined
              }
              className={`${!isPlayMode ? 'cursor-move hover:opacity-80' : ''}`}
              style={{
                fontSize: `min(${fontSize}, ${maxFontSize})`,
                lineHeight: 1,
                color: '#000000',
                WebkitTextFillColor: '#000000',
                textShadow: 'none',
                filter: 'grayscale(100%) brightness(0%)',
                fontFamily: 'Arial, sans-serif',
                transform: `rotate(${shape.rotation || 0}deg)`,
                transition:
                  hasId &&
                  (dragging === shapeWithId.id ||
                    resizing === shapeWithId.id ||
                    rotating === shapeWithId.id)
                    ? 'none'
                    : 'opacity 0.2s',
              }}
              title={!isPlayMode ? 'Drag to move, Shift+Click to delete' : ''}
            >
              {shape.shape}
            </div>
            {!isPlayMode && hasId && onMouseDown && (
              <>
                <div
                  onMouseDown={(e) => onMouseDown(e, shapeWithId.id, 'resize')}
                  className="absolute -bottom-3 -right-3 w-7 h-7 bg-blue-500 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ zIndex: 1001 }}
                  title="Drag down/up to resize"
                >
                  ⇕
                </div>
                <div
                  onMouseDown={(e) => onMouseDown(e, shapeWithId.id, 'rotate')}
                  className="absolute -top-3 -right-3 w-7 h-7 bg-green-500 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ zIndex: 1001 }}
                  title="Drag to rotate"
                >
                  ↻
                </div>
              </>
            )}
          </div>
        );
      })}
      {shapes.length === 0 && !isPlayMode && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
          Click "Add Shape" to start creating
        </div>
      )}
    </div>
  );
};
