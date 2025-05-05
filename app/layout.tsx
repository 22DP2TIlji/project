// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import AuthProvider from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ChatBot from '../components/ChatBot'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Travellatvia – Your Dream Adventure',
  description: 'Discover the beauty of Latvia with our travel guides and services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <ChatBot />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
