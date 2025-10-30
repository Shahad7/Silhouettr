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
  screenshotUrl?: string; // For displaying saved screenshot in play mode
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
  screenshotUrl,
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

  // If in play mode and we have a screenshot, display the image instead of shapes
  if (isPlayMode && screenshotUrl) {
    return (
      <div
        className="relative bg-gray-900 border-2 border-gray-700 rounded-xl overflow-hidden mx-auto"
        style={{
          width: '300px',  // FIXED WIDTH - exactly the same everywhere
          height: '240px', // FIXED HEIGHT - exactly the same everywhere
        }}
      >
        <img
          src={screenshotUrl}
          alt="Challenge shapes"
          className="w-full h-full object-cover"
          style={{
            width: '300px',
            height: '240px',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={!isPlayMode ? activeCanvasRef : null}
      onMouseMove={!isPlayMode ? onMouseMove : undefined}
      onMouseUp={!isPlayMode ? onMouseUp : undefined}
      onMouseLeave={!isPlayMode ? onMouseUp : undefined}
      onTouchMove={!isPlayMode && onMouseMove ? (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (!touch) return;
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true
        });
        onMouseMove(mouseEvent as any);
      } : undefined}
      onTouchEnd={!isPlayMode ? onMouseUp : undefined}
      className="relative bg-gray-400 border-2 border-gray-600 rounded-xl overflow-visible touch-manipulation mx-auto"
      style={{
        width: '300px',  // FIXED WIDTH - exactly the same everywhere, fits all mobile devices
        height: '240px', // FIXED HEIGHT - exactly the same everywhere (300 * 4/5 = 240)
      }}
    >
      {shapes.map((shape, index) => {
        // CRITICAL: Fixed baseSize matches the fixed canvas height for perfect consistency
        // Canvas is ALWAYS 300x240px in both CreateView and ChallengeView
        // This ensures shapes render at exactly the same size and positions everywhere
        const baseSize = 240; // Fixed reference size matching canvas height
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
                    if (!touch) return;
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
              className={`${!isPlayMode ? 'cursor-move hover:opacity-90 touch-manipulation' : ''}`}
              style={{
                fontSize: fontSize,
                lineHeight: 1,
                color: shape.color === 'black' ? '#000000' : '#ffffff',
                WebkitTextFillColor: shape.color === 'black' ? '#000000' : '#ffffff',
                textShadow: shape.color === 'black' ? '0 0 1px rgba(255,255,255,0.5)' : '0 0 1px rgba(0,0,0,0.5)',
                fontFamily: 'Arial, sans-serif',
                transform: `rotate(${shape.rotation || 0}deg)`,
                transition:
                  hasId &&
                    (dragging === shapeWithId.id ||
                      resizing === shapeWithId.id ||
                      rotating === shapeWithId.id)
                    ? 'none'
                    : 'opacity 0.2s, transform 0.2s',
              }}
              title={!isPlayMode ? 'Drag to move' : ''}
            >
              {shape.shape}
            </div>
            {!isPlayMode && hasId && (() => {
              // EXTREMELY CLOSE button positioning - fixed small distance regardless of symbol size
              // Only use slightly more distance for very tiny symbols to prevent overlap
              const buttonOffset = shape.sizePercent < 5 ? 12 : 8;
              const buttonSize = 18; // Fixed button size

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
                          if (!touch) return;
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            bubbles: true
                          });
                          onMouseDown(mouseEvent as any, shapeWithId.id, 'resize');
                        }}
                        className="absolute bg-gray-700 border-2 border-white rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-bold shadow-lg hover:bg-gray-600 hover:scale-110 touch-manipulation"
                        style={{
                          bottom: `-${buttonOffset}px`,
                          right: `-${buttonOffset}px`,
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          fontSize: '10px',
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
                          if (!touch) return;
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            bubbles: true
                          });
                          onMouseDown(mouseEvent as any, shapeWithId.id, 'rotate');
                        }}
                        className="absolute bg-gray-700 border-2 border-white rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-bold shadow-lg hover:bg-gray-600 hover:scale-110 touch-manipulation"
                        style={{
                          top: `-${buttonOffset}px`,
                          right: `-${buttonOffset}px`,
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          fontSize: '10px',
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
                      className="absolute bg-red-600 border-2 border-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-bold shadow-lg hover:bg-red-700 hover:scale-110 touch-manipulation"
                      style={{
                        top: `-${buttonOffset}px`,
                        left: `-${buttonOffset}px`,
                        width: `${buttonSize}px`,
                        height: `${buttonSize}px`,
                        fontSize: '10px',
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
        <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-base pointer-events-none bg-gray-400/50 rounded-xl">
          <div className="text-center">
            <p className="font-medium">Add symbols to start creating</p>
          </div>
        </div>
      )}
    </div>
  );
};
