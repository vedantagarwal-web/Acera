'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/50 backdrop-blur border border-slate-800">
        <div className="flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Something went wrong!</h2>
        <p className="text-slate-400 text-center mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 text-sm font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
} 