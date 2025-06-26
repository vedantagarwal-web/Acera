import { Inter } from 'next/font/google';
import { UserButton, ClerkProvider } from '@clerk/nextjs';
import Link from 'next/link';
import { Search, LineChart, Home } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Acera - Next-Gen Trading Intelligence',
  description: 'AI-powered stock analysis and trading platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div className="min-h-screen bg-[#0B1120]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 border-b border-slate-800 bg-slate-900/75 backdrop-blur z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500">
                        Acera
                      </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <Link
                        href="/"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-300 hover:text-white"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Link>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-300 hover:text-white"
                      >
                        <LineChart className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </div>
                  </div>

                  {/* Search and User */}
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search stocks..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-800 rounded-md leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="ml-4">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="pt-16">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
} 