import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

function cityContext(city: City): string {
  return [city.region, city.country].filter(Boolean).join(', ') || 'Localização não informada';
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-title" className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white" id="city-results-title">
        Escolha uma cidade
      </h2>
      <ul aria-label="Cidades encontradas" className="grid gap-3">
        {cities.map((city) => (
          <li key={`${city.id ?? city.name}-${city.latitude}-${city.longitude}`}>
            <button
              className="flex w-full items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-accent-400/70 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
              onClick={() => onSelect(city)}
              type="button"
            >
              <span>
                <span className="block font-semibold text-white">{city.name}</span>
                <span className="mt-1 block text-sm text-slate-400">{cityContext(city)}</span>
              </span>
              <span aria-hidden="true" className="text-accent-400">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
