// Verifica que el QR generado decodifica a la URL exacta (control de calidad).
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const ROOT = path.join(__dirname, '..');
const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'renders', 'qr-cartografia-impresion.png')));

const res = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('decode result:', res ? res.data : '(FAILED - no decodificado)');
if (res && res.data === 'https://francisco4555.github.io/Cartograf-a-y-Territorio/') {
  console.log('✓ URL EXACTA verificada — QR escaneable');
  process.exit(0);
} else {
  console.log('✗ La URL no coincide o el QR no decodifica');
  process.exit(1);
}
