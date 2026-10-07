// Genera la matriz QR exacta y el PNG estático de alta resolución.
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const URL = 'https://docs.google.com/forms/d/e/1FAIpQLSejL9DDr-LRzNWPgehqj9VGAan6yLDu7dulSI-hxaPze0-0kw/viewform?usp=sharing&ouid=108182142289615307312';
const EC = 'M';           // nivel de corrección estándar (la versión se auto-detecta)
const QUIET = 4;          // zona de silencio en módulos (estándar ISO)
const ROOT = path.join(__dirname, '..');

// 1) Matriz cruda (sin zona de silencio)
const qr = QRCode.create(URL, { errorCorrectionLevel: EC });
const version = qr.version;
const dataSize = qr.modules.size; // version*4+17
const N = dataSize;
console.log('version', version, 'dataSize', dataSize, 'total', N + QUIET * 2);

// 2) Matriz con zona de silencio (0 = claro, 1 = oscuro)
const T = N + QUIET * 2;
const rows = [];
for (let r = 0; r < T; r++) {
  let row = '';
  for (let c = 0; c < T; c++) {
    const dr = r - QUIET, dc = c - QUIET;
    const dark = (dr >= 0 && dr < N && dc >= 0 && dc < N) ? qr.modules.get(dr, dc) : false;
    row += dark ? '1' : '0';
  }
  rows.push(row);
}

// 3) Guardar JSON legible
fs.writeFileSync(path.join(ROOT, 'build', 'qr_matrix.json'), JSON.stringify({
  url: URL, ec: EC, version, dataSize: N, quiet: QUIET, total: T, rows
}, null, 2));

// 4) Guardar cadena compacta para embeber en JS (una sola línea por fila)
const compact = rows.join('\n');
fs.writeFileSync(path.join(ROOT, 'build', 'qr_matrix.compact.txt'), compact);

// 5) PNG estático alta resolución (fondo crema) — para impresión
const W = 1600;
const dark = '#041326', light = '#faf5ed';
(async () => {
  await QRCode.toFile(path.join(ROOT, 'renders', 'qr-cartografia-impresion.png'), URL, {
    errorCorrectionLevel: EC, width: W, margin: QUIET, color: { dark, light }
  });
  // 6) PNG transparente (solo módulos oscuros) — para sobreposición
  await QRCode.toFile(path.join(ROOT, 'renders', 'qr-cartografia-transparente.png'), URL, {
    errorCorrectionLevel: EC, width: W, margin: QUIET, color: { dark, light: '#00000000' }
  });
  console.log('PNGs generados OK');
})();
