import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';

export default function App() {
  const weather = useWeather();
  const { state } = weather;
  const isBusy = state.status === 'searching' || state.status === 'loadingWeather';

  return (
    <div className="min-h-screen bg-night-900 text-slate-100">
      <header className="border-b border-white/10 bg-night-800/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
              WeatherView
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">Consulte o clima</h1>
          </div>
          <UnitToggle onChange={weather.setUnit} unit={weather.unit} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <SearchBar disabled={isBusy} onSearch={weather.search} />
        {state.status === 'searching' && <LoadingState message="Buscando cidades..." />}
        {state.status === 'loadingWeather' && (
          <LoadingState message={`Consultando o clima de ${state.city.name}...`} />
        )}
        {state.status === 'empty' && (
          <div className="mt-6">
            <EmptyState query={state.query} />
          </div>
        )}
        {state.status === 'error' && (
          <div className="mt-6">
            <ErrorState message={state.message} onRetry={weather.retry} />
          </div>
        )}
        {state.status === 'selectingCity' && (
          <CityResults cities={state.cities} onSelect={weather.selectCity} />
        )}
        {state.status === 'success' && (
          <div className="mt-8">
            <CurrentWeather
              city={state.data.city}
              current={state.data.current}
              unit={weather.unit}
            />
            <ForecastList forecast={state.data.forecast} unit={weather.unit} />
          </div>
        )}
        {state.status === 'idle' && (
          <p className="mt-16 text-center text-slate-400">Digite uma cidade para começar.</p>
        )}
      </main>
    </div>
  );
}
