export function toInputDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function addMonths(date, months) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value;
}

export function formatDateText(dateStr, fallback = '[Fecha]') {
  if (!dateStr) return fallback;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(timeStr, fallback = '[Hora]') {
  if (!timeStr) return fallback;
  const [hourValue, minutes] = timeStr.split(':');
  let hours = Number.parseInt(hourValue, 10);
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function suggestedHours(activity) {
  if (activity?.startsWith('Estancia')) return 120;
  if (activity?.startsWith('Estadía')) return 600;
  return '';
}

export function fileSafeName(value, fallback = 'documento') {
  return (value || fallback).trim().replace(/\s+/g, '_').replace(/[\\/:*?"<>|]/g, '');
}
