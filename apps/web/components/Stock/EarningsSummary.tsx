import { useState } from 'react'

const earnings = [
  {
    qtr: 'Q4 FY24',
    kpis: [
      { label: 'Revenue', value: '+7% YoY', color: 'emerald' },
      { label: 'EBITDA', value: '+5% YoY', color: 'emerald' },
      { label: 'PAT', value: '+4% YoY', color: 'emerald' },
    ],
    points: [
      'Strong demand in BFSI segment',
      'Margins improved 80bps',
      'Attrition at 12%, lowest in 3 years',
      'Order book at all-time high',
      'Positive management outlook',
    ],
    sentiment: 0.7,
  },
  {
    qtr: 'Q3 FY24',
    kpis: [
      { label: 'Revenue', value: '+5% YoY', color: 'emerald' },
      { label: 'EBITDA', value: '+3% YoY', color: 'emerald' },
      { label: 'PAT', value: '+2% YoY', color: 'amber' },
    ],
    points: [
      'Steady growth in digital services',
      'Margins stable',
      'Attrition at 13%',
      'Strong deal pipeline',
      'Cautious commentary on Europe',
    ],
    sentiment: 0.4,
  },
]

export const EarningsSummary = () => {
  const [open, setOpen] = useState(0)
  return (
    <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass p-6 mb-6">
      <h2 className="font-heading text-lg mb-2">Earnings Summary</h2>
      <div>
        {earnings.map((e, i) => (
          <div key={e.qtr} className="mb-4">
            <button
              className="w-full text-left font-heading text-base py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              {e.qtr}
            </button>
            {open === i && (
              <div className="mt-2 pl-3">
                <div className="flex gap-2 mb-2">
                  {e.kpis.map((k) => (
                    <span key={k.label} className={`px-2 py-1 rounded-full text-xs font-heading bg-${k.color}-500/20 text-${k.color}-500`}>
                      {k.label}: {k.value}
                    </span>
                  ))}
                </div>
                <ul className="list-disc pl-5 text-sm mb-2">
                  {e.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <div className="h-2 rounded bg-slate-800 overflow-hidden">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${Math.round((e.sentiment + 1) * 50)}%`,
                      background: `linear-gradient(90deg, #FB7185 0%, #6366F1 50%, #22C55E 100%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 