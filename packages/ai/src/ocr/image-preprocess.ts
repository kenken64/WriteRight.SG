/**
 * Image preprocessing utilities for OCR quality improvement.
 * In production, use Sharp for server-side processing.
 */

export interface PreprocessOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  grayscale: boolean;
  sharpen: boolean;
}

const DEFAULT_OPTIONS: PreprocessOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 85,
  grayscale: false,
  sharpen: true,
};

export async function preprocessImage(
  imageBuffer: Buffer,
  options: Partial<PreprocessOptions> = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Dynamic import to avoid issues in edge runtime
  const sharp = (await import("sharp")).default;

  let pipeline = sharp(imageBuffer)
    .resize(opts.maxWidth, opts.maxHeight, { fit: "inside", withoutEnlargement: true });

  if (opts.grayscale) {
    pipeline = pipeline.grayscale();
  }

  if (opts.sharpen) {
    pipeline = pipeline.sharpen({ sigma: 1.5 });
  }

  // Normalize and enhance contrast for handwriting
  pipeline = pipeline.normalize();

  return pipeline.jpeg({ quality: opts.quality }).toBuffer();
}

export async function getImageMetadata(imageBuffer: Buffer) {
  const sharp = (await import("sharp")).default;
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? "unknown",
    size: imageBuffer.length,
    isLikelyHandwriting: (metadata.width ?? 0) > 500 && (metadata.height ?? 0) > 500,
  };
}

export function estimateImageQuality(metadata: { width: number; height: number; size: number }): "low" | "medium" | "high" {
  const pixels = metadata.width * metadata.height;
  if (pixels < 500_000) return "low";
  if (pixels < 2_000_000) return "medium";
  return "high";
}
