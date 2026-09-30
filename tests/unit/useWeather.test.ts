import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { searchCities } from '../../src/services/geocodingService';
import { getWeather } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/geocodingService', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/geocodingService')>(
    '../../src/services/geocodingService',
  );
  return { ...actual, searchCities: vi.fn() };
});
vi.mock('../../src/services/weatherService', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/weatherService')>(
    '../../src/services/weatherService',
  );
  return { ...actual, getWeather: vi.fn() };
});

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  region: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const weather = {
  city: { name: '', latitude: city.latitude, longitude: city.longitude },
  current: {
    temperatureC: 20,
    relativeHumidity: 70,
    windSpeed: 10,
    surfacePressure: 1010,
    precipitation: 0,
    weatherCode: 1,
    observedAt: '2026-09-30T12:00',
  },
  forecast: [],
};

afterEach(() => vi.clearAllMocks());

describe('useWeather', () => {
  it('transiciona de busca para seleção e sucesso', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    expect(result.current.state).toEqual({
      status: 'selectingCity',
      query: 'São Paulo',
      cities: [city],
    });

    await act(async () => {
      await result.current.selectCity(city);
    });
    expect(result.current.state).toMatchObject({ status: 'success', data: { city } });
  });

  it('distingue busca vazia e erro com retry', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantis');
    });
    expect(result.current.state).toEqual({ status: 'empty', query: 'Atlantis' });

    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.state).toMatchObject({ status: 'selectingCity', cities: [city] });
  });

  it('troca unidade sem consultar novamente', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search('São Paulo');
      result.current.setUnit('fahrenheit');
    });
    expect(result.current.unit).toBe('fahrenheit');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('ignora resposta antiga quando uma busca nova termina primeiro', async () => {
    let resolveFirst: (cities: City[]) => void = () => undefined;
    const first = new Promise<City[]>((resolve) => {
      resolveFirst = resolve;
    });
    vi.mocked(searchCities).mockReturnValueOnce(first).mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      void result.current.search('São');
      await result.current.search('São Paulo');
    });
    expect(result.current.state).toMatchObject({ status: 'selectingCity', cities: [city] });
    await act(async () => {
      resolveFirst([]);
      await waitFor(() => expect(result.current.state).toMatchObject({ status: 'selectingCity' }));
    });
    expect(result.current.state).toMatchObject({ status: 'selectingCity', cities: [city] });
  });
});
