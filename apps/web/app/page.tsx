'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LineChart, Brain, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Next-Gen Trading Intelligence
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Harness the power of AI and real-time market data for smarter trading decisions
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: LineChart,
                title: "Real-Time Analytics",
                description: "Advanced charting and technical analysis tools powered by cutting-edge algorithms"
              },
              {
                icon: Brain,
                title: "AI Insights",
                description: "Leverage OpenAI's powerful models for market analysis and trading recommendations"
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Comprehensive market data and news coverage from trusted sources worldwide"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl bg-slate-900/50 backdrop-blur border border-slate-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <feature.icon className="w-12 h-12 text-indigo-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 