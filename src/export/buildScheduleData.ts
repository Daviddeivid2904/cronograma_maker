import { ScheduleData } from './types';

export function buildScheduleDataFromState(
  activities: Array<{ id: string; name: string; color: string }>,
  blocks: Array<{
    id: string;
    dayIndex: number;
    startSlot: number;
    endSlot: number;
    activityId: string;
    name: string;
    color: string;
    subtitle?: string; // << NUEVO: campo opcional para subtítulos
    timeLabel: string; // "HH:MM–HH:MM"
  }>,
  config: {
    days: string[];
    start?: string;
    end?: string;
    stepMin: number;
    lunchEnabled?: boolean;
    lunchStart?: string;
    lunchEnd?: string;
  },
  title?: string,
  subtitle?: string
): ScheduleData {
  const items = blocks.map(block => {
    const timeMatch = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/);
    const startTime = timeMatch ? timeMatch[1] : '08:00';
    const endTime = timeMatch ? timeMatch[2] : '09:00';
    
    return {
      dayIndex: block.dayIndex,
      start: startTime,
      end: endTime,
      title: block.name,
      subtitle: block.subtitle || undefined, // << NUEVO: incluir subtítulo en exportación
      color: block.color,
    };
  });

  const lunch = config.lunchEnabled && config.lunchStart && config.lunchEnd ? {
    start: config.lunchStart,
    durationMin: (() => {
      const [sh, sm] = config.lunchStart!.split(':').map(Number);
      const [eh, em] = config.lunchEnd!.split(':').map(Number);
      return (eh * 60 + em) - (sh * 60 + sm);
    })(),
    label: 'Almuerzo',
  } : null;

  // Calcular el paso de tiempo óptimo para la exportación
  const calculateOptimalStep = (): number => {
    if (items.length === 0) return 60; // 1 hora por defecto
    
    // Calcular duraciones de todas las tarjetas en minutos
    const durations: number[] = [];
    for (const item of items) {
      const [startH, startM] = item.start.split(':').map(Number);
      const [endH, endM] = item.end.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);
      if (duration > 0) {
        durations.push(duration);
      }
    }
    
    if (durations.length === 0) return 60;
    
    // Encontrar el máximo común divisor de todas las duraciones
    const gcd = (a: number, b: number): number => {
      while (b) {
        [a, b] = [b, a % b];
      }
      return a;
    };
    
    let commonDivisor = durations[0];
    for (let i = 1; i < durations.length; i++) {
      commonDivisor = gcd(commonDivisor, durations[i]);
    }
    
    // Aplicar límites: entre 30 minutos y 2 horas
    if (commonDivisor < 30) {
      // Si es menor a 30 min, buscar el múltiplo más cercano
      const factors = [30, 45, 60, 90, 120];
      for (const factor of factors) {
        if (factor % commonDivisor === 0) {
          return factor;
        }
      }
      return 60; // 1 hora por defecto
    } else if (commonDivisor > 120) {
      return 60; // 1 hora por defecto
    }
    
    return commonDivisor;
  };

  return {
    title: title || 'Mi Horario Semanal',
    subtitle: subtitle || 'Planificador de Actividades',
    days: config.days,
    tickStepMin: calculateOptimalStep(), // Paso óptimo calculado automáticamente
    items,
    lunch,
  };
}
