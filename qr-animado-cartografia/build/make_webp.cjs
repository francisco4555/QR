// Genera el WebP animado (720x720, 30 fps, bucle) con sharp.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'frames', 'vid');
const out = path.join(ROOT, 'renders', 'qr-cartografia.webp');

(async () => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort();
  // Cada 2º frame (30->15 fps) y 720x720 para compartir
  const picked = files.filter((_, i) => i % 2 === 0);
  const frames = [];
  for (const f of picked) {
    const png = await sharp(path.join(dir, f)).resize(720, 720).png().toBuffer();
    frames.push(png);
  }
  const delay = Math.round(1000 / 15); // 67 ms por frame -> 15 fps
  const delays = frames.map(() => delay);
  await sharp(frames, { join: { animated: true } }).webp({ quality: 82, loop: 0, effort: 4, delay: delays }).toFile(out);
  console.log('WebP animado OK:', out, fs.statSync(out).size, 'bytes,', frames.length, 'frames @15fps');
})().catch(e => { console.error('ERROR WebP:', e.message); process.exit(1); });
