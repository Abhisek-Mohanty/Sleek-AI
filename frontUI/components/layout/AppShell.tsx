"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { CreateEnquiryModal } from "@/components/enquiries/CreateEnquiryModal";
import { ImportEnquiriesModal } from "@/components/enquiries/ImportEnquiriesModal";
import { ExecutionDrawer } from "@/components/execution/ExecutionDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCustomerPortal =
    pathname?.startsWith("/consent") ||
    pathname?.startsWith("/verify-pan") ||
    pathname?.startsWith("/portal");

  if (isCustomerPortal) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 overflow-y-auto">
        {children}
      </main>
    );
  }

  return (
    <>
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
    </>
  );
}
