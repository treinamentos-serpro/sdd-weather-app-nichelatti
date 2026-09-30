import type { TemperatureUnit } from '../types/weather';

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
}

export function formatTemperature(celsius: number | undefined, unit: TemperatureUnit): string {
  if (celsius === undefined) {
    return 'Indisponível';
  }
  const value = Math.round(convertTemperature(celsius, unit));
  return `${value}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}
