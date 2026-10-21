import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { CreateEnquiryModal } from "@/components/enquiries/CreateEnquiryModal";
import { ImportEnquiriesModal } from "@/components/enquiries/ImportEnquiriesModal";
import { ExecutionDrawer } from "@/components/execution/ExecutionDrawer";
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
          <div className="flex h-screen w-full overflow-hidden">
            {/* Persistent Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {children}
              </main>
            </div>
          </div>

          {/* Global Modals & Drawers */}
          <GlobalSearchModal />
          <CreateEnquiryModal />
          <ImportEnquiriesModal />
          <ExecutionDrawer />

          {/* Sonner Toast Notification Host */}
          <Toaster richColors position="top-right" closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
