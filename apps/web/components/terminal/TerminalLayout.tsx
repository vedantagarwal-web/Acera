"use client";
import React from 'react';
import { cn } from '../../lib/cn';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

// Simple glassy container with gradient bg
export default function TerminalLayout({ children }: TerminalLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black',
        'text-zinc-100 p-4'
      )}
    >
      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Acera Terminal</h1>
        <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</a>
      </nav>

      {/* Widget grid */}
      <div className="mx-auto max-w-7xl grid gap-4 md:grid-cols-3 auto-rows-max">
        {children}
      </div>
    </div>
  );
} 