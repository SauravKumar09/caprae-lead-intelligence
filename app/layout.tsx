import type { Metadata } from "next";
import "./globals.css";
import TopNav from "../components/TopNav";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "Leadwise — B2B Lead Intelligence & Prioritization",
  description:
    "Turn company data into your next best opportunity. Explainable lead fit scoring, filtering, and pipeline tracking for acquisition teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-900 selection:text-indigo-200">
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <TopNav />
            <div className="flex-1 w-full">
              {children}
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
