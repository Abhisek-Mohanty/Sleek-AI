import React, { Suspense } from "react";
import { PanConsentPortal } from "@/components/portal/PanConsentPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer PAN & Consent Portal | Sleek AI",
  description: "Secure PAN submission portal to receive your complimentary Loan Analysis Report.",
};

export default function PortalVerificationPage() {
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
