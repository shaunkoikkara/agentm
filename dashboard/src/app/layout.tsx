import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { RegisterSW } from '@/components/RegisterSW';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
};

export const metadata: Metadata = {
  title: 'AgentM - AI Receptionist Dashboard',
  description: 'Manage your WhatsApp AI Receptionist platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgentM',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased font-sans">
        <RegisterSW />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
