import { Shape } from '../types';

/**
 * Renders shapes to a canvas and returns it as a data URL
 * This ensures pixel-perfect consistency across all devices
 */
export function renderShapesToCanvas(shapes: Omit<Shape, 'id'>[]): string {
  try {
    console.log('Screenshot: Looking for canvas element...');

    // Try to find the SVG element first for pixel-perfect capture
    const svgElement = document.querySelector('svg') as SVGSVGElement;

    if (svgElement) {
      console.log('Screenshot: Found SVG element, converting to canvas...');
      return convertSVGToCanvas(svgElement);
    }

    console.log('Screenshot: No SVG found, creating fallback canvas...');

    // Fallback: Create a canvas element (same as before)
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 240;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set background to match the canvas background
    ctx.fillStyle = '#f3f4f6'; // gray-100
    ctx.fillRect(0, 0, 300, 240);

    // Render each shape
    shapes.forEach((shape, index) => {
      try {
        const baseSize = 240;
        const fontSize = (shape.sizePercent / 100) * baseSize;
        const x = (shape.xPercent / 100) * 300;
        const y = (shape.yPercent / 100) * 240;

        if (!shape.shape || typeof shape.shape !== 'string') {
          console.warn(`Screenshot: Invalid shape at index ${index}:`, shape);
          return;
        }

        // Set up text rendering with color support
        ctx.fillStyle = shape.color === 'black' ? '#000000' : '#ffffff';
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add stroke for better visibility (matching SVG stroke)
        ctx.strokeStyle = shape.color === 'black' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;

        // Apply rotation if needed
        if (shape.rotation && shape.rotation !== 0) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((shape.rotation * Math.PI) / 180);
          ctx.strokeText(shape.shape, 0, 0);
          ctx.fillText(shape.shape, 0, 0);
          ctx.restore();
        } else {
          ctx.strokeText(shape.shape, x, y);
          ctx.fillText(shape.shape, x, y);
        }
      } catch (shapeError) {
        console.error(`Screenshot: Error rendering shape ${index}:`, shapeError);
      }
    });

    const dataUrl = canvas.toDataURL('image/png', 0.9);
    console.log('Screenshot: Generated fallback data URL, length:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('Screenshot: Fatal error during rendering:', error);
    throw new Error(`Screenshot generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert SVG element to data URL
 */
function convertSVGToCanvas(svgElement: SVGSVGElement): string {
  try {
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

    // Ensure SVG has proper dimensions and namespace
    svgClone.setAttribute('width', '300');
    svgClone.setAttribute('height', '240');
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Convert SVG to string and create data URL
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    console.log('Screenshot: SVG converted to data URL, length:', svgDataUrl.length);
    return svgDataUrl;

  } catch (error) {
    console.error('SVG conversion error:', error);
    throw error;
  }
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
