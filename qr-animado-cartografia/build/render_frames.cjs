// Renderiza fotogramas de la animación con Chrome headless (puppeteer-core).
// Modos:
//   node render_frames.cjs proof      -> PNGs de muestra en frames/proof/
//   node render_frames.cjs scancheck  -> PNG del QR final en frames/scan_check.png
//   node render_frames.cjs video      -> secuencia JPEG 1080x1080 en frames/vid/
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080, H = 1080;
const FPS = 30;
const DUR = 12.1;          // un ciclo completo
const MODE = process.argv[2] || 'proof';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  const url = 'file://' + path.join(ROOT, 'index.html') + (MODE === 'transparent' ? '?transparent=1' : '');
  await page.goto(url, { waitUntil: 'load' });
  // pantalla completa, sin marco de la demo web
  await page.addStyleTag({ content: 'body{padding:0 !important} .stage{width:1080px !important;max-width:none !important}' });
  await page.evaluate(() => { window.dispatchEvent(new Event('resize')); window.__freeze(); });
  await new Promise(r => setTimeout(r, 120));

  const cw = await page.evaluate(() => document.getElementById('c').width);
  console.log('canvas.width =', cw, '(esperado', W + ')');
  if (cw !== W) { console.error('⚠ el canvas no mide 1080'); }

  async function shot(t, file) {
    await page.evaluate((tt) => window.__renderFrame(tt), t);
    await page.screenshot({ path: file });
  }

  if (MODE === 'proof') {
    const dir = path.join(ROOT, 'frames', 'proof'); fs.mkdirSync(dir, { recursive: true });
    const times = [0.4, 1.0, 1.9, 2.5, 3.2, 3.8, 4.6, 5.4, 6.2, 7.6, 9.5];
    for (const t of times) {
      await shot(t, path.join(dir, `proof_t${t.toFixed(1).replace('.', '_')}.png`));
      console.log('proof t=', t);
    }
  } else if (MODE === 'scancheck') {
    const dir = path.join(ROOT, 'frames'); fs.mkdirSync(dir, { recursive: true });
    await shot(7.6, path.join(dir, 'scan_check.png'));
    console.log('scancheck OK');
  } else if (MODE === 'video') {
    const dir = path.join(ROOT, 'frames', 'vid'); fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(DUR * FPS);
    for (let i = 0; i < n; i++) {
      const t = i / FPS;
      await page.evaluate((tt) => window.__renderFrame(tt), t);
      await page.screenshot({ type: 'jpeg', quality: 92, path: path.join(dir, `vid_${String(i).padStart(4, '0')}.jpg`) });
      if (i % 30 === 0) console.log('frame', i, '/', n);
    }
    console.log('video frames OK:', n);
  } else if (MODE === 'transparent') {
    const dir = path.join(ROOT, 'frames', 'vid_tr'); fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(DUR * FPS);
    for (let i = 0; i < n; i++) {
      const t = i / FPS;
      await page.evaluate((tt) => window.__renderFrame(tt), t);
      await page.screenshot({ omitBackground: true, path: path.join(dir, `tr_${String(i).padStart(4, '0')}.png`) });
      if (i % 30 === 0) console.log('frame', i, '/', n);
    }
    console.log('transparent frames OK:', n);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
