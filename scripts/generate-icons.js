#!/usr/bin/env node

/**
 * Generate PWA Icons from SVG
 * Creates all required icon sizes for manifest.json
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT_FILE = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Generating PWA icons...\n');

async function generateIcons() {
  try {
    // Generate PNG icons for all sizes
    for (const size of SIZES) {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(INPUT_FILE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 248, b: 240, alpha: 1 } // #FFF8F0
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate favicon.ico (32x32)
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    await sharp(INPUT_FILE)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 248, b: 240, alpha: 1 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log('✅ Generated: favicon.ico');

    // Generate apple-touch-icon (180x180)
    const appleTouchIcon = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
    await sharp(INPUT_FILE)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 248, b: 240, alpha: 1 }
      })
      .png()
      .toFile(appleTouchIcon);
    
    console.log('✅ Generated: apple-touch-icon.png');

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Location: ${OUTPUT_DIR}`);
    console.log(`\n📊 Generated ${SIZES.length + 2} icons:`);
    console.log(`   - ${SIZES.length} PWA icons (${SIZES.join('x, ')}x)`);
    console.log(`   - 1 favicon (32x32)`);
    console.log(`   - 1 apple-touch-icon (180x180)`);

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
