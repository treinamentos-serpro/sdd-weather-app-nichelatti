import { formatDate } from '../lib/formatDate';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, TemperatureUnit } from '../types/weather';

interface ForecastDayItemProps {
  day: ForecastDay;
  unit: TemperatureUnit;
}

export default function ForecastDayItem({ day, unit }: ForecastDayItemProps) {
  const condition = getWeatherCondition(day.weatherCode);
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className="text-sm font-semibold capitalize text-white">{formatDate(day.date)}</p>
      <p className="mt-3 text-sm text-slate-400">{condition.label}</p>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-semibold text-white">
          {formatTemperature(day.maxTemperatureC, unit)}
        </span>
        <span className="text-sm text-slate-400">
          {formatTemperature(day.minTemperatureC, unit)}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-300">
        Chuva:{' '}
        {day.precipitationProbability === undefined
          ? 'Indisponível'
          : `${day.precipitationProbability}%`}
      </p>
    </li>
  );
}
