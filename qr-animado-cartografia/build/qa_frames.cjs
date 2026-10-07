// QA de los fotogramas renderizados: escaneabilidad + estructura de escenas.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const ROOT = path.join(__dirname, '..');
const URL = 'https://francisco4555.github.io/Cartograf-a-y-Territorio/';

function load(name){ return PNG.sync.read(fs.readFileSync(path.join(ROOT, 'frames', name))); }
function px(png, x, y){ const i=(y*png.width+x)*4; return [png.data[i],png.data[i+1],png.data[i+2],png.data[i+3]]; }
function close(a,b,tol=18){ return Math.abs(a[0]-b[0])<=tol && Math.abs(a[1]-b[1])<=tol && Math.abs(a[2]-b[2])<=tol; }
const PAPER=[250,245,237], NAVY=[4,19,38];

function countColor(png, target, tol){
  let n=0; const [tr,tg,tb]=target;
  for (let y=0;y<png.height;y+=1) for (let x=0;x<png.width;x+=1){
    const i=(y*png.width+x)*4;
    if (Math.abs(png.data[i]-tr)<=tol && Math.abs(png.data[i+1]-tg)<=tol && Math.abs(png.data[i+2]-tb)<=tol) n++;
  }
  return n;
}

let fail = 0;
function check(name, cond){ console.log((cond?'✓':'✗'), name); if(!cond) fail++; }

// 1) Escaneabilidad del fotograma final
const fin = load('scan_check.png');
const res = jsQR(new Uint8ClampedArray(fin.data), fin.width, fin.height);
check('QR final decodifica', !!res);
check('QR final apunta a la URL exacta', res && res.data === URL);

// 2) Módulos oscuros presentes (navy) y zona de silencio en papel
const navyCount = countColor(fin, NAVY, 40);
check('módulos navy presentes (' + navyCount + ' px)', navyCount > 60000 && navyCount < 500000);

// centro del área de datos del QR (fila/col 20 del grid 41) => en px 1080
const mapToDev = v => v * 1.08;
const qx = mapToDev(190), qw = mapToDev(620);
const cell = (c) => qx + (c+0.5)*(qw/41);
// zona de silencio (esquina sup-izq interior) debe ser papel
check('zona de silencio en papel', close(px(fin, Math.round(cell(1)), Math.round(cell(1))), PAPER, 26));

// 3) Escena 1 (t=0.4): fondo dominante papel (mapa aún emergiendo)
const e1 = load('proof/proof_t0_4.png');
const paperRatio = countColor(e1, PAPER, 20) / (e1.width*e1.height);
check('escena 1 fondo papel dominante (' + (paperRatio*100).toFixed(1) + '%)', paperRatio > 0.6);

// 4) Escena 2 (t=2.5): presencia de color vial naranja (#ec4b08)
const e2 = load('proof/proof_t2_5.png');
const orange = countColor(e2, [236,75,8], 60);
check('escena 2 red vial naranja presente (' + orange + ' px)', orange > 500);

// 5) Escena 3 (t=3.8): pixelación -> menos papel uniforme (bloques)
const e3 = load('proof/proof_t3_8.png');
const e3paper = countColor(e3, PAPER, 14)/(e3.width*e3.height);
check('escena 3 pixelada (' + (e3paper*100).toFixed(1) + '% papel)', e3paper < 0.85);

// 6) Escena 4 (t=6.2): QR casi formado -> módulos navy mayoritarios
const e4 = load('proof/proof_t6_2.png');
const e4navy = countColor(e4, NAVY, 40);
check('escena 4 QR formado (' + e4navy + ' px navy)', e4navy > 80000);

// 7) Subtítulo presente bajo el QR (banda de texto)
let sub = 0;
for (let y = 955; y < 995 && y < fin.height; y++) for (let x = 0; x < fin.width; x++){
  const i=(y*fin.width+x)*4;
  if (Math.abs(fin.data[i]-PAPER[0])>25 || Math.abs(fin.data[i+1]-PAPER[1])>25 || Math.abs(fin.data[i+2]-PAPER[2])>25) sub++;
}
check('subtítulo presente (' + sub + ' px no-papel)', sub > 1500);

console.log(fail === 0 ? '\nQA: TODO OK' : `\nQA: ${fail} FALLOS`);
process.exit(fail === 0 ? 0 : 1);
