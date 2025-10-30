// Types
export interface Shape {
  id: string;
  shape: string;
  color: 'white' | 'black';
  xPercent: number;
  yPercent: number;
  sizePercent: number;
  rotation: number;
}



export interface Offset {
  x: number;
  y: number;
  initialSize?: number;
  centerX?: number;
  centerY?: number;
  initialRotation?: number;
  startAngle?: number;
}

export type View = 'menu' | 'create' | 'challenge' | 'leaderboard';
export type HandleType = 'move' | 'resize' | 'rotate';
