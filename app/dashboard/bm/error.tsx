"use client";


interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">Something went wrong!</h1>

      <p className="text-sm text-gray-500">{error.message}</p>

      <button onClick={() => reset()} className="btn btn-primary">
        Try again
      </button>
    </main>
  );
}
