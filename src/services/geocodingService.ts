import type { City } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface GeocodingResult {
  id?: unknown;
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
}

interface GeocodingResponse {
  results?: unknown;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function mapCity(value: unknown): City {
  if (typeof value !== 'object' || value === null) {
    throw new WeatherServiceError('A resposta de busca é inválida.');
  }

  const result = value as GeocodingResult;
  if (
    typeof result.name !== 'string' ||
    !isFiniteNumber(result.latitude) ||
    !isFiniteNumber(result.longitude)
  ) {
    throw new WeatherServiceError('A resposta de busca está incompleta.');
  }

  return {
    id: typeof result.id === 'number' ? result.id : undefined,
    name: result.name,
    country: typeof result.country === 'string' ? result.country : undefined,
    region: typeof result.admin1 === 'string' ? result.admin1 : undefined,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: typeof result.timezone === 'string' ? result.timezone : undefined,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherServiceError('O serviço de busca está indisponível. Tente novamente.');
    }
    return await response.json();
  } catch (error) {
    if (timedOut) {
      throw new WeatherServiceError(
        'A busca excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.',
      );
    }
    if (error instanceof WeatherServiceError) {
      throw error;
    }
    throw new WeatherServiceError(
      'Falha de conexão ao buscar cidades. Verifique sua conexão e tente novamente.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCities(query: string): Promise<City[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    name: trimmedQuery,
    count: '10',
    language: 'pt',
    format: 'json',
  });
  const response = (await fetchJson(`${GEOCODING_URL}?${params.toString()}`)) as GeocodingResponse;

  if (response.results === undefined) {
    return [];
  }
  if (!Array.isArray(response.results)) {
    throw new WeatherServiceError('A resposta de busca é inválida.');
  }

  return response.results.map(mapCity);
}
