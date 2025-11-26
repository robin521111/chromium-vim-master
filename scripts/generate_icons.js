// Node script to generate small PNG icons from SVG using sharp
const fs = require('fs');
const path = require('path');

async function main() {
  const sharp = require('sharp');
  const srcSvg = path.resolve(__dirname, '..', 'icons', 'v_mark.svg');
  const outDir = path.resolve(__dirname, '..', 'icons');
  const targets = [
    { size: 16, file: '16.png' },
    { size: 19, file: '19.png' }
  ];

  if (!fs.existsSync(srcSvg)) {
    console.error('Source SVG not found:', srcSvg);
    process.exit(1);
  }

  for (const t of targets) {
    const outFile = path.join(outDir, t.file);
    await sharp(srcSvg)
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(outFile);
    console.log(`Generated ${t.size}px icon -> ${outFile}`);
  }
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});