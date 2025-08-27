import { ScheduleData, ExportOptions } from './types';
import SchedulePoster from './SchedulePoster';

// Convertir SVG a PNG usando canvas
export async function posterToPng(
  data: ScheduleData, 
  opts: ExportOptions = {}
): Promise<string> {
  const { 
    width = 2480, 
    height = 3508, 
    theme = "light", 
    showLegend = false, 
    watermark 
  } = opts;

  // Crear el SVG como string usando ReactDOMServer
  const ReactDOMServer = await import('react-dom/server');
  
  // Renderizar el componente SchedulePoster a string
  const poster = SchedulePoster({ 
    data, 
    width, 
    height, 
    theme, 
    showLegend, 
    watermark 
  });
  
  // Convertir React element a SVG string
  const svgString = ReactDOMServer.renderToString(poster);
  
  // Crear canvas para convertir SVG a PNG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener contexto de canvas');
  
  canvas.width = width;
  canvas.height = height;
  
  // Crear imagen desde SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise(async (resolve, reject) => {
    img.onload = async () => {
      try {
        await img.decode(); // Evitar race conditions en algunos navegadores
        // Dibujar imagen en canvas
        ctx.drawImage(img, 0, 0);
        
        // Convertir a PNG
        const pngDataUrl = canvas.toDataURL('image/png');
        
        // Limpiar
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

// src/export/exportImage.ts
// PDF raster de alta definición con render directo al tamaño objetivo + oversampling

export async function posterToPdf(
  data: any,
  {
    // tamaño base de tu poster (usado solo si querés exportar otros formatos que no sean A4)
    width = 2480,
    height = 3508,

    theme,
    showLegend,
    watermark,

    // calidad
    dpi = 240,            // 220–300: más dpi = más nitidez (y más peso)
    jpegQuality = 0.9,    // 0.85–0.92 anda muy bien
    oversample = 1.3,     // 1.0=off | 1.2–1.5 mejora el edge del texto
    marginPt = 0,         // 0 = sin márgenes; 18 ~ 6 mm
    compression = "SLOW", // jsPDF addImage: "FAST" | "MEDIUM" | "SLOW"
  }: {
    width?: number;
    height?: number;
    theme?: any;
    showLegend?: boolean;
    watermark?: string;
    dpi?: number;
    jpegQuality?: number;
    oversample?: number;
    marginPt?: number;
    compression?: "FAST" | "MEDIUM" | "SLOW";
  } = {}
): Promise<Blob> {
  // Página A4 en puntos (72 pt = 1")
  const pageWpt = 595.28;
  const pageHpt = 841.89;

  // Tamaño objetivo de la imagen en píxeles para que quede 1:1 en el PDF
  const targetWpx = Math.round((pageWpt / 72) * dpi * oversample);
  const targetHpx = Math.round((pageHpt / 72) * dpi * oversample);

  // 1) Render del póster directamente a la resolución objetivo (evita reescalar luego)
  const pngAtTarget = await posterToPng(data, {
    width: targetWpx,
    height: targetHpx,
    theme,
    showLegend,
    watermark,
  });

  // 2) Pasar a JPEG (mucho más liviano que PNG dentro del PDF)
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = pngAtTarget;
  await img.decode();

  // Si oversample > 1, hacemos un pequeño downscale para afinar bordes
  let outDataUrl: string;
  if (oversample && oversample !== 1) {
    const finalW = Math.round(targetWpx / oversample);
    const finalH = Math.round(targetHpx / oversample);
    const c = document.createElement("canvas");
    c.width = finalW;
    c.height = finalH;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, finalW, finalH);
    outDataUrl = c.toDataURL("image/jpeg", jpegQuality);
  } else {
    // sin oversampling: convertir directo
    const c = document.createElement("canvas");
    c.width = targetWpx;
    c.height = targetHpx;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWpx, targetHpx);
    outDataUrl = c.toDataURL("image/jpeg", jpegQuality);
  }

  // 3) Armar el PDF e insertar la imagen a tamaño real (sin estirar)
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageWpt, pageHpt],
    compress: true,
    precision: 2,
  });

  const x = marginPt;
  const y = marginPt;
  const w = pageWpt - marginPt * 2;
  const h = pageHpt - marginPt * 2;

  pdf.addImage(outDataUrl, "JPEG", x, y, w, h, undefined, compression);

  return pdf.output("blob");
}



// Función helper para descargar archivo
export function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función helper para descargar blob
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
