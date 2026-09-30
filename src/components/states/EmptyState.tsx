interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center"
      role="status"
    >
      <p className="text-lg font-semibold text-white">Nenhuma cidade encontrada</p>
      <p className="mt-2 text-slate-400">Não encontramos resultados para “{query}”.</p>
    </div>
  );
}
