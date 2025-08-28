// src/export/exportImage.ts
import SchedulePoster from './SchedulePoster';
import { ScheduleData, ExportOptions } from './types';

// ================== PNG (desde SVG) ==================

export async function posterToPng(
  data: ScheduleData,
  opts: ExportOptions = {}
): Promise<string> {
  const {
    width = 2480,
    height = 3508,
    theme = 'light',
    showLegend = false,
    watermark,
  } = opts;

  // Render a string (SSR) del SVG
  const ReactDOMServer = await import('react-dom/server');
  const poster = SchedulePoster({
    data,
    width,
    height,
    theme,
    showLegend,
    watermark,
  });
  const svgString = ReactDOMServer.renderToString(poster);

  // Llevar a <img/> y dibujar en canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener contexto de canvas');

  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      try {
        await img.decode();
        // Fondo blanco por si el SVG tiene transparencia
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngDataUrl);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar SVG'));
    };
    img.src = url;
  });
}

// ================== PDF (respeta el formato elegido) ==================

/**
 * Genera un PDF cuya página tiene la MISMA proporción que `width`×`height` que le pasás.
 * - Si pasás 2480×3508 → página vertical (tipo A4).
 * - Si pasás 2560×1440 → página horizontal 16:9.
 * - Si pasás 2048×2048 → página cuadrada.
 *
 * `dpi` controla cuántos píxeles convertimos a puntos PDF (72 pt = 1").
 * `oversample` dibuja más grande y hace downscale para afinar bordes.
 */
export async function posterToPdf(
  data: any,
  {
    width = 2480,
    height = 3508,
    theme = 'light',
    showLegend = false,
    watermark,
    dpi = 240,             // 200–300 recomendado
    jpegQuality = 0.93,    // 0.9 suele estar perfecto
    oversample = 1.3,      // 1.0=off | 1.2–1.5 mejora bordes
    marginPt = 0,          // márgenes en puntos PDF (1/72")
    compression = 'SLOW',  // 'FAST' | 'MEDIUM' | 'SLOW'
  }: {
    width?: number;
    height?: number;
    theme?: 'classic' | 'light' | 'pastel';
    showLegend?: boolean;
    watermark?: string;
    dpi?: number;
    jpegQuality?: number;
    oversample?: number;
    marginPt?: number;
    compression?: 'FAST' | 'MEDIUM' | 'SLOW';
  } = {}
): Promise<Blob> {
  // 1) Render a PNG en la resolución objetivo (para nitidez)
  //    Si oversample > 1, dibujamos más grande para luego afinar.
  const targetWpx = Math.round(width * oversample);
  const targetHpx = Math.round(height * oversample);

  const pngAtTarget = await posterToPng(data, {
    width: targetWpx,
    height: targetHpx,
    theme,
    showLegend,
    watermark,
  });

  // 2) (Opcional) Downscale + JPEG para aligerar
  const tmpImg = new Image();
  tmpImg.crossOrigin = 'anonymous';
  tmpImg.src = pngAtTarget;
  await tmpImg.decode();

  const finalWpx = Math.round(targetWpx / oversample);
  const finalHpx = Math.round(targetHpx / oversample);

  const c = document.createElement('canvas');
  c.width = finalWpx;
  c.height = finalHpx;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tmpImg, 0, 0, finalWpx, finalHpx);
  const outDataUrl = c.toDataURL('image/jpeg', jpegQuality);

  // 3) Página PDF que respete la proporción que pediste
  //    Conversión: px → pt en función del dpi
  const pageWpt = (finalWpx / dpi) * 72;
  const pageHpt = (finalHpx / dpi) * 72;
  const orientation = pageWpt >= pageHpt ? 'landscape' : 'portrait';

  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    // formato EXACTO en puntos, acorde al width/height que pediste
    format: [pageWpt, pageHpt],
    compress: true,
    precision: 2,
  });

  // 4) Colocar con margen opcional, SIN deformar
  const x = marginPt;
  const y = marginPt;
  const w = pageWpt - marginPt * 2;
  const h = pageHpt - marginPt * 2;

  // Mantener proporción (por si alguien pone márgenes grandes)
  const imgRatio = finalWpx / finalHpx;
  let drawW = w;
  let drawH = drawW / imgRatio;
  if (drawH > h) {
    drawH = h;
    drawW = drawH * imgRatio;
  }
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;

  pdf.addImage(outDataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, compression);

  return pdf.output('blob') as Blob;
}

// ================== Helpers descarga ==================

export function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
