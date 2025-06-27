'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Brain, Newspaper, Table } from 'lucide-react';
import { useStock } from '@/hooks/useStock';

interface PageProps {
  params: { symbol: string };
}

export default function StockPage({ params }: PageProps) {
  const { data, loading, error } = useStock(params.symbol, 'NSE', true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white p-6 flex items-center justify-center">
        <div className="text-red-500">Error loading stock data</div>
      </div>
    );
  }

  const { stock, options } = data;

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{params.symbol.toUpperCase()}</h1>
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stock.change >= 0 ? (
                <TrendingUp className="w-5 h-5 mr-1" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-1" />
              )}
              {stock.change_percent.toFixed(2)}%
            </span>
            <span className="text-xl font-semibold">₹{stock.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Main Chart */}
        <Card className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={[
              { time: 'Open', value: stock.open },
              { time: 'Current', value: stock.price },
            ]}>
              <XAxis dataKey="time" stroke="#4B5563" />
              <YAxis stroke="#4B5563" domain={['dataMin', 'dataMax']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366F1" 
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="options">Options Chain</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Market Cap', value: stock.market_cap || 'N/A' },
                { label: 'P/E Ratio', value: stock.pe_ratio?.toFixed(2) || 'N/A' },
                { label: 'Volume', value: stock.volume.toLocaleString() },
                { label: 'Face Value', value: stock.face_value ? `₹${stock.face_value}` : 'N/A' },
                { label: 'Day High', value: `₹${stock.high.toFixed(2)}` },
                { label: 'Day Low', value: `₹${stock.low.toFixed(2)}` },
                { label: 'Open', value: `₹${stock.open.toFixed(2)}` },
                { label: 'Prev Close', value: `₹${stock.prev_close.toFixed(2)}` },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                  <div className="text-xl font-semibold mt-1">{stat.value}</div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options">
            {options ? (
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Table className="w-6 h-6 text-indigo-500 mr-2" />
                  <h2 className="text-xl font-semibold">Options Chain</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-right">Strike</th>
                        <th className="px-4 py-2 text-right">Last Price</th>
                        <th className="px-4 py-2 text-right">Change</th>
                        <th className="px-4 py-2 text-right">OI</th>
                        <th className="px-4 py-2 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.map((option, index) => (
                        <motion.tr
                          key={index}
                          className="border-b border-slate-800 hover:bg-slate-800/50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              option.type === 'CE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {option.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">₹{option.strike.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">₹{option.last_price.toFixed(2)}</td>
                          <td className={`px-4 py-2 text-right ${option.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {option.change >= 0 ? '+' : ''}{option.change.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2 text-right">{option.oi.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">{option.volume.toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-slate-400">
                No options data available
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 