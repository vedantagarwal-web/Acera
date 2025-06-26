import { useState } from 'react'

const presentations = [
  { title: 'Q4 FY24 Results', cover: 'https://placehold.co/120x160/6366F1/fff?text=PDF', url: '#' },
  { title: 'Investor Day', cover: 'https://placehold.co/120x160/22C55E/fff?text=PDF', url: '#' },
]

export const PresentationsCarousel = () => {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass p-6 mb-6">
      <h2 className="font-heading text-lg mb-2">Presentations</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {presentations.map((p, i) => (
          <div key={p.title} className="min-w-[120px] cursor-pointer" onClick={() => setOpen(i)}>
            <img src={p.cover} alt={p.title} className="rounded-xl shadow-glass mb-2" />
            <div className="text-xs text-slate-200 font-heading text-center">{p.title}</div>
          </div>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOpen(null)}>
          <div className="bg-white/10 rounded-2xl p-6 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-slate-100" onClick={() => setOpen(null)}>&times;</button>
            <img src={presentations[open].cover} alt={presentations[open].title} className="mx-auto mb-4 rounded-xl" />
            <div className="text-center text-lg font-heading mb-2">{presentations[open].title}</div>
            <div className="text-center text-slate-300">PDF preview coming soon…</div>
          </div>
        </div>
      )}
    </div>
  )
} 