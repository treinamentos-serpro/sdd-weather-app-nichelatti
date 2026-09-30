import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('mapeia condições distintas do Open-Meteo', () => {
    expect(getWeatherCondition(0)).toEqual({ label: 'Céu limpo', icon: 'clear-day' });
    expect(getWeatherCondition(63)).toEqual({ label: 'Chuva moderada', icon: 'rain' });
    expect(getWeatherCondition(95)).toEqual({ label: 'Trovoada', icon: 'thunderstorm' });
  });

  it('retorna fallback legível para código desconhecido', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição desconhecida',
      icon: 'unknown',
    });
  });
});
