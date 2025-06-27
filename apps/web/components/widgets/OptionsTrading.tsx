'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Calculator, Zap, Settings, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface OptionData {
  strike: number;
  call: {
    price: number;
    bid: number;
    ask: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  put: {
    price: number;
    bid: number;
    ask: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

interface OptionsChainProps {
  symbol?: string;
  expirationDate?: string;
}

// Generate mock options data
const generateOptionsChain = (underlyingPrice: number): OptionData[] => {
  const options: OptionData[] = [];
  const strikes = [];
  
  // Generate strikes around the underlying price
  for (let i = -5; i <= 5; i++) {
    strikes.push(Math.round((underlyingPrice + i * 5) / 5) * 5);
  }
  
  strikes.forEach(strike => {
    const isITM_Call = strike < underlyingPrice;
    const isITM_Put = strike > underlyingPrice;
    const moneyness_Call = strike / underlyingPrice;
    const moneyness_Put = underlyingPrice / strike;
    
    // Calculate option prices using simplified Black-Scholes approximation
    const timeToExpiry = 30 / 365; // 30 days
    const riskFreeRate = 0.05;
    const volatility = 0.25;
    
    const callPrice = Math.max(underlyingPrice - strike, 0) + (isITM_Call ? Math.random() * 2 : Math.random() * 0.5);
    const putPrice = Math.max(strike - underlyingPrice, 0) + (isITM_Put ? Math.random() * 2 : Math.random() * 0.5);
    
    options.push({
      strike,
      call: {
        price: callPrice,
        bid: callPrice - 0.05,
        ask: callPrice + 0.05,
        volume: Math.floor(Math.random() * 1000) + 50,
        openInterest: Math.floor(Math.random() * 5000) + 100,
        impliedVolatility: volatility + (Math.random() - 0.5) * 0.1,
        delta: Math.min(Math.max(0.1 + (isITM_Call ? 0.4 : 0.1) + Math.random() * 0.3, 0), 1),
        gamma: Math.random() * 0.05,
        theta: -(Math.random() * 0.02),
        vega: Math.random() * 0.15
      },
      put: {
        price: putPrice,
        bid: putPrice - 0.05,
        ask: putPrice + 0.05,
        volume: Math.floor(Math.random() * 1000) + 50,
        openInterest: Math.floor(Math.random() * 5000) + 100,
        impliedVolatility: volatility + (Math.random() - 0.5) * 0.1,
        delta: -Math.min(Math.max(0.1 + (isITM_Put ? 0.4 : 0.1) + Math.random() * 0.3, 0), 1),
        gamma: Math.random() * 0.05,
        theta: -(Math.random() * 0.02),
        vega: Math.random() * 0.15
      }
    });
  });
  
  return options.sort((a, b) => a.strike - b.strike);
};

export function OptionsTrading({ symbol = 'AAPL', expirationDate = '2024-02-16' }: OptionsChainProps) {
  const [optionsData, setOptionsData] = useState<OptionData[]>([]);
  const [underlyingPrice, setUnderlyingPrice] = useState(187.45);
  const [selectedView, setSelectedView] = useState<'chain' | 'greeks' | 'strategy'>('chain');
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<{ type: 'call' | 'put'; strike: number } | null>(null);

  useEffect(() => {
    const fetchOptionsData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = generateOptionsChain(underlyingPrice);
        setOptionsData(mockData);
      } catch (error) {
        console.error('Error fetching options data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOptionsData, 30000);
    return () => clearInterval(interval);
  }, [symbol, expirationDate, underlyingPrice]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatGreek = (value: number) => value.toFixed(3);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/70">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">Options Trading</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="h-64 bg-white/5 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const renderOptionsChain = () => (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 text-xs text-white/50 pb-2 border-b border-white/10">
        <div className="text-center">Strike</div>
        <div className="text-center">Call Bid</div>
        <div className="text-center">Call Ask</div>
        <div className="text-center">Call Vol</div>
        <div className="text-center">Put Vol</div>
        <div className="text-center">Put Bid</div>
        <div className="text-center">Put Ask</div>
      </div>

      {/* Options Chain */}
      <div className="max-h-40 overflow-y-auto space-y-1">
        {optionsData.map((option) => {
          const isATM = Math.abs(option.strike - underlyingPrice) < 2.5;
          const callITM = option.strike < underlyingPrice;
          const putITM = option.strike > underlyingPrice;
          
          return (
            <div
              key={option.strike}
              className={`grid grid-cols-7 gap-1 text-xs p-1 rounded transition-colors hover:bg-white/5 ${
                isATM ? 'bg-blue-500/10 border border-blue-500/20' : ''
              }`}
            >
              {/* Strike */}
              <div className="text-center text-white font-medium">
                {option.strike}
                {isATM && <div className="text-xs text-blue-400">ATM</div>}
              </div>
              
              {/* Call Options */}
              <button
                onClick={() => setSelectedOption({ type: 'call', strike: option.strike })}
                className={`text-center p-1 rounded transition-colors hover:bg-emerald-500/20 ${
                  callITM ? 'text-emerald-400' : 'text-white/70'
                }`}
              >
                {formatPrice(option.call.bid)}
              </button>
              <button
                onClick={() => setSelectedOption({ type: 'call', strike: option.strike })}
                className={`text-center p-1 rounded transition-colors hover:bg-emerald-500/20 ${
                  callITM ? 'text-emerald-400' : 'text-white/70'
                }`}
              >
                {formatPrice(option.call.ask)}
              </button>
              <div className={`text-center ${callITM ? 'text-emerald-400' : 'text-white/50'}`}>
                {option.call.volume}
              </div>
              
              {/* Put Options */}
              <div className={`text-center ${putITM ? 'text-red-400' : 'text-white/50'}`}>
                {option.put.volume}
              </div>
              <button
                onClick={() => setSelectedOption({ type: 'put', strike: option.strike })}
                className={`text-center p-1 rounded transition-colors hover:bg-red-500/20 ${
                  putITM ? 'text-red-400' : 'text-white/70'
                }`}
              >
                {formatPrice(option.put.bid)}
              </button>
              <button
                onClick={() => setSelectedOption({ type: 'put', strike: option.strike })}
                className={`text-center p-1 rounded transition-colors hover:bg-red-500/20 ${
                  putITM ? 'text-red-400' : 'text-white/70'
                }`}
              >
                {formatPrice(option.put.ask)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGreeks = () => {
    const greeksData = optionsData.map(option => ({
      strike: option.strike,
      callDelta: option.call.delta,
      putDelta: Math.abs(option.put.delta),
      callGamma: option.call.gamma,
      putGamma: option.put.gamma,
      callTheta: option.call.theta,
      putTheta: option.put.theta
    }));

    return (
      <div className="space-y-4">
        {/* Delta Chart */}
        <div>
          <h4 className="text-xs text-white/70 mb-2">Delta Distribution</h4>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={greeksData}>
                <XAxis dataKey="strike" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
                <Line type="monotone" dataKey="callDelta" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="putDelta" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gamma Chart */}
        <div>
          <h4 className="text-xs text-white/70 mb-2">Gamma Profile</h4>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={greeksData}>
                <XAxis dataKey="strike" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
                <Bar dataKey="callGamma" fill="#6366F1" fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategyBuilder = () => (
    <div className="space-y-3">
      <div className="text-xs text-white/70">Strategy Builder</div>
      <div className="grid grid-cols-2 gap-2">
        <button className="p-2 rounded bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
          Long Call
        </button>
        <button className="p-2 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
          Long Put
        </button>
        <button className="p-2 rounded bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors">
          Call Spread
        </button>
        <button className="p-2 rounded bg-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/30 transition-colors">
          Iron Condor
        </button>
      </div>
      <div className="text-xs text-white/30 text-center mt-4">
        Select a strategy to analyze P&L
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Options Trading</span>
          <span className="text-xs text-white/50">{symbol}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-white">{formatPrice(underlyingPrice)}</div>
          <div className="text-xs text-white/50">Underlying</div>
        </div>
      </div>

      {/* Expiration Date */}
      <div className="flex items-center justify-between p-2 rounded bg-white/5">
        <span className="text-xs text-white/70">Expiration:</span>
        <span className="text-xs text-white">{expirationDate}</span>
      </div>

      {/* View Selector */}
      <div className="flex rounded-lg bg-white/5 p-1">
        {[
          { key: 'chain', label: 'Chain', icon: Target },
          { key: 'greeks', label: 'Greeks', icon: Calculator },
          { key: 'strategy', label: 'Strategy', icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-all ${
              selectedView === key
                ? 'bg-blue-500 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-48">
        {selectedView === 'chain' && renderOptionsChain()}
        {selectedView === 'greeks' && renderGreeks()}
        {selectedView === 'strategy' && renderStrategyBuilder()}
      </div>

      {/* Selected Option Details */}
      {selectedOption && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white">
              {symbol} {selectedOption.strike} {selectedOption.type.toUpperCase()}
            </span>
            <button
              onClick={() => setSelectedOption(null)}
              className="text-xs text-white/50 hover:text-white/70"
            >
              ✕
            </button>
          </div>
          {(() => {
            const option = optionsData.find(o => o.strike === selectedOption.strike);
            if (!option) return null;
            
            const data = selectedOption.type === 'call' ? option.call : option.put;
            
            return (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/50">Price:</span>
                  <span className="text-white ml-1">{formatPrice(data.price)}</span>
                </div>
                <div>
                  <span className="text-white/50">IV:</span>
                  <span className="text-white ml-1">{formatPercent(data.impliedVolatility)}</span>
                </div>
                <div>
                  <span className="text-white/50">Delta:</span>
                  <span className="text-white ml-1">{formatGreek(data.delta)}</span>
                </div>
                <div>
                  <span className="text-white/50">Gamma:</span>
                  <span className="text-white ml-1">{formatGreek(data.gamma)}</span>
                </div>
                <div>
                  <span className="text-white/50">Theta:</span>
                  <span className="text-red-400 ml-1">{formatGreek(data.theta)}</span>
                </div>
                <div>
                  <span className="text-white/50">Vega:</span>
                  <span className="text-white ml-1">{formatGreek(data.vega)}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 