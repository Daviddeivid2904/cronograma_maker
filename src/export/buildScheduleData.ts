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

  return {
    title: title || 'Mi Horario Semanal',
    subtitle: subtitle || 'Planificador de Actividades',
    days: config.days,
    tickStepMin: config.stepMin, // Quantum mínimo para GCD
    items,
    lunch,
  };
}
