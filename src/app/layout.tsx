import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PayGuard — AI Payroll Fraud & Wage Theft Detector",
  description:
    "Are you being underpaid? Upload your pay stub and find out in 60 seconds. AI-powered analysis against federal and state labor laws.",
  keywords: ["payroll fraud", "wage theft", "pay stub analyzer", "labor law", "overtime", "minimum wage"],
  openGraph: {
    title: "PayGuard — Are You Being Underpaid?",
    description: "Upload your pay stub. Get answers in 60 seconds.",
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
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
