export const FundamentalsGrid = () => (
  <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass p-6 mb-6">
    <h2 className="font-heading text-lg mb-2">Fundamentals</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-slate-400">ROE</div>
        <div className="font-heading text-lg">23.1%</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">ROCE</div>
        <div className="font-heading text-lg">19.7%</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">D/E</div>
        <div className="font-heading text-lg">0.12</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">EPS Growth</div>
        <div className="font-heading text-lg">14.5%</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">P/E</div>
        <div className="font-heading text-lg">28.4</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">Market Cap</div>
        <div className="font-heading text-lg">₹12.3T</div>
      </div>
    </div>
  </div>
) 