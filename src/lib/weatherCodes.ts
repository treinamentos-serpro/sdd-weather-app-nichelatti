export interface WeatherCondition {
  label: string;
  icon: string;
}

const UNKNOWN_CONDITION: WeatherCondition = {
  label: 'Condição desconhecida',
  icon: 'unknown',
};

export const WEATHER_CONDITIONS: Readonly<Record<number, WeatherCondition>> = {
  0: { label: 'Céu limpo', icon: 'clear-day' },
  1: { label: 'Predominantemente limpo', icon: 'mostly-clear' },
  2: { label: 'Parcialmente nublado', icon: 'partly-cloudy' },
  3: { label: 'Nublado', icon: 'cloudy' },
  45: { label: 'Nevoeiro', icon: 'fog' },
  48: { label: 'Nevoeiro com geada', icon: 'fog' },
  51: { label: 'Garoa fraca', icon: 'drizzle' },
  53: { label: 'Garoa moderada', icon: 'drizzle' },
  55: { label: 'Garoa intensa', icon: 'drizzle' },
  56: { label: 'Garoa congelante fraca', icon: 'freezing-drizzle' },
  57: { label: 'Garoa congelante intensa', icon: 'freezing-drizzle' },
  61: { label: 'Chuva fraca', icon: 'rain' },
  63: { label: 'Chuva moderada', icon: 'rain' },
  65: { label: 'Chuva intensa', icon: 'rain' },
  66: { label: 'Chuva congelante fraca', icon: 'freezing-rain' },
  67: { label: 'Chuva congelante intensa', icon: 'freezing-rain' },
  71: { label: 'Neve fraca', icon: 'snow' },
  73: { label: 'Neve moderada', icon: 'snow' },
  75: { label: 'Neve intensa', icon: 'snow' },
  77: { label: 'Grãos de neve', icon: 'snow' },
  80: { label: 'Pancadas de chuva fracas', icon: 'showers' },
  81: { label: 'Pancadas de chuva moderadas', icon: 'showers' },
  82: { label: 'Pancadas de chuva intensas', icon: 'showers' },
  85: { label: 'Pancadas de neve fracas', icon: 'snow-showers' },
  86: { label: 'Pancadas de neve intensas', icon: 'snow-showers' },
  95: { label: 'Trovoada', icon: 'thunderstorm' },
  96: { label: 'Trovoada com granizo fraco', icon: 'thunderstorm-hail' },
  99: { label: 'Trovoada com granizo intenso', icon: 'thunderstorm-hail' },
};

export function getWeatherCondition(code: number): WeatherCondition {
  return WEATHER_CONDITIONS[code] ?? UNKNOWN_CONDITION;
}
