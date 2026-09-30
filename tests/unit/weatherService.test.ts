import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeatherServiceError } from '../../src/services/geocodingService';
import { getWeather } from '../../src/services/weatherService';

afterEach(() => vi.unstubAllGlobals());

function validPayload() {
  return {
    current: {
      temperature_2m: 18.5,
      relative_humidity_2m: 72,
      wind_speed_10m: 12.4,
      surface_pressure: 1012.8,
      precipitation: 0.2,
      weather_code: 3,
      time: '2026-09-30T12:00',
    },
    daily: {
      time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
      weather_code: [3, 2, 1, 0, 61],
      temperature_2m_max: [22, 23, 24, 25, 20],
      temperature_2m_min: [14, 15, 16, 17, 13],
      precipitation_probability_max: [20, 30, 40, 10, 60],
    },
  };
}

describe('getWeather', () => {
  it('mapeia o clima atual e exatamente cinco dias', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(validPayload())));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(-23.55, -46.63)).resolves.toMatchObject({
      current: {
        temperatureC: 18.5,
        relativeHumidity: 72,
        windSpeed: 12.4,
        surfacePressure: 1012.8,
        precipitation: 0.2,
        weatherCode: 3,
      },
      forecast: [
        { date: '2026-09-30', minTemperatureC: 14, maxTemperatureC: 22, weatherCode: 3 },
        { date: '2026-10-01', minTemperatureC: 15, maxTemperatureC: 23, weatherCode: 2 },
        { date: '2026-10-02', minTemperatureC: 16, maxTemperatureC: 24, weatherCode: 1 },
        { date: '2026-10-03', minTemperatureC: 17, maxTemperatureC: 25, weatherCode: 0 },
        {
          date: '2026-10-04',
          minTemperatureC: 13,
          maxTemperatureC: 20,
          weatherCode: 61,
          precipitationProbability: 60,
        },
      ],
    });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('current')).toBe(
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    );
    expect(url.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    );
    expect(url.searchParams.get('forecast_days')).toBe('5');
  });

  it('preserva temperatura atual ausente sem convertê-la em zero', async () => {
    const payload = {
      ...validPayload(),
      current: { ...validPayload().current, temperature_2m: undefined },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    await expect(getWeather(-23.55, -46.63)).resolves.toMatchObject({
      current: { temperatureC: undefined },
    });
  });

  it.each([
    ['erro HTTP', () => Promise.resolve(new Response('{}', { status: 503 }))],
    ['falha de rede', () => Promise.reject(new TypeError('network'))],
    ['cancelamento', () => Promise.reject(new DOMException('aborted', 'AbortError'))],
    [
      'resposta parcial',
      () => Promise.resolve(new Response(JSON.stringify({ current: validPayload().current }))),
    ],
  ])('lança erro controlado em caso de %s', async (_, implementation) => {
    vi.stubGlobal('fetch', vi.fn(implementation));
    await expect(getWeather(-23.55, -46.63)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('aborta a consulta quando o timeout é atingido', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: string | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const request = getWeather(-23.55, -46.63);
      const rejection = expect(request).rejects.toThrow('tempo limite de 10 segundos');
      await vi.advanceTimersByTimeAsync(10_000);
      await rejection;
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('orienta a verificar a conexão quando a consulta falha por rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));

    await expect(getWeather(-23.55, -46.63)).rejects.toThrow('Verifique sua conexão');
  });
});
