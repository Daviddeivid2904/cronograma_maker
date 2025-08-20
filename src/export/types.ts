export type ScheduleData = {
  title?: string;
  subtitle?: string;
  days: string[];
  tickStepMin?: number;           // quantum mínimo (min)
  cellCap?: number;               // nuevo: límite de mini-celdas verticales
  lunch?: { start: string; durationMin: number; label?: string } | null;
  items: Array<{
    dayIndex: number;
    start: string;                // "HH:MM"
    end: string;                  // "HH:MM"
    title: string;
    teacher?: string;
    room?: string;
    color: string;
    textColor?: string;
  }>;
};

export type PosterProps = {
  data: ScheduleData;
  width?: number;                 // default A4: 2480
  height?: number;                // default A4: 3508
  theme?: "classic" | "light" | "pastel";
  showLegend?: boolean;
  watermark?: string;
};

export type ExportOptions = {
  width?: number;
  height?: number;
  theme?: PosterProps["theme"];
  showLegend?: boolean;
  watermark?: string;
};
