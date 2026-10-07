// Parchea index.html con la nueva matriz QR (leída de qr_matrix.compact.txt).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlPath = path.join(ROOT, 'index.html');
const matrix = fs.readFileSync(path.join(__dirname, 'qr_matrix.compact.txt'), 'utf8')
  .split('\n').filter(l => l.length);
const GRID = matrix.length;

let html = fs.readFileSync(htmlPath, 'utf8');

// 1) Sustituir el bloque QR_STR
const start = html.indexOf('const QR_STR = [');
let end = html.indexOf("].join('');", start);
if (start < 0 || end < 0) { console.error('No se encontró el bloque QR_STR'); process.exit(1); }
end += "].join('');".length;
const newBlock = 'const QR_STR = [\n' + matrix.map(l => `"${l}"`).join(',\n') + '\n  ].join(\'\');';
html = html.slice(0, start) + newBlock + html.slice(end);

// 2) GRID y comentarios
html = html.replace('const GRID = 41;              // tamaño total (33 datos + 8 silencio)',
                    `const GRID = ${GRID};              // tamaño total (${GRID - 8} datos + 8 silencio)`);
html = html.replace('// ---- Matriz QR (41×41, \'1\'=módulo oscuro, \'0\'=claro/zona silencio) ----',
                    `// ---- Matriz QR (${GRID}×${GRID}, '1'=módulo oscuro, '0'=claro/zona silencio) ----`);
html = html.replace(
  ' *  La matriz QR es el QR real del portal (V4, EC-M, 33×33\n *  + 4 módulos de zona de silencio = 41×41). Verificada:\n *  decodifica exactamente a la URL del portal.',
  ' *  La matriz QR apunta al FORMULARIO DE REGISTRO (V8, EC-M,\n *  49×49 + 4 módulos de zona de silencio = 57×57). Verificada:\n *  decodifica exactamente a la URL del formulario.');

fs.writeFileSync(htmlPath, html);
console.log('index.html actualizado: GRID =', GRID, '| módulos por fila =', GRID);
