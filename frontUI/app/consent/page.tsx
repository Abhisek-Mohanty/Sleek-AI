import React, { Suspense } from "react";
import { PanConsentPortal } from "@/components/portal/PanConsentPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PAN Verification & Loan Analysis Authorization | Sleek AI",
  description: "Securely authorize your PAN and CRIF bureau soft check to receive your personalized Loan Analysis Report via email.",
};

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-xs font-semibold text-slate-500 animate-pulse">
            Loading secure verification portal...
          </div>
        </div>
      }
    >
      <PanConsentPortal />
    </Suspense>
  );
}
