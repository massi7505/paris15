// lib/avifCompress.ts
// Client-side image compression to AVIF or fallback to WebP

export interface CompressResult {
  dataUrl: string;
  format: "avif" | "webp" | "jpeg";
  originalSize: number;
  compressedSize: number;
  savings: number;
}

/** Compress an image File to AVIF (with WebP fallback) */
export async function compressToAvif(
  file: File,
  quality = 0.75,
  maxDim = 1200
): Promise<CompressResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");

      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);

      // Try AVIF first, fallback to WebP, then JPEG
      const tryFormats: Array<{ mime: string; format: "avif" | "webp" | "jpeg" }> = [
        { mime: "image/avif", format: "avif" },
        { mime: "image/webp", format: "webp" },
        { mime: "image/jpeg", format: "jpeg" },
      ];

      for (const { mime, format } of tryFormats) {
        const dataUrl = canvas.toDataURL(mime, quality);
        if (dataUrl.startsWith(`data:${mime}`)) {
          const compressedSize = Math.round((dataUrl.length * 3) / 4);
          resolve({
            dataUrl,
            format,
            originalSize,
            compressedSize,
            savings: Math.round((1 - compressedSize / originalSize) * 100),
          });
          return;
        }
      }
      reject(new Error("Compression failed"));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
