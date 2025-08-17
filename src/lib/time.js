export const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

// Genera las etiquetas de hora para mostrar
export function buildTimeLabels(startHour = 7, endHour = 22) {
  const labels = []
  for (let hour = startHour; hour < endHour; hour++) {
    labels.push(`${hour.toString().padStart(2, '0')}:00`)
    labels.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return labels
}
