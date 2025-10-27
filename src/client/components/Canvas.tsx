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
      onTouchMove={!isPlayMode && onMouseMove ? (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true
        });
        onMouseMove(mouseEvent as any);
      } : undefined}
      onTouchEnd={!isPlayMode ? onMouseUp : undefined}
      className="relative bg-white border-2 border-gray-800 rounded-lg overflow-visible w-full touch-manipulation"
      style={{
        aspectRatio: '5/4', // Maintains 500:400 ratio (consistent across devices)
        width: '100%',
        height: 'auto',
      }}
    >
      {shapes.map((shape, index) => {
        // Calculate consistent size based on fixed reference (400px base)
        // This ensures uniform rendering across all devices and contexts
        const baseSize = 400; // Fixed reference size for consistency
        const fontSize = `${(shape.sizePercent / 100) * baseSize}px`;

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
              onTouchStart={
                !isPlayMode && hasId && onMouseDown
                  ? (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                      bubbles: true
                    });
                    onMouseDown(mouseEvent as any, shapeWithId.id, 'move');
                  }
                  : undefined
              }
              onClick={
                !isPlayMode && hasId ? (e) => handleShapeClick(e, shapeWithId.id) : undefined
              }
              className={`${!isPlayMode ? 'cursor-move hover:opacity-80 touch-manipulation' : ''}`}
              style={{
                fontSize: fontSize,
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
              title={!isPlayMode ? 'Drag to move' : ''}
            >
              {shape.shape}
            </div>
            {!isPlayMode && hasId && (() => {
              // Calculate button positioning based on shape size to prevent collision
              const shapeSize = Math.max(shape.sizePercent, 8); // Minimum 8% for button spacing
              const buttonOffset = Math.max(shapeSize * 0.6, 12); // Dynamic offset, minimum 12px
              const buttonSize = Math.min(Math.max(shapeSize * 0.4, 16), 24); // Dynamic size 16-24px

              return (
                <>
                  {onMouseDown && (
                    <>
                      {/* Resize Button - Bottom Right */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMouseDown(e, shapeWithId.id, 'resize');
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            bubbles: true
                          });
                          onMouseDown(mouseEvent as any, shapeWithId.id, 'resize');
                        }}
                        className="absolute bg-blue-500 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold shadow-lg hover:bg-blue-600 touch-manipulation"
                        style={{
                          bottom: `-${buttonOffset}px`,
                          right: `-${buttonOffset}px`,
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          fontSize: `${Math.max(buttonSize * 0.5, 10)}px`,
                          zIndex: 1001
                        }}
                        title="Drag down/up to resize"
                      >
                        ⇕
                      </div>

                      {/* Rotate Button - Top Right */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMouseDown(e, shapeWithId.id, 'rotate');
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            bubbles: true
                          });
                          onMouseDown(mouseEvent as any, shapeWithId.id, 'rotate');
                        }}
                        className="absolute bg-green-500 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold shadow-lg hover:bg-green-600 touch-manipulation"
                        style={{
                          top: `-${buttonOffset}px`,
                          right: `-${buttonOffset}px`,
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          fontSize: `${Math.max(buttonSize * 0.5, 10)}px`,
                          zIndex: 1001
                        }}
                        title="Drag to rotate"
                      >
                        ↻
                      </div>
                    </>
                  )}

                  {/* Remove Button - Top Left */}
                  {onShapeDelete && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onShapeDelete(shapeWithId.id);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShapeDelete(shapeWithId.id);
                      }}
                      className="absolute bg-red-500 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold shadow-lg hover:bg-red-600 touch-manipulation"
                      style={{
                        top: `-${buttonOffset}px`,
                        left: `-${buttonOffset}px`,
                        width: `${buttonSize}px`,
                        height: `${buttonSize}px`,
                        fontSize: `${Math.max(buttonSize * 0.5, 10)}px`,
                        zIndex: 1001
                      }}
                      title="Remove shape"
                    >
                      ✕
                    </div>
                  )}
                </>
              );
            })()}
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
