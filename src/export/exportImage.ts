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

// Exportar a PDF usando jsPDF
export async function posterToPdf(
  data: ScheduleData, 
  opts: ExportOptions = {}
): Promise<Blob> {
  const { 
    theme = "light", 
    showLegend = false, 
    watermark 
  } = opts;

  try {
    // Importar jsPDF dinámicamente
    const { default: jsPDF } = await import('jspdf');
    
    // Generar PNG primero
    const pngDataUrl = await posterToPng(data, { 
      width: 2480, 
      height: 3508, 
      theme, 
      showLegend, 
      watermark 
    });
    
    // Crear PDF A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calcular dimensiones para centrar la imagen
    const imgWidth = pageWidth - 20; // 10mm de margen en cada lado
    const imgHeight = (imgWidth * 3508) / 2480; // mantener proporción
    
    // Si la imagen es muy alta, ajustar
    const finalHeight = Math.min(imgHeight, pageHeight - 20);
    const finalWidth = (finalHeight * 2480) / 3508;
    
    // Centrar en la página
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;
    
    // Agregar imagen al PDF
    pdf.addImage(pngDataUrl, 'PNG', x, y, finalWidth, finalHeight);
    
    // Retornar como Blob
    return pdf.output('blob');
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF. Asegúrate de que jsPDF esté instalado.');
  }
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
