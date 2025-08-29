// src/export/exportImage.ts
import SchedulePoster from './SchedulePoster';
import type { ScheduleData, ThemeName } from './types';

/* ---------- Util: embebe <image href="..."> como data:URI en el SVG ---------- */
async function inlineImageHrefs(svg: string): Promise<string> {
  const hrefRegex = /(xlink:href|href)\s*=\s*["']([^"']+)["']/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = hrefRegex.exec(svg))) {
    const url = m[2];
    if (/^data:/i.test(url)) continue;
    if (/^https?:|^\//i.test(url)) urls.add(url);
  }
  if (!urls.size) return svg;

  const urlToDataUri = new Map<string, string>();
  for (const u of urls) {
    try {
      const abs = new URL(u.startsWith('/') ? u.slice(1) : u, document.baseURI).toString();
      const res = await fetch(abs, { mode: 'cors' });
      const blob = await res.blob();
      const dataUri = await new Promise<string>((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.readAsDataURL(blob);
      });
      urlToDataUri.set(u, dataUri);
    } catch (err) {
      console.warn('No se pudo inlinear imagen del SVG:', u, err);
    }
  }

  return svg.replace(hrefRegex, (full, attr, url) => {
    const data = urlToDataUri.get(url);
    return data ? `${attr}="${data}"` : full;
  });
}

/* ============= Tipos locales de export (aceptan ThemeName) ============= */
type AnyThemeOpts = {
  width?: number;
  height?: number;
  theme?: ThemeName;
  showLegend?: boolean;
  watermark?: string;
  // PDF:
  dpi?: number;
  jpegQuality?: number;
  oversample?: number;
  marginPt?: number;
  compression?: 'FAST' | 'MEDIUM' | 'SLOW';
};

/* ================== PNG (desde SVG) ================== */
export async function posterToPng(
  data: ScheduleData,
  opts: AnyThemeOpts = {}
): Promise<string> {
  const {
    width = 2480,
    height = 3508,
    theme = 'light',
    showLegend = false,
    watermark,
  } = opts;

  const ReactDOMServer = await import('react-dom/server');

  // Render React → SVG string (theme casteado por si viene string desde fuera)
  const poster = SchedulePoster({
    data,
    width,
    height,
    theme: theme as ThemeName,
    showLegend,
    watermark,
  });
  let svgString = ReactDOMServer.renderToString(poster);

  // Namespaces en <svg>
  if (!/xmlns=/.test(svgString)) {
    svgString = svgString.replace(
      /<svg/i,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`
    );
  } else if (!/xmlns:xlink=/.test(svgString)) {
    svgString = svgString.replace(
      /<svg([^>]+)>/,
      `<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">`
    );
  }

  // Inline imágenes
  svgString = await inlineImageHrefs(svgString);

  // SVG → Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener contexto de canvas');

  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  (img as any).crossOrigin = 'anonymous';
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<string>((resolve, reject) => {
    img.onload = () => {
      try {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar SVG'));
    };
    img.src = url;
  });
}

/* ================== PDF (respeta el formato elegido) ================== */
export async function posterToPdf(
  data: any,
  {
    width = 2480,
    height = 3508,
    theme = 'light',
    showLegend = false,
    watermark,
    dpi = 240,
    jpegQuality = 0.93,
    oversample = 1.3,
    marginPt = 0,
    compression = 'SLOW',
  }: AnyThemeOpts = {}
): Promise<Blob> {
  const targetW = Math.round(width * oversample);
  const targetH = Math.round(height * oversample);

  const png = await posterToPng(data, {
    width: targetW,
    height: targetH,
    theme: theme as ThemeName,
    showLegend,
    watermark,
  });

  const tmp = new Image();
  tmp.crossOrigin = 'anonymous';
  tmp.src = png;
  await tmp.decode();

  const finalW = Math.round(targetW / oversample);
  const finalH = Math.round(targetH / oversample);

  const c = document.createElement('canvas');
  c.width = finalW;
  c.height = finalH;
  const cctx = c.getContext('2d')!;
  cctx.imageSmoothingEnabled = true;
  cctx.imageSmoothingQuality = 'high';
  cctx.drawImage(tmp, 0, 0, finalW, finalH);
  const jpegDataUrl = c.toDataURL('image/jpeg', jpegQuality);

  const pageWpt = (finalW / dpi) * 72;
  const pageHpt = (finalH / dpi) * 72;
  const orientation = pageWpt >= pageHpt ? 'landscape' : 'portrait';

  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format: [pageWpt, pageHpt],
    compress: true,
    precision: 2,
  });

  const x = marginPt;
  const y = marginPt;
  const w = pageWpt - marginPt * 2;
  const h = pageHpt - marginPt * 2;
  const ratio = finalW / finalH;

  let drawW = w;
  let drawH = drawW / ratio;
  if (drawH > h) {
    drawH = h;
    drawW = drawH * ratio;
  }
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;

  pdf.addImage(jpegDataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, compression);
  return pdf.output('blob') as Blob;
}

/* ================== Helpers descarga ================== */
export function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
