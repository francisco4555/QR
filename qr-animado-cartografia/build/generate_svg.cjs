// Genera la versión SVG animada (autocontenida, QR exacto y escaneable).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const QR_STR = fs.readFileSync(path.join(__dirname, 'qr_matrix.compact.txt'), 'utf8').replace(/\n/g, '');
const GRID = 41, QR_W = 620, QR_X = 190, QR_Y = 190, MOD = QR_W / GRID;
const C = { paper:'#faf5ed', navy:'#041326', ink:'#132036', wine:'#800033', pink:'#bf0053', orange:'#ec4b08', gold:'#ffa911', purple:'#6e0c60', muted:'#675b55' };

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rand = mulberry32(20241006);

// ---- geometría del mapa (simplificada, determinista) ----
function blobbyRing(cx, cy, baseR, amp, n, phase){
  const pts=[];
  for (let i=0;i<n;i++){ const a=(i/n)*Math.PI*2; const r=baseR*(1+amp*(Math.sin(a*3+phase)+0.5*Math.cos(a*5-phase*2))); pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); }
  return pts;
}
const ptsToPath = pts => 'M' + pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ') + ' Z';

let mapBase = '', mapAn = '';
// retícula
for (let g=40; g<=960; g+=80){
  mapBase += `<line x1="${g}" y1="0" x2="${g}" y2="1000" stroke="${C.navy}" stroke-width="1" opacity="0.16"/>\n`;
  mapBase += `<line x1="0" y1="${g}" x2="1000" y2="${g}" stroke="${C.navy}" stroke-width="1" opacity="0.16"/>\n`;
}
// curvas de nivel (3 colinas)
const hills = [[430,540],[650,460],[300,720]];
for (const [hx,hy] of hills) for (let k=0;k<8;k++){
  mapBase += `<path d="${ptsToPath(blobbyRing(hx,hy,40+k*42,0.16,46,rand()*6.28))}" fill="none" stroke="${C.ink}" stroke-width="1.5" opacity="0.42"/>\n`;
}
// polígonos territoriales
for (let p=0;p<9;p++){
  const pcx=130+rand()*740, pcy=110+rand()*760, pr=55+rand()*115, sides=4+(rand()*3|0), pts=[];
  for (let s=0;s<sides;s++){ const a=(s/sides)*Math.PI*2+rand()*0.6; const rr=pr*(0.7+rand()*0.5); pts.push([pcx+Math.cos(a)*rr, pcy+Math.sin(a)*rr]); }
  const col = p%2? C.pink : C.wine, ptsStr = pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  if (p%2===0) mapBase += `<polygon points="${ptsStr}" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-opacity="0.75" stroke-width="1.6"/>\n`;
  else mapBase += `<polygon points="${ptsStr}" fill="none" stroke="${col}" stroke-opacity="0.75" stroke-width="1.6"/>\n`;
}
// puntos georreferenciados
for (let i=0;i<20;i++){
  const x=70+rand()*860, y=70+rand()*860, col = rand()>0.55? C.gold : C.pink;
  mapBase += `<path d="M${(x-6).toFixed(1)},${y.toFixed(1)} H${(x+6).toFixed(1)} M${x.toFixed(1)},${(y-6).toFixed(1)} V${(y+6).toFixed(1)}" stroke="${col}" stroke-width="1.1" fill="none"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${col}"/>\n`;
}
// red vial
const nodes=[]; for (let i=0;i<16;i++) nodes.push([80+rand()*840, 80+rand()*840]);
const edges=[]; for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) if (Math.hypot(nodes[i][0]-nodes[j][0],nodes[i][1]-nodes[j][1])<250) edges.push([nodes[i],nodes[j]]);
for (const [a,b] of edges) mapAn += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${C.orange}" stroke-width="2.6" stroke-linecap="round" opacity="0.7"/>\n`;
// delimitación urbana (discontinua)
mapAn += `<path d="${ptsToPath(blobbyRing(500,520,360,0.10,40,1.7))}" fill="none" stroke="${C.purple}" stroke-width="2.2" stroke-dasharray="12 9" opacity="0.8"/>\n`;
// puntos de interés
nodes.filter((_,i)=>i%2===0).slice(0,7).forEach(([x,y])=>{ mapAn += `<rect x="${(x-3).toFixed(1)}" y="${(y-3).toFixed(1)}" width="6" height="6" fill="${C.navy}" opacity="0.9"/>\n`; });

