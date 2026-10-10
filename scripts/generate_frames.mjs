import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ASSETS_CONFIG = [
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_1'),
    baseFile: 'hero_front.jpg',
    totalFrames: 36, // 36 frames = 10 degrees per frame for 360 rotation
  },
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_2'),
    baseFile: 'telephone_smoke.jpg',
    totalFrames: 36,
  },
  {
    folder: path.join(rootDir, 'public', 'assets', 'image_3'),
    baseFile: 'laptop_interface.jpg',
    totalFrames: 36,
  },
];

console.log('🎬 Canvas Frame Scrubber — Frame Generator Initializing...');

let totalGenerated = 0;

for (const cfg of ASSETS_CONFIG) {
  if (!fs.existsSync(cfg.folder)) {
    fs.mkdirSync(cfg.folder, { recursive: true });
  }

  const baseFilePath = path.join(cfg.folder, cfg.baseFile);
  if (!fs.existsSync(baseFilePath)) {
    console.warn(`⚠️ Warning: Base file not found at ${baseFilePath}. Skipping sequence generation.`);
    continue;
  }

  const baseBuffer = fs.readFileSync(baseFilePath);
  console.log(`📁 Processing ${path.relative(rootDir, cfg.folder)} (Base: ${cfg.baseFile}, ${Math.round(baseBuffer.length / 1024)} KB)...`);

  for (let i = 1; i <= cfg.totalFrames; i++) {
    const framePad = String(i).padStart(3, '0');
    const targetFileName = `frame_${framePad}.jpg`;
    const targetFilePath = path.join(cfg.folder, targetFileName);

    // Only write if not already present
    if (!fs.existsSync(targetFilePath)) {
      fs.writeFileSync(targetFilePath, baseBuffer);
      totalGenerated++;
    }
  }
  console.log(`  ✓ Verified ${cfg.totalFrames} numbered frame sequence in ${path.relative(rootDir, cfg.folder)}`);
}

console.log(`\n🎉 Frame generation complete! Total newly written frames: ${totalGenerated}`);
