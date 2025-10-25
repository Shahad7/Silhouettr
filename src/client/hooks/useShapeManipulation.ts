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
      setResizing(shapeId);
      setOffset({
        x: e.clientX,
        y: e.clientY,
        initialSize: shape.sizePercent,
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
      // Calculate pixel position from percentage
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
    shapes: Shape[],
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
  ): void => {
    if (resizing) {
      const deltaY = e.clientY - offset.y; // Positive delta = bigger (pull down)
      const sizeDelta = deltaY * 0.1; // Sensitivity
      const newSize = Math.max(2, Math.min(30, (offset.initialSize || 10) + sizeDelta));

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === resizing ? { ...s, sizePercent: newSize } : s))
      );
    } else if (rotating && offset.centerX !== undefined && offset.centerY !== undefined) {
      const angle =
        Math.atan2(e.clientY - offset.centerY, e.clientX - offset.centerX) * (180 / Math.PI);
      const deltaAngle = angle - (offset.startAngle || 0);
      const newRotation = ((offset.initialRotation || 0) + deltaAngle) % 360;

      setShapes((prevShapes) =>
        prevShapes.map((s) => (s.id === rotating ? { ...s, rotation: newRotation } : s))
      );
    } else if (dragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      // Calculate pixel position
      const newX = e.clientX - rect.left - offset.x;
      const newY = e.clientY - rect.top - offset.y;

      // Convert to percentage
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

  return {
    dragging,
    resizing,
    rotating,
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
