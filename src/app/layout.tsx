import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { clientConfig } from '@/config/client.config';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const { nombre, profesion, descripcion } = clientConfig.negocio;

export const metadata: Metadata = {
  title: {
    default: `${nombre} — ${profesion}`,
    template: `%s | ${nombre}`,
  },
  description: descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
