import type { PortfolioData } from '../types/portfolio';

const MAX_IMAGE_BYTES = 200 * 1024; // 200KB
const MAX_BASE64_CHARS = Math.floor((MAX_IMAGE_BYTES * 4) / 3);

/**
 * Downscale and compress a base64 image data URI on the client using HTML5 Canvas.
 * Targets WebP format with JPEG fallback, keeping output under ~200KB.
 */
export async function compressBase64Image(
  dataUri: string,
  label = 'Image'
): Promise<{ dataUrl: string; warning?: string }> {
  if (!dataUri || !dataUri.startsWith('data:image/')) {
    return { dataUrl: dataUri };
  }

  // If already under 200KB, no compression needed
  if (dataUri.length <= MAX_BASE64_CHARS) {
    return { dataUrl: dataUri };
  }

  // If not in a browser environment with canvas, return original or warning
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { dataUrl: dataUri };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Downscale dimensions if larger than 1200px
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: '',
            warning: `${label} could not be compressed (2D canvas context unavailable) and was excluded.`,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP compression passes
        const qualities = [0.82, 0.7, 0.55, 0.4];
        for (const quality of qualities) {
          let output = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support webp, fallback to jpeg
          if (!output.startsWith('data:image/webp')) {
            output = canvas.toDataURL('image/jpeg', quality);
          }
          if (output.length <= MAX_BASE64_CHARS) {
            resolve({ dataUrl: output });
            return;
          }
        }

        // Secondary downscale pass if quality reduction was not enough
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = Math.round(width * 0.6);
        smallCanvas.height = Math.round(height * 0.6);
        const smallCtx = smallCanvas.getContext('2d');
        if (smallCtx) {
          smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
          const output = smallCanvas.toDataURL('image/jpeg', 0.6);
          if (output.length <= MAX_BASE64_CHARS) {
            resolve({ dataUrl: output });
            return;
          }
        }

        // If it still exceeds 200KB, do not silently drop: report clear warning
        resolve({
          dataUrl: '',
          warning: `${label} exceeds 200KB even after maximum compression and could not be included.`,
        });
      } catch (err: any) {
        resolve({
          dataUrl: '',
          warning: `${label} compression failed (${err?.message || 'processing error'}) and was excluded.`,
        });
      }
    };

    img.onerror = () => {
      resolve({
        dataUrl: '',
        warning: `${label} could not be decoded as a valid image and was excluded.`,
      });
    };

    img.src = dataUri;
  });
}

/**
 * Scan all image fields in a PortfolioData object, downscale/compress base64 images,
 * and collect descriptive warnings for any image that could not be included.
 */
export async function compressPortfolioImages(
  portfolio: PortfolioData
): Promise<{ compressedPortfolio: PortfolioData; warnings: string[] }> {
  const warnings: string[] = [];
  const cloned: PortfolioData = JSON.parse(JSON.stringify(portfolio));

  // 1. Avatar in root
  if (cloned.avatarUrl && cloned.avatarUrl.startsWith('data:image/')) {
    const res = await compressBase64Image(cloned.avatarUrl, 'Profile Avatar');
    cloned.avatarUrl = res.dataUrl || '/assets/profile.png';
    if (res.warning) warnings.push(res.warning);
  }

  // 2. Avatar in profile sub-object
  if (cloned.profile?.avatarUrl && cloned.profile.avatarUrl.startsWith('data:image/')) {
    const res = await compressBase64Image(cloned.profile.avatarUrl, 'Profile Avatar');
    cloned.profile.avatarUrl = res.dataUrl || '/assets/profile.png';
    if (res.warning && !warnings.includes(res.warning)) warnings.push(res.warning);
  }

  // 3. Project images
  if (Array.isArray(cloned.projects)) {
    for (let i = 0; i < cloned.projects.length; i++) {
      const proj = cloned.projects[i];
      if (proj.imageUrl && proj.imageUrl.startsWith('data:image/')) {
        const title = proj.title || `Project #${i + 1}`;
        const res = await compressBase64Image(proj.imageUrl, `Project "${title}" Image`);
        proj.imageUrl = res.dataUrl || '';
        if (res.warning) warnings.push(res.warning);
      }
    }
  }

  return { compressedPortfolio: cloned, warnings };
}