// ---- módulos del QR con escalonado por distancia al centro ----
let qrRects = '';
const center = GRID/2;
for (let r=0;r<GRID;r++) for (let c=0;c<GRID;c++){
  if (QR_STR[r*GRID+c] !== '1') continue;
  const d = Math.hypot(c+0.5-center, r+0.5-center)/(GRID*0.72);
  const delay = (-(1-d)*1.2).toFixed(3);
  const x = (QR_X + c*MOD).toFixed(3), y = (QR_Y + r*MOD).toFixed(3);
  qrRects += `<rect x="${x}" y="${y}" width="${MOD.toFixed(3)}" height="${MOD.toFixed(3)}" fill="${C.navy}" class="m" style="animation-delay:${delay}s"/>\n`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="Animación: del territorio al código QR del portal Cartografía y Territorio">
<style>
  .mapBase { animation: mapBase 12.1s linear infinite; }
  .mapAn   { animation: mapAn   12.1s linear infinite; }
  .m       { animation: qrLife  12.1s linear infinite; opacity: 0; }
  .text    { animation: textIn  12.1s linear infinite; opacity: 0; }
  @keyframes mapBase {
    0%{opacity:0} 10%{opacity:1} 14%{opacity:1} 20%{opacity:0.55} 27%{opacity:0.55} 30%{opacity:0} 100%{opacity:0}
  }
  @keyframes mapAn {
    0%{opacity:0} 12%{opacity:0} 19%{opacity:1} 26%{opacity:1} 29%{opacity:0} 100%{opacity:0}
  }
  @keyframes qrLife {
    0%{opacity:0} 45%{opacity:0} 55%{opacity:1} 95%{opacity:1} 100%{opacity:0}
  }
  @keyframes textIn {
    0%{opacity:0} 56%{opacity:0} 61%{opacity:1} 95%{opacity:1} 100%{opacity:0}
  }
  @media (prefers-reduced-motion: reduce) {
    .mapBase,.mapAn,.text { animation: none; opacity: 1; }
    .mapBase,.mapAn { opacity: 0; }
    .m { animation: none; opacity: 1; }
    .scan { animation: none; opacity: 0; }
  }
</style>
<rect width="1000" height="1000" fill="${C.paper}"/>

<g class="mapBase">
${mapBase}</g>
<g class="mapAn">
${mapAn}</g>

<g shape-rendering="crispEdges">
${qrRects}</g>

<line class="scan" y1="172" y2="172" stroke="${C.gold}" stroke-width="3.4" stroke-linecap="round">
  <animate attributeName="x1" values="210;700;210" dur="3.6s" repeatCount="indefinite"/>
  <animate attributeName="x2" values="310;800;310" dur="3.6s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.56;0.60;0.95;1" dur="12.1s" repeatCount="indefinite"/>
</line>

<text class="text" x="500" y="110" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="600" fill="${C.wine}">Explora Cartografía y Territorio</text>
<rect class="text" x="454" y="140" width="92" height="2.4" fill="${C.gold}"/>
<text class="text" x="500" y="912" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="${C.muted}">Escanea el código y descubre el portal</text>
</svg>
`;

fs.writeFileSync(path.join(ROOT, 'animacion.svg'), svg);
console.log('animacion.svg generado —', qrRects.split('\n').length, 'módulos oscuros');
