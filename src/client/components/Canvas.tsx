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
  const svgRef = useRef<SVGSVGElement>(null);

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
        className="relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
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
    <div className="relative mx-auto" style={{ width: '300px', height: '240px' }}>
      {/* SVG Canvas - Fixed coordinate system */}
      <svg
        ref={svgRef}
        width="300"
        height="240"
        viewBox="0 0 300 240"
        className="border-2 border-gray-800 rounded-lg bg-gray-100"
        style={{
          width: '300px',
          height: '240px',
        }}
      >
        {/* Background */}
        <rect width="300" height="240" fill="#f3f4f6" />

        {/* Render shapes */}
        {shapes.map((shape, index) => {
          const baseSize = 240; // Fixed reference size
          const fontSize = (shape.sizePercent / 100) * baseSize;
          const x = (shape.xPercent / 100) * 300;
          const y = (shape.yPercent / 100) * 240;

          const shapeWithId = shape as Shape;
          const hasId = 'id' in shape;
          const shapeKey = hasId ? shapeWithId.id : index;

          return (
            <text
              key={shapeKey}
              x={x}
              y={y}
              fontSize={fontSize}
              fontFamily="Arial, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              fill={shape.color === 'black' ? '#000000' : '#ffffff'}
              stroke={shape.color === 'black' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
              strokeWidth="1"
              transform={shape.rotation ? `rotate(${shape.rotation} ${x} ${y})` : undefined}
              style={{
                cursor: !isPlayMode ? 'move' : 'default',
                userSelect: 'none',
              }}
              onMouseDown={
                !isPlayMode && hasId && onMouseDown
                  ? (e) => {
                    e.preventDefault();
                    onMouseDown(e as any, shapeWithId.id, 'move');
                  }
                  : undefined
              }
              onClick={
                !isPlayMode && hasId
                  ? (e) => handleShapeClick(e as any, shapeWithId.id)
                  : undefined
              }
            >
              {shape.shape}
            </text>
          );
        })}

        {/* Empty state text */}
        {shapes.length === 0 && !isPlayMode && (
          <text
            x="150"
            y="120"
            fontSize="16"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6b7280"
            style={{ pointerEvents: 'none' }}
          >
            Add symbols to start creating
          </text>
        )}
      </svg>

      {/* Interactive overlay for edit controls */}
      {!isPlayMode && (
        <div
          ref={activeCanvasRef}
          className="absolute inset-0 pointer-events-none"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onMouseMove ? (e) => {
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
          onTouchEnd={onMouseUp}
          style={{
            width: '300px',
            height: '240px',
            touchAction: 'none',
          }}
        >
          {shapes.map((shape, index) => {
            const shapeWithId = shape as Shape;
            const hasId = 'id' in shape;
            if (!hasId) return null;

            // FIXED: Use constant button distance for all symbol sizes
            const buttonDistance = 25; // Fixed 25px distance from center
            const buttonSize = 18;

            return (
              <div
                key={shapeWithId.id}
                className="absolute group pointer-events-auto"
                style={{
                  left: `${shape.xPercent}%`,
                  top: `${shape.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '60px', // Fixed container size
                  height: '60px', // Fixed container size
                  zIndex:
                    dragging === shapeWithId.id ||
                      resizing === shapeWithId.id ||
                      rotating === shapeWithId.id
                      ? 1000
                      : 1,
                }}
                onMouseDown={(e) => {
                  if (onMouseDown && !e.defaultPrevented) {
                    e.preventDefault();
                    e.stopPropagation();
                    onMouseDown(e, shapeWithId.id, 'move');
                  }
                }}
                title="Click to select, Shift+Click to delete"
              >
                {onMouseDown && (
                  <>
                    {/* Resize Button - Bottom Right - FIXED POSITION */}
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
                      className="absolute bg-gray-800 border-2 border-white rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-bold shadow-lg hover:bg-gray-700 hover:scale-110 touch-manipulation"
                      style={{
                        bottom: `-${buttonDistance}px`,
                        right: `-${buttonDistance}px`,
                        width: `${buttonSize}px`,
                        height: `${buttonSize}px`,
                        fontSize: '10px',
                        zIndex: 1001
                      }}
                      title="Drag down/up to resize"
                    >
                      ⇕
                    </div>

                    {/* Rotate Button - Top Right - FIXED POSITION */}
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
                      className="absolute bg-gray-800 border-2 border-white rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-bold shadow-lg hover:bg-gray-700 hover:scale-110 touch-manipulation"
                      style={{
                        top: `-${buttonDistance}px`,
                        right: `-${buttonDistance}px`,
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

                {/* Remove Button - Top Left - FIXED POSITION */}
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
                      top: `-${buttonDistance}px`,
                      left: `-${buttonDistance}px`,
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
