import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/50 backdrop-blur border border-slate-800">
        <div className="flex items-center justify-center mb-6">
          <FileQuestion className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Page Not Found</h2>
        <p className="text-slate-400 text-center mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 