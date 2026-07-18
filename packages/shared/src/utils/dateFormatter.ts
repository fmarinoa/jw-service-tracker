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

/**
 * Returns the current date in the America/Lima timezone formatted as "YYYY-MM-DD".
 */
export function getCurrentIsoDate(): string {
  return DateTime.now().setZone('America/Lima').toISODate()!;
}

/**
 * Converts a millisecond timestamp to a "YYYY-MM-DD" string in the America/Lima timezone.
 */
export function millisToIsoDate(millis: number): string {
  const dt = DateTime.fromMillis(millis).setZone('America/Lima');
  return dt.isValid ? dt.toISODate()! : '';
}

/**
 * Converts a "YYYY-MM-DD" string to a millisecond timestamp in the America/Lima timezone.
 */
export function isoDateToMillis(isoDate: string): number {
  const dt = DateTime.fromISO(isoDate, { zone: 'America/Lima' });
  return dt.isValid ? dt.toMillis() : 0;
}

/**
 * Formats a YYYY-MM-DD string into "dd/MM/yyyy".
 */
export function formatIsoToShortDate(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate);
  return dt.isValid ? dt.toFormat('dd/MM/yyyy') : '';
}

/**
 * Formats a Luxon DateTime as capitalized "MMMM yyyy" (e.g. "Julio 2026")
 */
export function formatMonthYearHeader(dt: DateTime): string {
  const monthName = MONTHS_ES[dt.month - 1] || 'enero';
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalizedMonth} ${dt.year}`;
}

/**
 * Gets the month name in Spanish (capitalized) for a given month number (1-12)
 */
export function getSpanishMonthName(monthNumber: number): string {
  const monthName = MONTHS_ES[monthNumber - 1] || 'enero';
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}
