interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-8 text-center"
      role="alert"
    >
      <p className="font-semibold text-red-100">Não foi possível concluir a consulta</p>
      <p className="mt-2 text-red-100">{message}</p>
      <button
        className="mt-5 rounded-lg border border-red-200/30 px-4 py-2 font-semibold text-red-50 hover:bg-red-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
