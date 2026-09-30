import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, TemperatureUnit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const formatMetric = (value: number | undefined, suffix: string) =>
    value === undefined ? 'Indisponível' : `${value}${suffix}`;
  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-400">
            Clima atual
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white" id="current-weather-title">
            {city.name}
          </h2>
          <p className="mt-1 text-slate-400">
            {[city.region, city.country].filter(Boolean).join(', ')}
          </p>
        </div>
        <span aria-hidden="true" className="text-4xl" title={condition.label}>
          {condition.icon === 'clear-day' ? '☀' : '☁'}
        </span>
      </div>
      <div className="mt-8 flex flex-wrap items-end gap-4">
        <p
          className="text-6xl font-bold tracking-tight text-white"
          data-testid="current-temperature"
        >
          {formatTemperature(current.temperatureC, unit)}
        </p>
        <p className="pb-2 text-lg text-slate-300">{condition.label}</p>
      </div>
      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Umidade</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.relativeHumidity, '%')}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Vento</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.windSpeed, ' km/h')}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Pressão</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.surfacePressure, ' hPa')}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Precipitação</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.precipitation, ' mm')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
