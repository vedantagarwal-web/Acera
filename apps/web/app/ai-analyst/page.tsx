'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Download, 
  Search, 
  Loader2,
  Star,
  Target,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface Analyst {
  id: string;
  name: string;
  title: string;
  background: string;
  specialization: string;
  avatar: string;
  rating: number;
  years_experience: number;
}

interface AnalystInsight {
  analyst: string;
  rating: string;
  confidence: number;
  price_target?: number;
  timeframe: string;
  key_insight: string;
  current_price: number;
  last_updated: string;
}

interface MarketData {
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  pe_ratio: number;
  market_cap: string;
}

interface AnalysisResponse {
  symbol: string;
  current_price: number;
  market_data: MarketData;
  analyses: Record<string, AnalystInsight>;
  consensus: {
    rating: string;
    confidence: number;
    avg_price_target: number;
    agreement_level: number;
  };
  news_sentiment: number;
  timestamp: string;
}

interface ReportStatus {
  status: string;
  progress: number;
  estimated_completion?: string;
  download_url?: string;
}

export default function AIAnalystPage() {
  const [analysts, setAnalysts] = useState<Record<string, Analyst>>({});
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAnalysts, setLoadingAnalysts] = useState(true);
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'reports'>('overview');

  // Fetch analyst team on component mount
  useEffect(() => {
    fetchAnalystTeam();
  }, []);

  const fetchAnalystTeam = async () => {
    setLoadingAnalysts(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-analyst/analysts`);
      const data = await response.json();
      setAnalysts(data.analysts || {});
    } catch (error) {
      console.error('Failed to fetch analyst team:', error);
      // Set fallback analysts if API fails
      setAnalysts({
        michael_rodriguez: {
          id: "michael_rodriguez",
          name: "Michael Rodriguez, CFA",
          title: "Managing Director, Equity Research",
          avatar: "👨‍💼",
          background: "20 years at Morgan Stanley Equity Research",
          specialization: "DCF modeling, earnings analysis, sector coverage",
          rating: 4.9,
          years_experience: 20
        },
        sarah_chen: {
          id: "sarah_chen",
          name: "Sarah Chen, CFA",
          title: "Senior Technical Analyst",
          avatar: "👩‍💼",
          background: "15 years at Goldman Sachs Technical Research",
          specialization: "Chart patterns, momentum analysis, support/resistance",
          rating: 4.8,
          years_experience: 15
        },
        elena_volkov: {
          id: "elena_volkov",
          name: "Dr. Elena Volkov",
          title: "Chief Macro Strategist",
          avatar: "🌍",
          background: "Former Federal Reserve economist, 12 years at JPM",
          specialization: "Economic policy, sector rotation, market cycles",
          rating: 4.9,
          years_experience: 12
        },
        david_park: {
          id: "david_park",
          name: "David Park",
          title: "Risk Management Director",
          avatar: "🛡️",
          background: "Former Citadel quantitative analyst, 10 years experience",
          specialization: "VaR modeling, stress testing, portfolio risk",
          rating: 4.7,
          years_experience: 10
        },
        amy_zhang: {
          id: "amy_zhang",
          name: "Dr. Amy Zhang",
          title: "ESG Research Director",
          avatar: "🌱",
          background: "Former BlackRock sustainable investing team, 8 years",
          specialization: "Sustainability analysis, ESG scoring, impact investing",
          rating: 4.8,
          years_experience: 8
        },
        alex_thompson: {
          id: "alex_thompson",
          name: "Alex Thompson",
          title: "Quantitative Analyst",
          avatar: "📊",
          background: "Former Renaissance Technologies, PhD in Mathematics",
          specialization: "Factor models, statistical arbitrage, algorithmic trading",
          rating: 4.9,
          years_experience: 11
        }
      });
    } finally {
      setLoadingAnalysts(false);
    }
  };

  const analyzeStock = async () => {
    if (!selectedSymbol) return;
    
    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-analyst/analysis/quick/${selectedSymbol}`;
      console.log('Making request to:', apiUrl);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setAnalysis(data || null);
    } catch (error) {
      console.error('Failed to analyze stock:', error);
      if (error.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
      }
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedSymbol) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-analyst/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol: selectedSymbol,
          report_type: 'equity_research'
        })
      });
      
      const data = await response.json();
      setReportStatus({ status: 'generating', progress: 0 });
      
      // Poll for status
      pollReportStatus(data.report_id);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const pollReportStatus = async (reportId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-analyst/reports/${reportId}/status`);
        const status = await response.json();
        setReportStatus(status);
        
        if (status.status !== 'completed' && status.status !== 'failed') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Failed to check report status:', error);
      }
    };
    
    poll();
  };

  const getAnalystIcon = (analystId: string) => {
    const icons: Record<string, any> = {
      michael_rodriguez: Building2,
      sarah_chen: BarChart3,
      elena_volkov: Globe,
      david_park: Shield,
      amy_zhang: Star,
      alex_thompson: Zap
    };
    return icons[analystId] || Brain;
  };

  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      'Strong Buy': 'text-green-500 bg-green-500/10',
      'Buy': 'text-green-400 bg-green-400/10',
      'Hold': 'text-yellow-500 bg-yellow-500/10',
      'Sell': 'text-red-400 bg-red-400/10',
      'Strong Sell': 'text-red-500 bg-red-500/10'
    };
    return colors[rating] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-400" />
                AI Research Team
              </h1>
              <p className="text-gray-400 mt-1">Institutional-grade analysis from 6 AI specialists</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Powered by GPT-4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 w-fit">
          {[
            { id: 'overview', label: 'Analyst Team', icon: Users },
            { id: 'analysis', label: 'Quick Analysis', icon: TrendingUp },
            { id: 'reports', label: 'Full Reports', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Platform Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Brain,
                    title: '6 AI Specialists',
                    description: 'Each with unique expertise and backgrounds',
                    color: 'from-blue-500 to-purple-500'
                  },
                  {
                    icon: FileText,
                    title: 'Institutional Reports',
                    description: 'PDF research reports and Excel DCF models',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: Target,
                    title: 'Real-time Analysis',
                    description: 'Live market data and AI-powered insights',
                    color: 'from-pink-500 to-red-500'
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Analyst Team */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Meet the Analyst Team</h2>
                {loadingAnalysts ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-pulse">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(analysts || {}).map(([analystId, analyst], index) => {
                    const Icon = getAnalystIcon(analyst.id || analystId);
                                          return (
                        <motion.div
                          key={analystId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                            {analyst.avatar?.startsWith('http') ? (
                              <img 
                                src={analyst.avatar} 
                                alt={analyst.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                {analyst.avatar || '👤'}
                              </div>
                            )}
                            <div className="w-full h-full items-center justify-center text-2xl hidden">
                              👤
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {analyst.name}
                            </h3>
                            <p className="text-blue-400 text-sm">{analyst.title}</p>
                          </div>
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{analyst.background}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Specialty:</strong> {analyst.specialization}
                        </div>
                      </motion.div>
                    );
                  })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stock Input */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Stock Analysis</h2>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter stock symbol (e.g., AAPL, TSLA, MSFT)"
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={analyzeStock}
                    disabled={!selectedSymbol || loading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              {analysis && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Analysis for {selectedSymbol}</h3>
                    {analysis.current_price && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${analysis.current_price}</div>
                        {analysis.market_data?.change_percent !== undefined && (
                          <div className={`text-sm ${analysis.market_data.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {analysis.market_data.change_percent >= 0 ? '+' : ''}{analysis.market_data.change_percent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Market Data Summary */}
                  {analysis.market_data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Volume</div>
                        <div className="text-white font-medium">
                          {analysis.market_data.volume ? (analysis.market_data.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">P/E Ratio</div>
                        <div className="text-white font-medium">
                          {analysis.market_data.pe_ratio ? analysis.market_data.pe_ratio.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Market Cap</div>
                        <div className="text-white font-medium">
                          {analysis.market_data.market_cap ? 
                            (parseFloat(analysis.market_data.market_cap) / 1000000000).toFixed(1) + 'B' : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">News Items</div>
                        <div className="text-white font-medium">{analysis.news_sentiment || 0}</div>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(analysis?.analyses || {}).map(([analystId, insight]) => {
                      const analystData = Object.values(analysts || {}).find(a => a.name === insight.analyst) || {
                        name: insight.analyst,
                        title: 'AI Analyst',
                        avatar: '🤖'
                      };
                      
                      return (
                        <motion.div
                          key={analystId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                              {analystData.avatar?.startsWith('http') ? (
                                <img 
                                  src={analystData.avatar} 
                                  alt={analystData.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">
                                  {analystData.avatar || '👤'}
                                </div>
                              )}
                              <div className="w-full h-full items-center justify-center text-lg hidden">
                                👤
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{analystData.name}</h4>
                              <p className="text-sm text-gray-400">{analystData.title}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(insight.rating)}`}>
                                {insight.rating}
                              </span>
                              <span className="text-sm text-gray-400">{insight.confidence}% confidence</span>
                            </div>
                            
                            {insight.price_target && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-gray-400">Target:</span>
                                <span className="text-white font-medium">${insight.price_target}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-400">Timeframe:</span>
                              <span className="text-white">{insight.timeframe}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-300">Key Insight:</p>
                              <p className="text-xs text-gray-400">{insight.key_insight}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Report Generation */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Generate Full Research Report</h2>
                <p className="text-gray-400 mb-6">
                  Generate comprehensive institutional-grade research reports including PDF documents and Excel DCF models.
                </p>
                
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter stock symbol for full report"
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={generateReport}
                    disabled={!selectedSymbol || reportStatus?.status === 'generating'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    {reportStatus?.status === 'generating' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Generate Report
                  </button>
                </div>

                {/* Report Status */}
                {reportStatus && (
                  <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {reportStatus.status === 'generating' && <Clock className="w-4 h-4 text-blue-400 animate-pulse" />}
                        {reportStatus.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {reportStatus.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-400" />}
                        <span className="text-white font-medium">
                          Report {reportStatus.status === 'generating' ? 'Generation' : reportStatus.status}
                        </span>
                      </div>
                      {reportStatus.estimated_completion && (
                        <span className="text-sm text-gray-400">
                          ETA: {reportStatus.estimated_completion}
                        </span>
                      )}
                    </div>
                    
                    {reportStatus.status === 'generating' && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${reportStatus.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {reportStatus.status === 'completed' && reportStatus.download_url && (
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                          <Download className="w-4 h-4" />
                          Download PDF Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                          <Download className="w-4 h-4" />
                          Download Excel Model
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Report Features */}
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: FileText,
                    title: 'PDF Research Report',
                    features: [
                      'Executive Summary',
                      'Investment Thesis',
                      'Financial Analysis',
                      'Multi-Analyst Perspectives',
                      'Risk Assessment',
                      'Technical Analysis'
                    ]
                  },
                  {
                    icon: BarChart3,
                    title: 'Excel DCF Model',
                    features: [
                      '5-Year Financial Projections',
                      'DCF Valuation Model',
                      'Sensitivity Analysis',
                      'Peer Comparison',
                      'Assumptions Summary',
                      'Charts & Visualizations'
                    ]
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="w-6 h-6 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {item.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
