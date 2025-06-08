import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation/Navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Boolean Simplify",
  description: "Generate boolean equations from truth table",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <Navigation />
          <main>
            {children}
          </main>
          <footer>
            <p>© 2025 Boolean Simplify by <a href="https://github.com/abrarshakhi" target="_blank" rel="noopener noreferrer">AbrarShakhi</a>. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
