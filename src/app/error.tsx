"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h2 className="text-lg font-semibold text-gray-900">Er is iets misgegaan</h2>
      <p className="mt-2 text-sm text-gray-600">Probeer de pagina te vernieuwen.</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
