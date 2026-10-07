// Inspección textual de fotogramas: estadísticas de "no-papel" + mapa ASCII fino.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['proof_t0_4.png','proof_t1_9.png','proof_t2_5.png','proof_t3_2.png','proof_t3_8.png','proof_t4_6.png','proof_t5_4.png','proof_t6_2.png','scan_check.png'];
const DIR = (f) => f.startsWith('proof_t') ? path.join(ROOT,'frames','proof',f) : path.join(ROOT,'frames',f);
const PAPER=[250,245,237];

function classify(r,g,b){
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
  const bright=(r+g+b)/3;
  if (bright<85) return '█';                       // oscuro (navy/ink/modulo)
  if (r>200 && g>70 && g<200 && b<130) return 'O'; // naranja
  if (r>180 && g>120 && b<120) return 'G';         // dorado
  if (r>110 && r<225 && g<95 && b>35) return 'W';  // vino/rosa
  if (r>80 && r<190 && g<80 && b>120) return 'V';  // púrpura
  if (mn>205) return '·';                          // papel
  return '·';
}

for (const f of files){
  const p = DIR(f);
  if (!fs.existsSync(p)) { console.log(f, '(no existe)'); continue; }
  const png = PNG.sync.read(fs.readFileSync(p));
  // estadística global de píxeles no-papel
  let non=0;
  for (let i=0;i<png.data.length;i+=4){
    if (Math.abs(png.data[i]-PAPER[0])>30 || Math.abs(png.data[i+1]-PAPER[1])>30 || Math.abs(png.data[i+2]-PAPER[2])>30) non++;
  }
  const pct=(100*non/(png.width*png.height)).toFixed(2);
  console.log(`\n===== ${f}  (no-papel: ${non} px = ${pct}%) =====`);
  const N = 60, bw = Math.floor(png.width/N), bh = Math.floor(png.height/N);
  let out='';
  for (let y=0;y<N;y++){
    for (let x=0;x<N;x++){
      // píxel más oscuro/saturado de la celda (detecta líneas y módulos finos)
      let best=[255,255,255], bestDark=765;
      for (let yy=y*bh; yy<(y+1)*bh && yy<png.height; yy++) for (let xx=x*bw; xx<(x+1)*bw && xx<png.width; xx++){
        const i=(yy*png.width+xx)*4, r=png.data[i],g=png.data[i+1],b=png.data[i+2];
        const d=r+g+b;
        if (d<bestDark){ bestDark=d; best=[r,g,b]; }
      }
      out += classify(best[0],best[1],best[2]);
    }
    out+='\n';
  }
  process.stdout.write(out);
}
