/**
 * SVG Export Utilities
 * Export logos as SVG or PNG files
 * Phase 2: Editing & Export
 */

import type { LogoSpec } from '@kimuntupro/shared';
import { logoSpecToSVGString } from './svgRenderer';

/**
 * Export logo as SVG file
 * @param spec - Logo specification
 * @param fileName - Desired file name (without extension)
 */
export function exportAsSVG(spec: LogoSpec, fileName: string): void {
  const svgString = logoSpecToSVGString(spec);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export logo as PNG file at specified size
 * @param spec - Logo specification
 * @param fileName - Desired file name (without extension)
 * @param size - Output size in pixels (default: 1024)
 * @returns Promise that resolves when download is complete
 */
export async function exportAsPNG(
  spec: LogoSpec,
  fileName: string,
  size: number = 1024
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create SVG string
      const svgString = logoSpecToSVGString(spec);

      // Create a blob URL for the SVG
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image element to load the SVG
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas at desired size
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0, size, size);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create PNG blob'));
              return;
            }

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}-${size}px.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);

            resolve();
          }, 'image/png');
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Export logo as PNG at multiple sizes
 * @param spec - Logo specification
 * @param fileName - Desired file name (without extension)
 * @param sizes - Array of sizes in pixels (default: [512, 1024, 2048])
 * @returns Promise that resolves when all downloads are complete
 */
export async function exportAsPNGMultipleSizes(
  spec: LogoSpec,
  fileName: string,
  sizes: number[] = [512, 1024, 2048]
): Promise<void> {
  for (const size of sizes) {
    await exportAsPNG(spec, fileName, size);
    // Small delay between downloads to avoid browser blocking
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Get logo as data URL (base64)
 * Useful for previews or embedding
 * @param spec - Logo specification
 * @param format - Output format ('svg' or 'png')
 * @param size - PNG size in pixels (ignored for SVG)
 * @returns Promise resolving to data URL
 */
export async function getLogoDataURL(
  spec: LogoSpec,
  format: 'svg' | 'png' = 'svg',
  size: number = 1024
): Promise<string> {
  if (format === 'svg') {
    const svgString = logoSpecToSVGString(spec);
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  // PNG format
  return new Promise((resolve, reject) => {
    try {
      const svgString = logoSpecToSVGString(spec);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, size, size);

          const dataURL = canvas.toDataURL('image/png');
          URL.revokeObjectURL(svgUrl);
          resolve(dataURL);
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Copy logo to clipboard as PNG
 * @param spec - Logo specification
 * @param size - PNG size in pixels (default: 1024)
 * @returns Promise that resolves when copied
 */
export async function copyLogoToClipboard(
  spec: LogoSpec,
  size: number = 1024
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = logoSpecToSVGString(spec);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, size, size);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create PNG blob'));
              return;
            }

            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);

              URL.revokeObjectURL(svgUrl);
              resolve();
            } catch (error) {
              URL.revokeObjectURL(svgUrl);
              reject(error);
            }
          }, 'image/png');
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}
