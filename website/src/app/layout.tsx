import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BeyondAgtest — Open-Source Agentic Mobile App Testing",
    template: "%s | BeyondAgtest",
  },
  description:
    "Find bugs before your users do. Open-source security scanning, code analysis, and automated mobile testing with custom agents and 14-day scheduling.",
  keywords: [
    "mobile testing",
    "security scanning",
    "code analysis",
    "agentic testing",
    "open source",
    "CI/CD",
  ],
  openGraph: {
    title: "BeyondAgtest",
    description: "Open-source agentic mobile app testing.",
    url: "https://beyondagtest.vercel.app",
    siteName: "BeyondAgtest",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-black text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
