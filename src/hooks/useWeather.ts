import { useRef, useState } from 'react';
import {
  searchCities as searchCitiesService,
  WeatherServiceError,
} from '../services/geocodingService';
import { getWeather } from '../services/weatherService';
import type { City, TemperatureUnit, WeatherData } from '../types/weather';

export type WeatherViewState =
  | { status: 'idle' }
  | { status: 'searching'; query: string }
  | { status: 'selectingCity'; query: string; cities: City[] }
  | { status: 'loadingWeather'; city: City }
  | { status: 'success'; data: WeatherData }
  | { status: 'empty'; query: string }
  | {
      status: 'error';
      operation: 'search' | 'weather';
      message: string;
      query?: string;
      city?: City;
    };

type RetryAction = { type: 'search'; query: string } | { type: 'weather'; city: City };

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof WeatherServiceError ? error.message : fallback;
}

export interface UseWeatherResult {
  state: WeatherViewState;
  unit: TemperatureUnit;
  search: (query: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  setUnit: (unit: TemperatureUnit) => void;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherViewState>({ status: 'idle' });
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const requestId = useRef(0);
  const retryAction = useRef<RetryAction | null>(null);

  async function search(query: string): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    const currentRequest = ++requestId.current;
    retryAction.current = { type: 'search', query: trimmedQuery };
    setState({ status: 'searching', query: trimmedQuery });
    try {
      const cities = await searchCitiesService(trimmedQuery);
      if (currentRequest !== requestId.current) {
        return;
      }
      setState(
        cities.length > 0
          ? { status: 'selectingCity', query: trimmedQuery, cities }
          : { status: 'empty', query: trimmedQuery },
      );
    } catch (error) {
      if (currentRequest === requestId.current) {
        setState({
          status: 'error',
          operation: 'search',
          query: trimmedQuery,
          message: errorMessage(error, 'Não foi possível buscar cidades.'),
        });
      }
    }
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequest = ++requestId.current;
    retryAction.current = { type: 'weather', city };
    setState({ status: 'loadingWeather', city });
    try {
      const weather = await getWeather(city.latitude, city.longitude);
      if (currentRequest !== requestId.current) {
        return;
      }
      setState({
        status: 'success',
        data: { ...weather, city },
      });
    } catch (error) {
      if (currentRequest === requestId.current) {
        setState({
          status: 'error',
          operation: 'weather',
          city,
          message: errorMessage(error, 'Não foi possível consultar o clima.'),
        });
      }
    }
  }

  async function retry(): Promise<void> {
    const action = retryAction.current;
    if (!action) {
      return;
    }
    if (action.type === 'search') {
      await search(action.query);
    } else {
      await selectCity(action.city);
    }
  }

  return { state, unit, search, selectCity, setUnit, retry };
}
