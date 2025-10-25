// Types
interface Shape {
  id: string;
  shape: string;
  xPercent: number;
  yPercent: number;
  sizePercent: number;
  rotation: number;
}

interface Challenge {
  id: string;
  shapes: Omit<Shape, 'id'>[];
  answer: string;
  name: string;
}

interface Offset {
  x: number;
  y: number;
  initialSize?: number;
  centerX?: number;
  centerY?: number;
  initialRotation?: number;
  startAngle?: number;
}

type View = 'menu' | 'create' | 'play';
type HandleType = 'move' | 'resize' | 'rotate';
