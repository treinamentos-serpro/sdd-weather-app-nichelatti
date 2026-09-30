export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC?: number;
  relativeHumidity?: number;
  windSpeed?: number;
  surfacePressure?: number;
  precipitation?: number;
  weatherCode: number;
  observedAt: string;
}

export interface ForecastDay {
  date: string;
  minTemperatureC?: number;
  maxTemperatureC?: number;
  precipitationProbability?: number;
  weatherCode: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
