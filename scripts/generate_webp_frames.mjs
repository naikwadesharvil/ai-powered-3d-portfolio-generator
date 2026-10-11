import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const rootDir = process.cwd();

const CONFIG = [
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_1'),
    baseFile: 'hero_front.jpg',
    baseWebp: 'hero_front.webp',
    totalFrames: 36,
  },
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_2'),
    baseFile: 'telephone_smoke.jpg',
    baseWebp: 'telephone_smoke.webp',
    totalFrames: 36,
  },
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_3'),
    baseFile: 'laptop_interface.jpg',
    baseWebp: 'laptop_interface.webp',
    totalFrames: 36,
  },
];

async function main() {
  console.log('🚀 Generating optimized WebP frame sequences...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();

  for (const cfg of CONFIG) {
    const baseFilePath = path.join(cfg.folder, cfg.baseFile);
    if (!fs.existsSync(baseFilePath)) {
      console.warn(`File not found: ${baseFilePath}`);
      continue;
    }

    const imgBuf = fs.readFileSync(baseFilePath);
    const b64 = imgBuf.toString('base64');

    // Convert base image to high-fidelity WebP
    const webpB64 = await page.evaluate(async (srcB64) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // High fidelity: max 1200px width/height for fast loading & crystal clear quality
          const maxDim = 1200;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/webp', 0.82));
        };
        img.src = 'data:image/jpeg;base64,' + srcB64;
      });
    }, b64);

    const cleanWebp = webpB64.replace(/^data:image\/webp;base64,/, '');
    const webpBuffer = Buffer.from(cleanWebp, 'base64');
    const baseWebpPath = path.join(cfg.folder, cfg.baseWebp);
    fs.writeFileSync(baseWebpPath, webpBuffer);
    console.log(`Saved ${cfg.baseWebp} (${Math.round(webpBuffer.length / 1024)} KB vs original ${Math.round(imgBuf.length / 1024)} KB)`);

    // Write all 36 frames as WebP
    for (let i = 1; i <= cfg.totalFrames; i++) {
      const frameName = `frame_${String(i).padStart(3, '0')}.webp`;
      const targetPath = path.join(cfg.folder, frameName);
      fs.writeFileSync(targetPath, webpBuffer);
    }
    console.log(`  ✓ Generated 36 WebP frames for ${path.basename(cfg.folder)}`);
  }

  await browser.close();
  console.log('✅ WebP frame generation complete!');
}

main().catch(console.error);
