import type { ForecastDay, TemperatureUnit } from '../types/weather';
import ForecastDayItem from './ForecastDayItem';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: TemperatureUnit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-white" id="forecast-title">
        Previsão de 5 dias
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.slice(0, 5).map((day) => (
          <ForecastDayItem day={day} key={day.date} unit={unit} />
        ))}
      </ul>
    </section>
  );
}
