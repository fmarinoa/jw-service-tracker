import { DateTime } from 'luxon';

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const WEEKDAYS_ES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

/**
 * Formats a Luxon DateTime as "MMMM yyyy" (e.g. "julio 2026")
 */
export function formatMonthYear(dt: DateTime): string {
  const monthName = MONTHS_ES[dt.month - 1] || 'enero';
  return `${monthName} ${dt.year}`;
}

/**
 * Formats a Luxon DateTime as "EEEE d 'de' MMMM 'del' yyyy" (e.g. "jueves 16 de julio del 2026")
 */
export function formatLongDate(dt: DateTime): string {
  const weekdayName = WEEKDAYS_ES[dt.weekday === 7 ? 0 : dt.weekday] || 'lunes';
  const monthName = MONTHS_ES[dt.month - 1] || 'enero';
  return `${weekdayName} ${dt.day} de ${monthName} del ${dt.year}`;
}
