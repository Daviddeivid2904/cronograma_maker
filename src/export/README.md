# Sistema de Exportación de Horarios

Este sistema permite exportar horarios semanales como imágenes PNG de alta resolución y documentos PDF.

## Archivos

- `types.ts` - Definiciones de tipos TypeScript
- `utils.ts` - Funciones utilitarias (conversión de tiempo, colores, etc.)
- `SchedulePoster.tsx` - Componente React que renderiza el horario como SVG
- `exportImage.ts` - Funciones de exportación a PNG y PDF
- `buildScheduleData.ts` - Conversión del estado de la app a ScheduleData
- `example.ts` - Ejemplo de uso

## Uso Básico

```typescript
import { posterToPng, posterToPdf, downloadFile, downloadBlob } from './export/exportImage';
import { buildScheduleDataFromState } from './export/buildScheduleData';

// Convertir estado actual a ScheduleData
const data = buildScheduleDataFromState(activities, blocks, config, title, subtitle);

// Exportar a PNG
const pngDataUrl = await posterToPng(data, {
  width: 2480,
  height: 3508,
  theme: "light",
  showLegend: true
});
downloadFile(pngDataUrl, "horario.png");

// Exportar a PDF
const pdfBlob = await posterToPdf(data, {
  theme: "light",
  showLegend: true
});
downloadBlob(pdfBlob, "horario.pdf");
```

## Formatos Soportados

### PNG
- **A4**: 2480×3508 px (300 DPI)
- **16:9**: 2560×1440 px
- **Cuadrado**: 2048×2048 px

### PDF
- **A4**: Documento vertical listo para imprimir

## Temas Disponibles

- **light**: Fondo blanco, líneas grises (por defecto)
- **classic**: Cabeceras verdes, estilo serif
- **pastel**: Fondo azul claro, colores suaves

## Características

- ✅ SVG nítido en cualquier resolución
- ✅ Colores automáticos de contraste (blanco/negro)
- ✅ Soporte para almuerzo/intervalo
- ✅ Leyenda opcional
- ✅ Watermark opcional
- ✅ Múltiples formatos de salida
- ✅ Temas predefinidos
- ✅ Truncado inteligente de texto

## Estructura de Datos

```typescript
type ScheduleData = {
  title?: string;
  subtitle?: string;
  days: string[];
  start: string;        // "08:00"
  end: string;          // "18:00"
  stepMin: number;      // 10 | 20 | 30 | 45 | 50 | 60
  lunch?: {
    start: string;
    durationMin: number;
    label?: string;
  };
  items: Array<{
    dayIndex: number;
    start: string;
    end: string;
    title: string;
    teacher?: string;
    room?: string;
    color: string;
    textColor?: string;
  }>;
};
```

## Integración en la UI

El botón "📄 Exportar" en el header abre un modal con opciones:
- Título y subtítulo personalizables
- Selector de formato (A4, 16:9, Cuadrado)
- Selector de tema
- Toggle para leyenda
- Botones para PNG y PDF

## Dependencias

- `jspdf` - Para generación de PDF
- React - Para el componente SVG
- Canvas API - Para conversión SVG → PNG
