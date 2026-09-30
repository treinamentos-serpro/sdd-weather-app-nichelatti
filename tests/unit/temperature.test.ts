import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, toFahrenheit } from '../../src/lib/temperature';

describe('temperature', () => {
  it('converte Celsius para Fahrenheit', () => {
    expect(toFahrenheit(0)).toBe(32);
    expect(toFahrenheit(100)).toBe(212);
    expect(toFahrenheit(-40)).toBe(-40);
  });

  it('mantém Celsius como unidade canônica', () => {
    expect(convertTemperature(18.6, 'celsius')).toBe(18.6);
    expect(formatTemperature(18.6, 'celsius')).toBe('19°C');
  });

  it('arredonda e identifica Fahrenheit na apresentação', () => {
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
    expect(formatTemperature(20.4, 'fahrenheit')).toBe('69°F');
  });
});
