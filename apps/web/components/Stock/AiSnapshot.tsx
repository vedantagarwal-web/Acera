export const AiSnapshot = () => (
  <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass p-6 mb-6">
    <h2 className="font-heading text-lg mb-2">AI Snapshot</h2>
    <ul className="list-disc pl-5 mb-4 text-sm">
      <li>Strong revenue growth in last 3 quarters</li>
      <li>Low debt, high ROE</li>
      <li>Positive management commentary</li>
    </ul>
    <div className="flex items-center gap-4 mb-2">
      <span className="text-rose-500 font-heading">Bear</span>
      <input type="range" min={0} max={100} value={72} readOnly className="accent-indigo-500 w-full" />
      <span className="text-emerald-500 font-heading">Bull</span>
    </div>
    <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 font-heading text-xs">Risk: Medium</span>
  </div>
) 