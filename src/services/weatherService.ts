import type { CurrentWeather, ForecastDay, WeatherData } from '../types/weather';
import { WeatherServiceError } from './geocodingService';

export { WeatherServiceError } from './geocodingService';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;
const FORECAST_DAYS = 5;

interface ForecastResponse {
  current?: unknown;
  daily?: unknown;
}

interface CurrentResponse {
  temperature_2m?: unknown;
  relative_humidity_2m?: unknown;
  wind_speed_10m?: unknown;
  surface_pressure?: unknown;
  precipitation?: unknown;
  weather_code?: unknown;
  time?: unknown;
}

interface DailyResponse {
  time?: unknown;
  weather_code?: unknown;
  temperature_2m_max?: unknown;
  temperature_2m_min?: unknown;
  precipitation_probability_max?: unknown;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isFiniteNumber);
}

function readOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!isFiniteNumber(value)) {
    throw new WeatherServiceError('A resposta meteorológica está incompleta.');
  }
  return value;
}

function isOptionalNumberArray(value: unknown): value is Array<number | undefined> {
  return (
    Array.isArray(value) &&
    value.every((item) => item === undefined || item === null || isFiniteNumber(item))
  );
}

function readCurrent(value: unknown): CurrentWeather {
  if (typeof value !== 'object' || value === null) {
    throw new WeatherServiceError('A resposta meteorológica está incompleta.');
  }
  const current = value as CurrentResponse;
  if (!isFiniteNumber(current.weather_code) || typeof current.time !== 'string') {
    throw new WeatherServiceError('A resposta meteorológica está incompleta.');
  }
  return {
    temperatureC: readOptionalNumber(current.temperature_2m),
    relativeHumidity: readOptionalNumber(current.relative_humidity_2m),
    windSpeed: readOptionalNumber(current.wind_speed_10m),
    surfacePressure: readOptionalNumber(current.surface_pressure),
    precipitation: readOptionalNumber(current.precipitation),
    weatherCode: current.weather_code,
    observedAt: current.time,
  };
}

function readForecast(value: unknown): ForecastDay[] {
  if (typeof value !== 'object' || value === null) {
    throw new WeatherServiceError('A previsão meteorológica está incompleta.');
  }
  const daily = value as DailyResponse;
  if (
    !isStringArray(daily.time) ||
    !isNumberArray(daily.weather_code) ||
    !isOptionalNumberArray(daily.temperature_2m_max) ||
    !isOptionalNumberArray(daily.temperature_2m_min) ||
    !isOptionalNumberArray(daily.precipitation_probability_max) ||
    daily.time.length < FORECAST_DAYS ||
    daily.weather_code.length < FORECAST_DAYS ||
    daily.temperature_2m_max.length < FORECAST_DAYS ||
    daily.temperature_2m_min.length < FORECAST_DAYS ||
    daily.precipitation_probability_max.length < FORECAST_DAYS
  ) {
    throw new WeatherServiceError('A previsão meteorológica está incompleta.');
  }

  const dates = daily.time as string[];
  const weatherCodes = daily.weather_code as number[];
  const maxTemperatures = daily.temperature_2m_max as Array<number | undefined>;
  const minTemperatures = daily.temperature_2m_min as Array<number | undefined>;
  const precipitationProbabilities = daily.precipitation_probability_max as Array<
    number | undefined
  >;

  return Array.from({ length: FORECAST_DAYS }, (_, index) => ({
    date: dates[index],
    weatherCode: weatherCodes[index],
    maxTemperatureC: maxTemperatures[index] ?? undefined,
    minTemperatureC: minTemperatures[index] ?? undefined,
    precipitationProbability: precipitationProbabilities[index],
  }));
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    throw new WeatherServiceError('As coordenadas da cidade são inválidas.');
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
  });
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${FORECAST_URL}?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new WeatherServiceError('O serviço meteorológico está indisponível. Tente novamente.');
    }
    const payload = (await response.json()) as ForecastResponse;
    const current = readCurrent(payload.current);
    const forecast = readForecast(payload.daily);
    return {
      city: { name: '', latitude, longitude },
      current,
      forecast,
    };
  } catch (error) {
    if (timedOut) {
      throw new WeatherServiceError(
        'A consulta excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.',
      );
    }
    if (error instanceof WeatherServiceError) {
      throw error;
    }
    throw new WeatherServiceError(
      'Falha de conexão ao consultar o clima. Verifique sua conexão e tente novamente.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
