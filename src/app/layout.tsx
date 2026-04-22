import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: "Hamro IPO | Bulk Apply NEPSE IPOs",
  description: "Modern, secure bulk IPO application platform for NEPSE investors. Manage multiple demat accounts and apply for shares in one click.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hamro IPO",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <body suppressHydrationWarning className="min-h-screen antialiased selection:bg-emerald-500/30">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  );
}
