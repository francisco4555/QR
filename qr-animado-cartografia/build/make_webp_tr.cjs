// WebP animado CON transparencia (720x720, 15 fps) desde los frames PNG alfa.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'frames', 'vid_tr');
const out = path.join(ROOT, 'renders', 'qr-cartografia-transparente.webp');

(async () => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  const picked = files.filter((_, i) => i % 2 === 0);
  const frames = [];
  for (const f of picked) {
    const png = await sharp(path.join(dir, f)).resize(720, 720).png().toBuffer();
    frames.push(png);
  }
  const delay = Math.round(1000 / 15);
  await sharp(frames, { join: { animated: true } }).webp({ quality: 82, loop: 0, effort: 4, delay: frames.map(() => delay) }).toFile(out);
  console.log('WebP transparente OK:', out, fs.statSync(out).size, 'bytes,', frames.length, 'frames');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
