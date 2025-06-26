import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line } from 'recharts'

const data = [
  { time: '10:00', open: 320, close: 325, high: 330, low: 318, volume: 120 },
  { time: '10:30', open: 325, close: 327, high: 329, low: 324, volume: 90 },
  { time: '11:00', open: 327, close: 322, high: 328, low: 320, volume: 110 },
  { time: '11:30', open: 322, close: 328, high: 330, low: 321, volume: 130 },
]

export const PriceChart = () => (
  <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass p-6 mb-6">
    <h2 className="font-heading text-lg mb-2">Price Chart</h2>
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fontFamily: 'Sora', fill: '#FBBF24' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'Sora', fill: '#22C55E' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', borderRadius: 12, border: '1px solid #6366F1' }} />
        <Bar dataKey="volume" barSize={8} fill="#6366F1" opacity={0.2} />
        <Line type="monotone" dataKey="close" stroke="#22C55E" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
) 