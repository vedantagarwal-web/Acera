export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
} 