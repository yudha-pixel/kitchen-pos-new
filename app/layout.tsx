import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { ToastProvider } from "@/src/components/ui/Toast";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { PageHeaderProvider } from "@/src/context/PageHeaderContext";
import { AppShell } from "@/src/components/layout/AppShell";
import { CompanyProvider } from "@/src/context/CompanyContext";
import { ShortcutProvider } from "@/src/context/ShortcutContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchen POS",
  description: "POS restoran offline-first untuk kasir, dapur, dan manajemen meja",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <CompanyProvider>
              <ShortcutProvider>
                <ToastProvider>
                  <PageHeaderProvider>
                    <AppShell>{children}</AppShell>
                  </PageHeaderProvider>
                </ToastProvider>
              </ShortcutProvider>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
