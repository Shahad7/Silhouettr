import { useState, useRef } from 'react';
import { Shape, Offset, HandleType } from '../types';

export const useShapeManipulation = () => {
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (
    e: React.MouseEvent,
    shapeId: string,
    shapes: Shape[],
    handleType: HandleType = 'move'
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    const shape = shapes.find((s) => s.id === shapeId);
    if (!shape || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    if (handleType === 'resize') {
      console.log('Starting resize for shape:', shapeId, 'initial size:', shape.sizePercent);
      setResizing(shapeId);
      setOffset({
        x: e.clientX,
        y: e.clientY,

        // ✅ Ensure starting size is stored so resize is relative
        initialSize: shape.sizePercent
      });
    } else if (handleType === 'rotate') {
      setRotating(shapeId);
      const shapeX = (shape.xPercent / 100) * canvasWidth;
      const shapeY = (shape.yPercent / 100) * canvasHeight;
      const centerX = rect.left + shapeX;
      const centerY = rect.top + shapeY;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      setOffset({
        x: 0,
        y: 0,
        centerX,
        centerY,
        initialRotation: shape.rotation,
        startAngle: angle,
      });
    } else {
      const shapeX = (shape.xPercent / 100) * canvasWidth;
      const shapeY = (shape.yPercent / 100) * canvasHeight;

      setDragging(shapeId);
      setOffset({
        x: e.clientX - rect.left - shapeX,
        y: e.clientY - rect.top - shapeY,
      });
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent,
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
  ): void => {

    // ✅ FIXED RESIZE LOGIC — minimal change
    if (resizing) {
      const deltaX = e.clientX - offset.x;
      const deltaY = e.clientY - offset.y;

      // ✅ Natural corner scaling: pick dominant axis
      const delta = Math.max(deltaX, deltaY);

      // ✅ High sensitivity for fast, responsive resizing (doubled sensitivity)
      const newSize = Math.max(2, (offset.initialSize || 10) + delta * 0.6);

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === resizing ? { ...s, sizePercent: newSize } : s))
      );

      return;
    }

    // (unchanged rotate logic)
    if (rotating && offset.centerX !== undefined && offset.centerY !== undefined) {
      const angle =
        Math.atan2(e.clientY - offset.centerY, e.clientX - offset.centerX) * (180 / Math.PI);
      const deltaAngle = angle - (offset.startAngle || 0);
      const newRotation = ((offset.initialRotation || 0) + deltaAngle) % 360;

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === rotating ? { ...s, rotation: newRotation } : s))
      );
      return;
    }

    // (unchanged drag logic)
    if (dragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      const newX = e.clientX - rect.left - offset.x;
      const newY = e.clientY - rect.top - offset.y;

      const newXPercent = Math.max(0, Math.min(100, (newX / canvasWidth) * 100));
      const newYPercent = Math.max(0, Math.min(100, (newY / canvasHeight) * 100));

      setShapes((prevShapes) =>
        prevShapes.map((s) =>
          s.id === dragging ? { ...s, xPercent: newXPercent, yPercent: newYPercent } : s
        )
      );
    }
  };

  const handleMouseUp = (): void => {
    setDragging(null);
    setResizing(null);
    setRotating(null);
  };

  // ✅ Helper to get handle offset based on current shape size
  const getHandleOffset = (sizePercent: number): number => {
    // Keep buttons extremely close - fixed small distance regardless of symbol size
    // Only use slightly more distance for very tiny symbols to prevent overlap
    return sizePercent < 5 ? 12 : 8;
  };

  return {
    dragging,
    resizing,
    rotating,
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getHandleOffset, // ✅ Export for handle positioning
  };
};
