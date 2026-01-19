"use client";

import Button from "./_components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4">
      <h1 className="text-3xl font-semibold text-center">
        Something went wrong!
      </h1>

      <p className="text-sm text-gray-500">{error.message}</p>

      <Button  variant="tertiary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
