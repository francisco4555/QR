# Integración del QR animado en el portal

Esta animación es **independiente del portal** y se puede incorporar sin alterar
su diseño ni su CSS. A continuación se describen tres formas de integrarla, de
la menos a la más invasiva.

La animación es un único archivo autocontenido (`index.html`): no usa CDN, no
carga fuentes externas ni bibliotecas, y respeta `prefers-reduced-motion`.

---

## Opción 1 — Iframe (recomendada, cero cambios en el diseño)

Sube la carpeta completa `qr-animado-cartografia/` al repositorio del portal
(por ejemplo, junto a `index.html` del sitio) y añade este bloque donde quieras
que aparezca el QR animado:

```html
<!-- QR animado · Cartografía y Territorio -->
<section class="qr-animado" aria-label="QR animado del portal">
  <iframe
    src="qr-animado-cartografia/index.html"
    title="Explora Cartografía y Territorio — escanea el código"
    loading="lazy"
    style="width:min(100%,420px);aspect-ratio:1/1;border:0;display:block;margin:0 auto;"
    allow="autoplay"
  ></iframe>
</section>
```

**Ventajas:** aislamiento total (la animación vive en su propio documento),
cero conflicto con los estilos o scripts del portal, y es fácil de quitar.

**Responsive:** ajusta el `width` de arriba al ancho deseado (420–560 px suele
quedar bien en una columna). La animación mantiene la proporción 1:1 sola.

---

## Opción 2 — Incrustación directa (un solo documento)

Si prefieres que la animación viva dentro de una página del portal, copia estos
tres fragmentos:

1. En el `<head>`, el estilo del lienzo:

```html
<style>
  .qr-animado { width:min(100%,560px); aspect-ratio:1/1; margin:0 auto; position:relative; }
  .qr-animado canvas { display:block; width:100%; height:100%; border-radius:4px;
    box-shadow:0 12px 40px rgba(4,19,38,.14),0 2px 8px rgba(4,19,38,.08); }
</style>
```

2. En el lugar deseado del `<body>`:

```html
<div class="qr-animado">
  <canvas id="qr-animado-c"></canvas>
</div>
```

3. Antes de `</body>`, el código de animación: copia **todo** el contenido del
   `<script>` de `index.html` y sustituye la línea del canvas:

```js
const canvas = document.getElementById('qr-animado-c');   // antes: 'c'
```

> ⚠️ El `<script>` usa un `id` propio (`c`). Cambiar el selector del canvas es
> lo único que necesitas tocar. No inyecta CSS global ni sobrescribe nada.

---

## Opción 3 — Solo el material listo (vídeo / imagen)

Para presentaciones, difusión o un bloque estático, usa los archivos ya
generados en `renders/`:

```html
<!-- Vídeo (1080×1080, se reproduce en bucle) -->
<video src="qr-animado-cartografia/renders/qr-cartografia.mp4"
       autoplay loop muted playsinline
       style="width:min(100%,560px);aspect-ratio:1/1;object-fit:cover;"></video>

<!-- GIF / WebP animado (compartir) -->
<img src="qr-animado-cartografia/renders/qr-cartografia.gif"
     alt="QR animado de Cartografía y Territorio" style="width:min(100%,480px);">

<!-- QR estático (impresión / alta resolución) -->
<img src="qr-animado-cartografia/renders/qr-cartografia-impresion.png"
     alt="Código QR del portal" style="width:min(100%,480px);">
```

---

## Variante con fondo transparente

Para superponer el QR sobre otro fondo (portadas, diapositivas, pie de página):

| Archivo | Uso |
|---|---|
| `renders/qr-cartografia-transparente.png` | QR estático (solo módulos, sin fondo) |
| `renders/qr-cartografia-transparente.webp` | Formación del QR en bucle, con canal alfa (web) |
| `renders/qr-cartografia-transparente.mov` | Formación del QR, con canal alfa (vídeo para Keynote/PowerPoint/Premiere) |
| `index.html?transparent=1` | Versión web en vivo, sin fondo |

> Los módulos son azul tinta (`#041326`): pensados para **fondos claros**.
> Sobre fondos oscuros usa la versión con fondo crema.

---

## Despliegue en GitHub Pages

1. Copia la carpeta `qr-animado-cartografia/` dentro del repositorio del portal.
2. Confirma que `index.html` de la animación queda en una ruta accesible
   (p. ej. `https://francisco4555.github.io/Cartograf-a-y-Territorio/qr-animado-cartografia/`).
3. No requiere build ni dependencias: es HTML/CSS/JS plano.

---

## Notas de calidad

- **QR verificado:** la matriz decodifica exactamente al formulario de registro
  (`https://docs.google.com/forms/d/e/1FAIpQLSejL9DDr-LRzNWPgehqj9VGAan6yLDu7dulSI-hxaPze0-0kw/viewform?usp=sharing&ouid=108182142289615307312`,
  versión 8, nivel de corrección M). Los patrones de localización, los módulos y
  la zona de silencio (4 módulos) se conservan intactos.
- **Contraste:** módulos `#041326` sobre fondo `#faf5ed` (≈ 15:1), muy por
  encima del mínimo recomendado para escaneo.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` la animación
  muestra directamente el QR estático y escaneable, sin movimiento.
- **Sin solapamientos:** el texto y la línea de escaneo se dibujan siempre
  fuera del área del código; nunca sobre los módulos.
