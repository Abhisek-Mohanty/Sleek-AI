import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sleek-AI Powered Sales Funnel Management Portal",
  description:
    "Import enquiries, generate AI-powered sales funnels, execute steps with intelligence, and track conversion progress seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-slate-900 font-sans`}
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
          {/* Sonner Toast Notification Host */}
          <Toaster richColors position="top-right" closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
