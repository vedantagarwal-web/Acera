import { Inter } from 'next/font/google';
import { UserButton, ClerkProvider } from '@clerk/nextjs';
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
            {/* Main Content */}
            <main>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
} 