// Verifica que el SVG animado rasteriza un QR escaneable en su estado final.
const puppeteer = require('puppeteer-core');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const URL = 'https://francisco4555.github.io/Cartograf-a-y-Territorio/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, 'animacion.svg'), { waitUntil: 'load' });

  // Forzar el estado "hold" (QR opaco, mapa oculto) inyectando estilo en la raíz SVG
  await page.evaluate(() => {
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    st.textContent = '.m,.text{opacity:1 !important;animation:none !important} .mapBase,.mapAn,.scan{opacity:0 !important;animation:none !important}';
    document.documentElement.appendChild(st);
  });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: '/tmp/svg_qr.png' });
  const shot = fs.readFileSync('/tmp/svg_qr.png');
  const p = PNG.sync.read(shot);
  const res = jsQR(new Uint8ClampedArray(p.data), p.width, p.height);
  console.log('SVG ->', res ? (res.data === URL ? 'OK - URL exacta' : 'DISTINTA: ' + res.data) : 'NO decodifica');
  await browser.close();
  process.exit(res && res.data === URL ? 0 : 1);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
