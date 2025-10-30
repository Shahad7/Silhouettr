import { Shape } from '../types';

/**
 * Renders shapes to a canvas and returns it as a data URL
 * This ensures pixel-perfect consistency across all devices
 */
export function renderShapesToCanvas(shapes: Omit<Shape, 'id'>[]): string {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 240;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set background to match the canvas background
  ctx.fillStyle = '#111827'; // gray-900
  ctx.fillRect(0, 0, 300, 240);

  // Render each shape
  shapes.forEach((shape) => {
    const baseSize = 240; // Same as Canvas component
    const fontSize = (shape.sizePercent / 100) * baseSize;

    // Calculate position (same logic as Canvas component)
    const x = (shape.xPercent / 100) * 300;
    const y = (shape.yPercent / 100) * 240;

    // Set up text rendering
    ctx.fillStyle = '#ffffff'; // White text
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply rotation if needed
    if (shape.rotation && shape.rotation !== 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.fillText(shape.shape, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(shape.shape, x, y);
    }
  });

  // Return as data URL
  return canvas.toDataURL('image/png', 0.9);
}

/**
 * Converts a data URL to a Blob for uploading
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/png';
  const base64Data = arr[1];

  if (!base64Data) {
    throw new Error('Invalid data URL format');
  }

  const bstr = atob(base64Data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}
