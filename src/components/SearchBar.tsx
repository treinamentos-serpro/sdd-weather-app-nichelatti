import type { FormEvent } from 'react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar cidade"
    >
      <label className="sr-only" htmlFor="city-search">
        Nome da cidade
      </label>
      <input
        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus-visible:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        id="city-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Digite uma cidade"
        type="search"
        value={query}
      />
      <button
        className="rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition hover:bg-accent-500 hover:text-night-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
