const INVALID_DATE_LABEL = 'Data indisponível';

export function formatDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return INVALID_DATE_LABEL;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);
}
