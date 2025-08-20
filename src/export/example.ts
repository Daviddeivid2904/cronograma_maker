import { ScheduleData } from './types';
import { posterToPng, posterToPdf, downloadFile, downloadBlob } from './exportImage';

// Ejemplo de datos de horario
export const exampleScheduleData: ScheduleData = {
  title: "Horario de Clases",
  subtitle: "5° Año - 2025",
  days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  start: "08:00",
  end: "18:00",
  stepMin: 60,
  lunch: {
    start: "12:00",
    durationMin: 60,
    label: "Almuerzo"
  },
  items: [
    {
      dayIndex: 0, // Lunes
      start: "08:00",
      end: "09:00",
      title: "Matemática",
      teacher: "Prof. García",
      room: "Aula 101",
      color: "#f59e0b"
    },
    {
      dayIndex: 0,
      start: "09:00",
      end: "10:00",
      title: "Historia",
      teacher: "Prof. López",
      room: "Aula 102",
      color: "#10b981"
    },
    {
      dayIndex: 1, // Martes
      start: "08:00",
      end: "10:00",
      title: "Física",
      teacher: "Prof. Rodríguez",
      room: "Lab 201",
      color: "#3b82f6"
    },
    {
      dayIndex: 2, // Miércoles
      start: "10:00",
      end: "12:00",
      title: "Literatura",
      teacher: "Prof. Martínez",
      room: "Aula 103",
      color: "#8b5cf6"
    },
    {
      dayIndex: 3, // Jueves
      start: "14:00",
      end: "16:00",
      title: "Química",
      teacher: "Prof. Silva",
      room: "Lab 202",
      color: "#ef4444"
    },
    {
      dayIndex: 4, // Viernes
      start: "16:00",
      end: "18:00",
      title: "Educación Física",
      teacher: "Prof. Torres",
      room: "Gimnasio",
      color: "#06b6d4"
    }
  ]
};

// Ejemplo de uso
export async function exportExample() {
  try {
    // Exportar a PNG
    console.log("Exportando a PNG...");
    const pngDataUrl = await posterToPng(exampleScheduleData, {
      width: 2480,
      height: 3508,
      theme: "light",
      showLegend: true
    });
    downloadFile(pngDataUrl, "horario-ejemplo.png");
    
    // Exportar a PDF
    console.log("Exportando a PDF...");
    const pdfBlob = await posterToPdf(exampleScheduleData, {
      theme: "light",
      showLegend: true
    });
    downloadBlob(pdfBlob, "horario-ejemplo.pdf");
    
    console.log("Exportación completada!");
  } catch (error) {
    console.error("Error en la exportación:", error);
  }
}
