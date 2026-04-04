'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Error</h1>
      <p className="text-muted-foreground">Algo salió mal</p>
      <button
        onClick={reset}
        className="text-primary underline"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
