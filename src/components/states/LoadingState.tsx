interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      aria-label={message}
      className="py-12 text-center text-slate-300"
      role="status"
    >
      <span
        aria-hidden="true"
        className="mb-3 inline-block h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <p>{message}</p>
    </div>
  );
}
