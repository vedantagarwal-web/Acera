'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Zap, Shield, BarChart3, Users, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-3/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Acera
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <Link
            href="/dashboard"
            className="px-6 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Dashboard
          </Link>
          <Link
            href="/ai-analyst"
            className="px-6 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            AI Analysts
          </Link>
          <Link
            href="/terminal"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Terminal
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-8">
              <Brain className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">AI-Powered Trading Intelligence</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Retail Trading
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Democratizing institutional-grade analysis with AI-powered insights. 
            Get Wall Street analyst coverage for every stock, comprehensive earnings analysis, 
            and real-time market intelligence - all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/dashboard"
              className="group flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="font-semibold mr-2">Start Trading</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="group flex items-center px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Play className="w-5 h-5 mr-2" />
              <span className="font-semibold">Watch Demo</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: 'AI Analysts', value: '6+' },
              { label: 'Market Coverage', value: '100%' },
              { label: 'Response Time', value: '<2s' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Terminal Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl transform scale-110" />
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-300 font-medium">Acera Terminal</span>
                </div>
                <div className="text-sm text-gray-400">Market Open • Live Data</div>
              </div>

              {/* Terminal Content Preview */}
              <div className="p-6 h-96 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
                <div className="grid grid-cols-3 gap-6 h-full">
                  {/* Market Overview */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400 mb-3">Market Overview</div>
                    <div className="space-y-2">
                      {['SPY', 'QQQ', 'IWM'].map((symbol, i) => (
                        <div key={symbol} className="flex justify-between items-center">
                          <span className="text-white font-medium">{symbol}</span>
                          <span className="text-green-400">+1.2%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400 mb-3">AI Insights</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">AAPL: Strong Buy</span>
                      </div>
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-sm text-gray-300">MSFT: Hold</span>
                      </div>
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-sm text-gray-300">GOOGL: Buy</span>
                      </div>
                    </div>
                  </div>

                  {/* News Feed */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400 mb-3">Latest News</div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-300">Fed signals rate cuts ahead</div>
                      <div className="text-xs text-gray-300">Tech earnings beat expectations</div>
                      <div className="text-xs text-gray-300">Oil prices surge on supply concerns</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Institutional Features
              </span>
              <br />
              <span className="text-white">For Retail Investors</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to make informed investment decisions, powered by AI and real-time data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI Wall Street Analysts',
                description: 'Get institutional-grade analysis from AI analysts specialized in different sectors.',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: TrendingUp,
                title: 'Real-Time Market Data',
                description: 'Live quotes, charts, and market intelligence powered by Alpha Vantage.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: BarChart3,
                title: 'Advanced Charting',
                description: 'Professional-grade charts with technical indicators and pattern recognition.',
                gradient: 'from-pink-500 to-red-500'
              },
              {
                icon: Zap,
                title: 'Earnings Intelligence',
                description: 'AI-powered earnings analysis, summaries, and call transcription.',
                gradient: 'from-green-500 to-blue-500'
              },
              {
                icon: Shield,
                title: 'Risk Assessment',
                description: 'Comprehensive risk analysis and portfolio optimization recommendations.',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Users,
                title: 'Collaborative Platform',
                description: 'Share insights, follow other traders, and learn from the community.',
                gradient: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Trade Like
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Wall Street?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of retail investors who are already using AI to make smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="font-semibold mr-2">Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Acera
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Democratizing institutional-grade trading analysis with AI-powered insights for retail investors.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Made with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span className="text-gray-400">in Berkeley, California</span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Product</h3>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">Dashboard</Link>
                <Link href="/ai-analyst" className="block text-gray-400 hover:text-white transition-colors text-sm">AI Analysts</Link>
                <Link href="/terminal" className="block text-gray-400 hover:text-white transition-colors text-sm">Trading Terminal</Link>
                <Link href="/stocks" className="block text-gray-400 hover:text-white transition-colors text-sm">Stock Analysis</Link>
                <Link href="/api" className="block text-gray-400 hover:text-white transition-colors text-sm">API Access</Link>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Mobile App</a>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Resources</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">API Reference</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Tutorials</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Community</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Support Center</a>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Legal</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Risk Disclosure</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Regulatory Info</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">FINRA BrokerCheck</a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              {/* Copyright & Disclaimers */}
              <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-xs text-gray-400">
                <span>© 2024 Acera Technologies, Inc. All rights reserved.</span>
                <span>Securities offered through Acera Securities LLC, member FINRA/SIPC</span>
              </div>

              {/* Social Links & Contact */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <a href="mailto:support@acera.ai" className="text-gray-400 hover:text-white transition-colors text-sm">
                    support@acera.ai
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="tel:+1-510-555-0123" className="text-gray-400 hover:text-white transition-colors text-sm">
                    (510) 555-0123
                  </a>
                </div>
              </div>
            </div>

            {/* Important Disclaimers */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Investment Disclaimer:</strong> All investments involve risk and may result in loss. 
                Past performance does not guarantee future results. The information provided by Acera is for educational purposes only 
                and should not be considered as personalized investment advice. Please consult with a qualified financial advisor 
                before making investment decisions. AI-generated insights are based on historical data and market analysis but cannot 
                predict future market movements with certainty.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 