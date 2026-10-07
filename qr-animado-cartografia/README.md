# QR animado · «Cartografía y Territorio»

Animación profesional, moderna e interactiva que transforma una superficie
cartográfica en el código QR del **formulario de registro** del portal
[Cartografía y Territorio](https://francisco4555.github.io/Cartograf-a-y-Territorio/)
(UNRC · Licenciatura en Urbanismo y Desarrollo Metropolitano).

La **prioridad absoluta** es que el QR final sea perfectamente escaneable: la
matriz apunta al formulario de registro y se conservan los patrones de
localización, los módulos y la zona de silencio (4 módulos).

---

## Secuencia (≈ 12 s en bucle)

| # | Escena | Tiempo |
|---|---|---|
| 1 | El territorio: curvas de nivel, retícula, polígonos y puntos | 0 – 1,4 s |
| 2 | Análisis espacial: red vial, delimitación urbana y POI | 1,4 – 2,8 s |
| 3 | Transformación digital: el mapa se pixeliza | 2,8 – 4,0 s |
| 4 | Formación del QR: los módulos se organizan | 4,0 – 6,5 s |
| 5 | Escaneo: QR estático + línea luminosa exterior + invitación | 6,5 – 11,5 s |

Después, fundido y reinicio. Con `prefers-reduced-motion: reduce` se muestra
directamente el QR estático escaneable.

---

## Entregables

### Animación web
- **`index.html`** — autocontenida (HTML + CSS + JS, Canvas 2D), sin
  dependencias ni CDN. Lista para GitHub Pages y adaptable a móvil.
- `index.html?transparent=1` — misma animación con **fondo transparente**
  (solo formación del QR + escaneo).

### Versión SVG animada
- **`animacion.svg`** — autocontenida, con el QR exacto (573 módulos oscuros),
  mapa simplificado y línea de escaneo; respeta `prefers-reduced-motion`.

### Vídeo e imagen (`renders/`)
| Archivo | Formato | Resolución | Uso |
|---|---|---|---|
| `qr-cartografia.mp4` | H.264 · 30 fps · 12,1 s | 1080×1080 | presentaciones, web, eventos |
| `qr-cartografia.webp` | WebP animado · 15 fps | 720×720 | compartir (1,8 MB) |
| `qr-cartografia.gif` | GIF animado · 15 fps | 540×540 | compartir / compatibilidad |
| `qr-cartografia-impresion.png` | PNG estático | 1600×1600 | impresión alta resolución |
| `qr-cartografia-transparente.png` | PNG estático, alfa | 1600×1600 | sobreponer en fondos claros |
| `qr-cartografia-transparente.webp` | WebP animado, alfa | 720×720 | overlay web |
| `qr-cartografia-transparente.mov` | QuickTime (qtrle), alfa | 1080×1080 | overlay en editores/presentaciones |

### Documentación
- **`INTEGRACION.md`** — cómo incorporar la animación al portal sin alterar su diseño.
- **`README.md`** — este documento.

---

## Identidad visual (extraída del portal)

Paleta `:root` del sitio original:

| Token | Hex | Uso en la animación |
|---|---|---|
| `--paper` | `#faf5ed` | fondo / zona de silencio |
| `--navy` | `#041326` | módulos del QR, retícula |
| `--ink` | `#132036` | curvas de nivel |
| `--wine` | `#800033` | polígonos, titular |
| `--pink` | `#bf0053` | puntos georreferenciados, POI |
| `--orange` | `#ec4b08` | red vial |
| `--gold` | `#ffa911` | línea de escaneo, acento |
| `--purple` | `#6e0c60` | delimitación urbana |

Tipografía: **Georgia** (titular, serif) y **Arial/Helvetica** (cuerpo).

Contraste del QR: módulos `#041326` sobre `#faf5ed` ≈ **15:1**.

---

## Datos técnicos del QR

- URL codificada (formulario de registro):
  `https://docs.google.com/forms/d/e/1FAIpQLSejL9DDr-LRzNWPgehqj9VGAan6yLDu7dulSI-hxaPze0-0kw/viewform?usp=sharing&ouid=108182142289615307312`
- Versión **8** (49×49 módulos de datos) · Nivel de corrección **M**
- Zona de silencio: **4 módulos** (estándar ISO/IEC 18004)
- Verificado con decodificador (jsQR): decodifica exactamente a la URL.

---

## Regenerar desde cero

Todo se genera con scripts deterministas en `build/`. Requisitos:
Node.js, Chrome/Chromium y `ffmpeg`.

```bash
cd build
npm install --no-audit --no-fund qrcode puppeteer-core jsqr pngjs sharp   # dependencias

node generate_qr.cjs        # matriz + PNG estático (impresión y transparente)
node verify_qr.cjs          # comprueba que el QR decodifica a la URL
node render_frames.cjs proof      # fotogramas de muestra
node render_frames.cjs video      # secuencia JPEG 1080×1080 (MP4/GIF/WebP)
node render_frames.cjs transparent # secuencia PNG con alfa
node qa_frames.cjs          # QA (escaneabilidad + estructura de escenas)
node generate_svg.cjs       # animacion.svg
node make_webp.cjs          # qr-cartografia.webp
node make_webp_tr.cjs       # qr-cartografia-transparente.webp
```

Codificación de vídeo (con `ffmpeg` en `PATH`):

```bash
# MP4
ffmpeg -y -framerate 30 -i frames/vid/vid_%04d.jpg -c:v libx264 -pix_fmt yuv420p \
  -crf 18 -preset medium -movflags +faststart ../renders/qr-cartografia.mp4

# GIF
ffmpeg -y -framerate 30 -i frames/vid/vid_%04d.jpg -vf "scale=540:540:flags=lanczos,fps=15,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" -loop 0 ../renders/qr-cartografia.gif

# MOV con alfa (transparente)
ffmpeg -y -framerate 30 -i frames/vid_tr/tr_%04d.png -c:v qtrle -pix_fmt argb ../renders/qr-cartografia-transparente.mov
```

---

## Validación realizada

- ✔ QR decodifica exactamente a la URL del portal (verificado en PNG, web, MP4 y WebP).
- ✔ Patrones de localización, módulos y zona de silencio intactos.
- ✔ Contraste alto (≈15:1) y sin textos/logos sobre los módulos.
- ✔ Línea de escaneo únicamente por el exterior del código.
- ✔ `prefers-reduced-motion` respetado (estado estático escaneable).
- ✔ Adaptable (proporción 1:1, `min(100%, 92vmin)`), probado en Chrome headless.
- ✔ Sin dependencias pesadas en la animación web (Canvas 2D nativo).
