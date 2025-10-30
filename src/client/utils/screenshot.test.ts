import { describe, it, expect } from 'vitest';
import { renderShapesToCanvas, dataURLToBlob } from './screenshot';

describe('Screenshot Utils', () => {
    it('should render shapes to canvas and return data URL', () => {
        const shapes = [
            { shape: '●', xPercent: 50, yPercent: 50, sizePercent: 20, rotation: 0 },
            { shape: '▲', xPercent: 30, yPercent: 30, sizePercent: 15, rotation: 45 },
        ];

        const dataUrl = renderShapesToCanvas(shapes);

        expect(dataUrl).toMatch(/^data:image\/png;base64,/);
        expect(dataUrl.length).toBeGreaterThan(100); // Should have substantial content
    });

    it('should handle empty shapes array', () => {
        const dataUrl = renderShapesToCanvas([]);

        expect(dataUrl).toMatch(/^data:image\/png;base64,/);
        expect(dataUrl.length).toBeGreaterThan(100); // Should still have canvas background
    });

    it('should convert data URL to blob', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

        const blob = dataURLToBlob(dataUrl);

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('image/png');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should throw error for invalid data URL', () => {
        expect(() => dataURLToBlob('invalid-data-url')).toThrow('Invalid data URL format');
    });
});
